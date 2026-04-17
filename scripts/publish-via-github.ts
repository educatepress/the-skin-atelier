import { Octokit } from '@octokit/rest';
import 'dotenv/config';
import { SheetsDB } from './lib/sheets-db';
import { WebClient } from '@slack/web-api';

async function main() {
  const contentId = process.argv[2];
  if (!contentId) {
    console.error('❌ Please provide a contentId as an argument.');
    process.exit(1);
  }

  console.log(`🚀 Starting GitHub Publish for Skin Atelier content: ${contentId}`);

  let queueItems = [];
  try {
    queueItems = await SheetsDB.getRows();
  } catch (e) {
    console.error('❌ Failed to read Google Sheets DB:', e);
    process.exit(1);
  }

  const targetRow = queueItems.find(r => r.content_id === contentId);
  if (!targetRow) {
    console.error(`❌ Queue item not found: ${contentId}`);
    process.exit(1);
  }

  if (targetRow.status === 'posted') {
    console.log(`ℹ️ Item is already posted. Aborting.`);
  }

  let recipe: any = {};
  try {
    recipe = JSON.parse(targetRow.generation_recipe || '{}');
    
    if (recipe.driveFileId) {
      console.log(`☁️ Fetching full recipe JSON from Google Drive (ID: ${recipe.driveFileId})...`);
      const { getDriveClient, downloadFileJSON } = await import('./lib/google-client');
      const drive = await getDriveClient();
      try {
        recipe = await downloadFileJSON(drive, recipe.driveFileId);
      } catch (e: any) {
        console.error(`❌ Failed to fetch recipe JSON from Google Drive: ${e.message}`);
        process.exit(1);
      }
    }
  } catch (e) {
    console.warn(`⚠️ Warning: generation_recipe parsing failed: ${e}`);
  }

  const captionText = recipe.captionText || '';
  if (!captionText) {
    console.error("❌ captionText (blog body) is empty.");
    process.exit(1);
  }

  const slug = targetRow.title;
  if (!slug) {
    console.error("❌ title (slug) is empty.");
    process.exit(1);
  }

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const owner = process.env.GITHUB_OWNER || 'educatepress';
  const repo = process.env.GITHUB_REPO || 'the-skin-atelier';
  const filePath = `content/blog/${slug}.md`;
  const commitMessage = `Auto-publish blog: ${slug} via AG Agent Dispatcher`;
  const contentEncoded = Buffer.from(captionText).toString('base64');

  try {
    let fileSha = undefined;
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: filePath });
      if (!Array.isArray(data) && 'sha' in data) {
        fileSha = data.sha;
      }
    } catch (err: any) {
      if (err.status !== 404) throw err;
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: commitMessage,
      content: contentEncoded,
      sha: fileSha,
    });

    await SheetsDB.updateRow(contentId, { status: 'posted', posted_at: new Date().toISOString() });
    console.log(`🎉 Successfully published ${slug} to GitHub: ${repo}`);

  } catch (error: any) {
    console.error(`❌ Failed to publish via Octokit: ${error.message}`);
    process.exit(1);
  }
}

main();
