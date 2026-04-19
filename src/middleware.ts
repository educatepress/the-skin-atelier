import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Basic Auth middleware — 内部ツール系のパスのみ保護。
 * 公開LP/ブログは無制限に閲覧可能。
 */
export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  const validUser = process.env.BASIC_AUTH_USER || 'miyaka';
  const validPass = process.env.BASIC_AUTH_PASSWORD || 'atelier2026';

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    try {
      const [user, pwd] = atob(authValue).split(':');
      if (user === validUser && pwd === validPass) {
        return NextResponse.next();
      }
    } catch {
      // fall through to 401
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Skin Atelier Internal Tools"',
    },
  });
}

// /reply-helper 配下のみ保護。LP・ブログ・API 一般は公開のまま。
export const config = {
  matcher: ['/reply-helper/:path*', '/reply-helper'],
};
