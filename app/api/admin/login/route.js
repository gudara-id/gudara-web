export async function POST(req) {
  const { password } = await req.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Password salah' }, { status: 401 });
  }

  const res = Response.json({ success: true });
  res.headers.set(
    'Set-Cookie',
    `admin_session=${process.env.ADMIN_SESSION_SECRET}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
  );
  return res;
}
