import { createAdminSessionToken, safeCompare } from '@/lib/adminSession';

export async function POST(req) {
  const { password } = await req.json();

  const passwordOk = await safeCompare(password ?? '', process.env.ADMIN_PASSWORD ?? '');
  if (!passwordOk) {
    return Response.json({ error: 'Password salah' }, { status: 401 });
  }

  const token = await createAdminSessionToken(process.env.ADMIN_SESSION_SECRET);

  const res = Response.json({ success: true });
  res.headers.set(
    'Set-Cookie',
    `admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=604800`
  );
  return res;
}
