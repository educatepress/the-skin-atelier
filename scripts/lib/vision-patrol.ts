import * as fs from 'fs';
import * as path from 'path';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import { QueueItem } from '../auto-publish/send-slack-approval'; // We will export this from send-slack-approval

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env.local') });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const OUT_DIR = path.join(process.cwd(), 'out');

export interface VisionCheckResult {
  status: 'pass' | 'warning';
  feedback: string;
}

/**
 * Run Gemini Vision check on generated visual assets
 */
export async function runVisionCheck(item: Pick<QueueItem, 'type' | 'slug' | 'id'>): Promise<VisionCheckResult> {
  if (item.type === 'carousel') {
    return checkCarouselStatic(item.slug);
  } else if (item.type === 'reel') {
    return checkReelDynamic(item.slug);
  }
  return { status: 'pass', feedback: '' };
}

async function checkCarouselStatic(slug: string): Promise<VisionCheckResult> {
  const carouselDir = path.join(OUT_DIR, `carousel-${slug}`);
  if (!fs.existsSync(carouselDir)) {
    return { status: 'warning', feedback: `ディレクトリが見つかりません: ${carouselDir}` };
  }

  const files = fs.readdirSync(carouselDir).filter(f => f.endsWith('.png')).sort();
  if (files.length === 0) {
    return { status: 'warning', feedback: 'カルーセル画像が見つかりません。' };
  }

  // To save tokens, we might only check the first 3 and last 1 slide, or all slides if small.
  // 10 slides is fine for Gemini 1.5 Flash.
  const contents = [];
  
  contents.push({
    text: `あなたはプロのデザイン監査AIです。提供された一連のカルーセル画像（最大10枚）を確認し、以下の致命的なレイアウトエラーがないか厳格にチェックしてください。
    
【チェック項目】
1. テキストとグラフ/数値の重なり: 文字がグラフや他のUI要素と被って読解不能になっていないか。
2. 不自然な改行: 文の途中で不自然に改行され、デザインが崩れていないか。
3. 出典明記: 論文の出典（Source等）が画面外にはみ出して見えなくなっていないか。

【返答フォーマット】
問題がなければ "PASS" とだけ出力してください。
もし明確に文字被りや崩れがある場合のみ、"WARNING: スライド〇枚目で〜が重なっています" のように簡潔に日本語で報告してください。細かなデザインの好みの指摘は不要です。致命的な破損のみ警告してください。`
  });

  for (const file of files) {
    const filePath = path.join(carouselDir, file);
    const base64Image = fs.readFileSync(filePath).toString('base64');
    contents.push({
      inlineData: {
        mimeType: 'image/png',
        data: base64Image
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        temperature: 0.1,
      }
    });
    const text = response.text || '';
    if (text.includes('PASS')) {
      return { status: 'pass', feedback: '' };
    } else {
      return { status: 'warning', feedback: text.replace('WARNING:', '').trim() };
    }
  } catch (error: any) {
    console.warn(`⚠️ Vision Check Error (Carousel - ${slug}):`, error.message);
    return { status: 'warning', feedback: 'AIチェッカーの実行中にエラーが発生しました。' };
  }
}

async function checkReelDynamic(slug: string): Promise<VisionCheckResult> {
  const reelPath = path.join(OUT_DIR, 'reels', `${slug}.mp4`);
  if (!fs.existsSync(reelPath)) {
    return { status: 'warning', feedback: `動画ファイルが見つかりません: ${reelPath}` };
  }

  let uploadResult;
  try {
    // 1. Upload Video to Gemini File API
    uploadResult = await ai.files.upload({
      file: reelPath,
      config: { mimeType: 'video/mp4' },
    });

    // 2. Wait for processing (Usually takes a few seconds for short videos)
    let fileState = await ai.files.get({ name: uploadResult.name || '' });
    while (fileState.state === 'PROCESSING') {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      fileState = await ai.files.get({ name: uploadResult.name || '' });
    }

    if (fileState.state === 'FAILED') {
      throw new Error('Video processing failed in Gemini.');
    }

    // 3. Generate Vision checking prompt
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
           text: `あなたはプロの動画編集監査AIです。提供された縦長ショート動画（Reel）を確認し、以下の致命的なレイアウトエラーがないか厳格にチェックしてください。
        
【チェック項目】
1. テロップ（字幕）の重なり: 表示されるテロップが、他の文字、グラフ、または人物の顔など重要な視覚要素と重なって読解不能になっていないか。
2. 画面外への見切れ: テロップやタイトルが画面の左右・上下にはみ出していないか。

【返答フォーマット】
問題がなければ "PASS" とだけ出力してください。
もし明確に文字同士の重なりや、顔・グラフを完全に覆い隠してしまうなどの致命的な視認性低下がある場合のみ、"WARNING: 動画の中盤でテロップがグラフと重なっています" のように簡潔に日本語で報告してください。細かなデザイン修正の提案は不要です。`
        },
        { 
          fileData: { 
            fileUri: fileState.uri, 
            mimeType: fileState.mimeType 
          } 
        }
      ],
      config: {
        temperature: 0.1,
      }
    });

    const text = response.text || '';
    
    // 4. Cleanup API File
    await ai.files.delete({ name: uploadResult.name || '' });

    if (text.includes('PASS')) {
      return { status: 'pass', feedback: '' };
    } else {
      return { status: 'warning', feedback: text.replace('WARNING:', '').trim() };
    }

  } catch (error: any) {
    console.warn(`⚠️ Vision Check Error (Reel - ${slug}):`, error);
    // Try to cleanup if uploaded
    if (uploadResult && uploadResult.name) {
      try { await ai.files.delete({ name: uploadResult.name }); } catch(e) {}
    }
    return { status: 'warning', feedback: 'AIチェッカー(Video)の実行中にエラーが発生しました。' };
  }
}
