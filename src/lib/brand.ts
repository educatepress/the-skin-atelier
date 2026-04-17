/**
 * ブランド識別子と表示ヘルパー。
 *
 * NOTE: 同一内容のファイルが scripts/lib/brand.ts にも存在する。
 * どちらかを変更する際は両方を同期すること。
 */

export type Brand = 'atelier' | 'book';

export function brandBadge(brand: string | undefined | null): string {
  return brand === 'atelier' ? '🟩 Skin Atelier' : '📚 TTC Guide';
}
