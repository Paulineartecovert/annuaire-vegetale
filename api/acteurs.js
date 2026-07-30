export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

    const userToken = authHeader.replace('Bearer ', '');

    // Vérifier que l'utilisateur est connecté
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 
        'apikey': SUPABASE_ANON_KEY, 
        'Authorization': `Bearer ${userToken}` 
      }
    });

    if (!verifyRes.ok) return res.status(401).json({ error: 'Token invalide' });

    // Récupérer les acteurs avec le token de l'utilisateur (RLS policy "lecture_authentifiee")
    const r = await fetch(`${SUPABASE_URL}/rest/v1/acteurs?select=*&order=created_at.desc&limit=1000`, {
      headers: { 
        'apikey': SUPABASE_ANON_KEY, 
        'Authorization': `Bearer ${userToken}`,
        'Accept': 'application/json'
      }
    });

    const data = await r.json();
    console.log('Status Supabase:', r.status, 'Nb acteurs:', Array.isArray(data) ? data.length : typeof data);

    return res.status(200).json(Array.isArray(data) ? data : []);

  } catch (err) {
    console.error('Erreur:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
