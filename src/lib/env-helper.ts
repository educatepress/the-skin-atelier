/**
 * 環境変数ヘルパー。Vercel + ローカルの両方��動作。
 */
import { getAtelierEnv } from './sheets';

export function getEnvVar(key: string): string {
  return process.env[key] || getAtelierEnv()[key] || '';
}
