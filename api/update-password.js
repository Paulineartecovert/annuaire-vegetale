const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
    if (!body) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString());
    }

    const { password, access_token } = body;

    if (!password || !access_token) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }

    // Mettre à jour le mot de passe avec le token de reset
    const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${access_token}`
      },
      body: JSON.stringify({ password })
    });

    const data = await r.json();

    if (!r.ok) {
      console.error('Update password error:', data);
      return res.status(400).json({ error: data.message || 'Erreur lors de la mise à jour' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Update password error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur: ' + err.message });
  }
}
