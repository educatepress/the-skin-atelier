import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Basic Auth proxy — 内部ツール系パスのみ保護。
 * 公開LP/ブログは matcher で除外されるため、無制限に閲覧可能。
 * (Next.js 16 では middleware.ts は proxy.ts にリネームされた)
 */
export default function proxy(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  const validUser = process.env.BASIC_AUTH_USER || 'miyaka';
  const validPass = process.env.BASIC_AUTH_PASSWORD || 'atelier2026';

  if (basicAuth) {
    const authValue = (basicAuth as string).split(' ')[1];
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

// /reply-helper 配下のみ保護。LP・ブログ・API は公開のまま。
export const config = {
  matcher: ['/reply-helper/:path*', '/reply-helper'],
};
