import React from "react";
import { staticFile, Img } from "remotion";
import { InfographicChart } from "./InfographicChart";

// ── SKIN ATELIER HYBRID DESIGN SYSTEM ──
const COLORS = {
  glassLight: 'rgba(252, 249, 248, 0.85)', // 透過オフホワイト（ノウハウ用）
  textPrimary: '#4a4a4a', // 読みやすいチャコールグレー
  accent: '#6e5b4d', // 上品なモカブラウン
  muted: '#9a9089',
  line: 'rgba(110, 91, 77, 0.15)', // 1pxの区切り線用
};

const FONTS = {
  serif: "'Shippori Mincho', 'Playfair Display', serif", // 情緒的価値
  sans: "'Noto Sans JP', 'Inter', sans-serif", // 可読性
  decor: "'Manrope', sans-serif" // 英字装飾
};

export const SlideRenderer: React.FC<{ slide: any; themeIndex: number }> = ({ slide }) => {
  if (!slide) return null;

  // RULE 4: 雑誌度の比重（緩急）
  const isMagazine100 = slide.type === "Cover" || slide.type === "CTA" || slide.type === "Message";
  
  // RULE 2: グラスモーフィズムと大人の余白
  const baseStyle: React.CSSProperties = {
    // 雑誌度100%はPexels動画を強く出し、ノウハウ部分は文字の視認性のため強めの白グラスに。
    backgroundColor: isMagazine100 ? 'rgba(252, 249, 248, 0.3)' : COLORS.glassLight,
    backdropFilter: isMagazine100 ? 'blur(4px)' : 'blur(24px)',
    WebkitBackdropFilter: isMagazine100 ? 'blur(4px)' : 'blur(24px)',
    color: COLORS.textPrimary,
    fontFamily: FONTS.sans,
    padding: '120px 80px 140px 80px', // 上下左右に圧倒的なマージン（Rule 2）
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  };

  const renderContent = () => {
    switch (slide.type) {
      // ─────────────────────────────────────────────
      // COVER (Slide 1) - 雑誌度 100%
      // ─────────────────────────────────────────────
      case "Cover":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            {/* Rule 1: 装飾英語 (Manrope) */}
            <p style={{ fontFamily: FONTS.decor, color: COLORS.accent, fontWeight: 300, fontSize: '24px', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '60px' }}>
              {slide.subheadline}
            </p>
            {/* Rule 1: 惹きつける見出し (Mincho) */}
            <h1 style={{ fontFamily: FONTS.serif, fontSize: '88px', lineHeight: 1.15, fontWeight: 400, color: '#333' }}>
              {slide.headline}
            </h1>

            {/* ロゴ + ハンドル */}
            <div style={{ position: 'absolute', bottom: '120px', display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: `1px solid ${COLORS.line}`, overflow: 'hidden' }}>
                 <Img src={staticFile("logowhite.jpg")} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <p style={{ fontFamily: FONTS.decor, fontWeight: 400, fontSize: '24px', color: COLORS.textPrimary, letterSpacing: '0.05em', margin: 0 }}>
                @dr.miyaka.atelier
              </p>
            </div>
          </div>
        );

      // ─────────────────────────────────────────────
      // MESSAGE / AGITATION (Slide 2, 9)
      // ─────────────────────────────────────────────
      case "Agitation":
      case "Message":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <h2 style={{ fontFamily: FONTS.serif, color: COLORS.accent, fontSize: '64px', fontWeight: 400, margin: '0 0 60px 0', lineHeight: 1.3 }}>
              {slide.headline}
            </h2>
            <p style={{ fontFamily: FONTS.sans, fontSize: '42px', lineHeight: 1.8, fontWeight: 300, letterSpacing: 'normal' }}>
              {slide.body}
            </p>
          </div>
        );

      // ─────────────────────────────────────────────
      // CONTENT (Slide 4, 5, 6等) - 雑誌度30% : 情報70%
      // ─────────────────────────────────────────────
      case "Content": 
      case "Intro": {
        // ハイライトの処理（Rule 5: 静かな強調）
        const highlightWord = slide.highlightKeyword;
        let bodyContent: React.ReactNode = slide.body;
        
        if (highlightWord && typeof slide.body === 'string' && slide.body.includes(highlightWord)) {
          const parts = slide.body.split(highlightWord);
          bodyContent = (
            <>
              {parts[0]}
              <span style={{ 
                color: COLORS.accent, 
                fontWeight: 500, // 極端に太くしない
                borderBottom: `2px solid ${COLORS.accent}`, 
                paddingBottom: '4px' 
              }}>
                {highlightWord}
              </span>
              {parts.length > 1 ? parts[1] : ''}
            </>
          );
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            {/* Rule 3: 1pxの線でモジュール化 */}
            <div style={{ paddingBottom: '40px', borderBottom: `1px solid ${COLORS.line}`, marginBottom: '60px' }}>
              <p style={{ fontFamily: FONTS.decor, color: COLORS.muted, fontWeight: 300, fontSize: '28px', letterSpacing: '0.1em', marginBottom: '20px' }}>
                {String(slide.slideNumber).padStart(2, '0')}.
              </p>
              <h2 style={{ fontFamily: FONTS.serif, fontSize: '72px', margin: 0, fontWeight: 400, color: '#333', lineHeight: 1.2 }}>
                {slide.headline}
              </h2>
            </div>
            
            {/* Rule 2: 読ませる本文はModern Gothic + 行間1.8 + 文字間標準 */}
            <p style={{ 
              fontFamily: FONTS.sans, 
              fontSize: '44px', 
              lineHeight: 1.8, 
              fontWeight: 300,
              letterSpacing: 'normal',
              margin: 0
            }}>
              {bodyContent}
            </p>
          </div>
        );
      }

      // ─────────────────────────────────────────────
      // SUMMARY (Slide 7) - 復習用モジュールUI
      // ─────────────────────────────────────────────
      case "Summary":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingTop: '40px' }}>
            <div style={{ paddingBottom: '40px', borderBottom: `1px solid ${COLORS.line}`, marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: FONTS.serif, fontSize: '64px', margin: 0, fontWeight: 400 }}>
                {slide.headline}
              </h2>
              <svg width="48" height="64" viewBox="0 0 24 32" fill="none" style={{ stroke: COLORS.accent, strokeWidth: 1.5 }}>
                <path d="M2 2v28l10-10 10 10V2H2z" />
              </svg>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '40px' }}>
              {slide.summaryItems.map((item: string, idx: number) => {
                const isProTip = item.includes("Pro Tip:");
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '32px',
                    fontSize: '40px', lineHeight: 1.6, fontFamily: FONTS.sans,
                    fontWeight: isProTip ? 400 : 300, color: isProTip ? COLORS.accent : COLORS.textPrimary
                  }}>
                    {/* Rule 3: 絵文字を排し、美しいセリフ体の装飾記号へ */}
                    <span style={{ fontFamily: FONTS.serif, color: COLORS.muted, fontSize: '36px', marginTop: '6px' }}>
                      {isProTip ? '✦' : String(idx + 1).padStart(2, '0')}
                    </span>
                    <span>{item.replace(/^✓\s*/, '')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      // ─────────────────────────────────────────────
      // CTA (Slide 10) - 雑誌度 100%
      // ─────────────────────────────────────────────
      case "CTA":
        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <h2 style={{ fontFamily: FONTS.serif, fontSize: '72px', margin: '0 0 40px 0', fontWeight: 400 }}>{slide.headline}</h2>
            <p style={{ fontFamily: FONTS.sans, fontSize: '38px', color: COLORS.muted, fontWeight: 300, marginBottom: '80px' }}>
              {slide.actionText}
            </p>

            {slide.commentTrigger && (
              <div style={{
                padding: '40px 80px',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                border: `1px solid ${COLORS.line}`,
                borderRadius: '60px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px'
              }}>
                <span style={{ fontFamily: FONTS.decor, fontSize: '20px', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                  Comment to Guide
                </span>
                <span style={{ fontFamily: FONTS.serif, fontSize: '64px', fontWeight: 400, color: COLORS.accent, letterSpacing: '0.05em' }}>
                  "{slide.commentTrigger}"
                </span>
              </div>
            )}
            
            {/* Microcopy for Algorithm constraints */}
            <p style={{ fontFamily: FONTS.sans, fontSize: '24px', color: COLORS.muted, position: 'absolute', bottom: '260px', fontWeight: 300 }}>
              ✓ ドラッグストアでのお買い物の際に見返せます
            </p>
          </div>
        );

      case "Infographic":
      case "Evidence":
        // 既存のRechartsを使用。外部コンポーネントとしての呼び出しを維持
        return slide.type === "Infographic" ? <InfographicChart data={slide as any} startFrame={0} /> : <div style={{ fontSize: '40px', fontFamily: FONTS.sans }}>Evidence Content Placeholder</div>;

      default:
        return <div>Unknown slide type: {slide.type}</div>;
    }
  };

  return (
    <div style={baseStyle}>
      {/* 画面四隅の英字装飾（Rule 1: 雑誌のフレーム） */}
      <span style={{ position: 'absolute', top: '40px', left: '60px', fontFamily: FONTS.decor, fontSize: '16px', color: COLORS.muted, letterSpacing: '0.3em' }}>THE SKIN ATELIER</span>
      <span style={{ position: 'absolute', top: '40px', right: '60px', fontFamily: FONTS.decor, fontSize: '16px', color: COLORS.muted, letterSpacing: '0.1em' }}>VOL.{String(slide.slideNumber).padStart(2, '0')}</span>

      {/* Progress Line (極細 1px or 2px シームレスバー) */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', backgroundColor: 'rgba(0,0,0,0.05)' }}>
        <div style={{ width: `${(slide.slideNumber / 10) * 100}%`, height: '100%', backgroundColor: COLORS.accent }} />
      </div>

      {renderContent()}
    </div>
  );
};
