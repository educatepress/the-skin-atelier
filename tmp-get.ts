import { SheetsDB } from "./scripts/lib/sheets-db.js";
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function run() {
  try {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const tomorrowStr = d.toISOString().split('T')[0];

    const schedules = await SheetsDB.getThemeSchedule() || [];
    const normalizeDate = (d: string) => {
      if (!d) return "";
      const parts = d.replace(/\//g, '-').split('-');
      if (parts.length === 3) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
      return d;
    };
    const pending = schedules.find(s => 
      s.brand === "atelier" && 
      s.status === "pending" && 
      normalizeDate(s.date) === tomorrowStr
    );
    if (pending) {
      fs.writeFileSync('result.txt', `[TARGET_THEME] ${pending.theme}\nDate: ${tomorrowStr}`);
    } else {
      fs.writeFileSync('result.txt', `[TARGET_THEME] Not found for ${tomorrowStr}\nFull schedule: ${JSON.stringify(schedules)}`);
    }
  } catch (err) {
    fs.writeFileSync('result.txt', `ERROR: ${err}`);
  }
}
run();
