const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    const userToken = authHeader.replace('Bearer ', '');

    // Vérifier le token
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${userToken}` }
    });

    if (!verifyRes.ok) return res.status(401).json({ error: 'Token invalide' });

    // Récupérer les acteurs avec la clé service
    const r = await fetch(`${SUPABASE_URL}/rest/v1/acteurs?select=*&order=created_at.desc`, {
      headers: { 'apikey': SUPABASE_SERVICE_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` }
    });

    const data = await r.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('Acteurs error:', err);
    return res.status(500).json({ error: 'Erreur serveur: ' + err.message });
  }
}
