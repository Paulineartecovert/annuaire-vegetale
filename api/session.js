const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(200).json({ user: null });

    const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token }),
    });

    if (!r.ok) return res.status(200).json({ user: null });

    const data = await r.json();
    return res.status(200).json({ user: data.user, access_token: data.access_token, refresh_token: data.refresh_token });

  } catch (err) {
    return res.status(200).json({ user: null });
  }
}
