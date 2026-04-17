import { Octokit } from '@octokit/rest';
import 'dotenv/config';
import { SheetsDB } from './lib/sheets-db';

async function main() {
  const contentId = process.argv[2];
  if (!contentId) {
    console.error('❌ Please provide a contentId as an argument.');
    process.exit(1);
  }

  console.log(`🚀 Starting GitHub Rollback (Delete) for Skin Atelier content: ${contentId}`);

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

  if (targetRow.status !== 'posted') {
    console.log(`ℹ️ Item is not posted yet. Cannot rollback.`);
    process.exit(0);
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
  const commitMessage = `Rollback (Delete) blog: ${slug} via AG Agent Dispatcher`;

  try {
    let fileSha = undefined;
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: filePath });
      if (!Array.isArray(data) && 'sha' in data) {
        fileSha = data.sha;
      }
    } catch (err: any) {
      if (err.status === 404) {
        console.log(`ℹ️ File already missing or deleted: ${filePath}`);
        await SheetsDB.updateRow(contentId, { status: 'rolled_back' });
        return;
      }
      throw err;
    }

    if (fileSha) {
      await octokit.repos.deleteFile({
        owner,
        repo,
        path: filePath,
        message: commitMessage,
        sha: fileSha,
      });

      await SheetsDB.updateRow(contentId, { status: 'rolled_back' });
      console.log(`🎉 Successfully rolled back (deleted) ${slug} from GitHub: ${repo}`);
    }

  } catch (error: any) {
    console.error(`❌ Failed to rollback via Octokit: ${error.message}`);
    process.exit(1);
  }
}

main();
