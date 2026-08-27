export async function POST() {
  const res = Response.json({ success: true });
  // Overwrite with an expired cookie to force the browser to drop it.
  res.headers.set(
    'Set-Cookie',
    'admin_session=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0'
  );
  return res;
}
