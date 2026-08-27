import { NextResponse } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/adminSession';

const PUBLIC_PATHS = ['/admin/login', '/api/admin/login', '/api/admin/logout'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');
  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const session = request.cookies.get('admin_session')?.value;
  const valid = await verifyAdminSessionToken(session, process.env.ADMIN_SESSION_SECRET);

  if (!valid) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
