import { SheetsDB } from "./scripts/lib/sheets-db.js";
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function run() {
  const schedules = await SheetsDB.getRows();
  const latest = schedules[schedules.length - 1];
  console.log(`Latest ID: ${latest.content_id}`);
  console.log(`Status: ${latest.status}`);
}
run();
