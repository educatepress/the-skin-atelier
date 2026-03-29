import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(req: NextRequest) {
  // 🔥 一般公開：Basic認証を一時的にバイパス
  return NextResponse.next();

  const basicAuth = req.headers.get('authorization');

  if (typeof basicAuth === 'string') {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // ユーザー名とパスワード（本番は環境変数から取得、未設定時はデフォルト値）
    const validUser = process.env.BASIC_AUTH_USER || 'miyaka';
    const validPass = process.env.BASIC_AUTH_PASSWORD || 'atelier2026';

    if (user === validUser && pwd === validPass) {
      return NextResponse.next();
    }
  }

  // 認証失敗時または未認証時は401エラー（Basic認証ダイアログを表示）
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

// 適用範囲（画像やAPIなど以外、サイトの全ページに適用）
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|og-image.jpg).*)'],
};
