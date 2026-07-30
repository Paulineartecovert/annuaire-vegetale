const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, password, action } = req.body;

    if (action === 'login') {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok) return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      return res.status(200).json({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });

    } else if (action === 'signup') {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password }),
      });
      const data = await r.json();
      if (!r.ok || data.error) return res.status(400).json({ error: data.error?.message || 'Erreur création compte' });
      return res.status(200).json({ access_token: data.access_token, refresh_token: data.refresh_token, user: data.user });

    } else if (action === 'reset') {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) return res.status(500).json({ error: "Erreur lors de l'envoi" });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Action inconnue' });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Erreur serveur: ' + err.message });
  }
}
