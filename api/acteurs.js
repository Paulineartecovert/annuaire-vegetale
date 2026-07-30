export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    // Debug : vérifier que les variables sont bien là
    console.log('SUPABASE_URL défini:', !!SUPABASE_URL);
    console.log('SUPABASE_SERVICE_KEY défini:', !!SUPABASE_SERVICE_KEY);
    console.log('SUPABASE_ANON_KEY défini:', !!SUPABASE_ANON_KEY);

    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      return res.status(500).json({ 
        error: 'Variables manquantes',
        url: !!SUPABASE_URL,
        key: !!SUPABASE_SERVICE_KEY
      });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token manquant' });

    const userToken = authHeader.replace('Bearer ', '');

    // Vérifier le token
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 
        'apikey': SUPABASE_ANON_KEY, 
        'Authorization': `Bearer ${userToken}` 
      }
    });

    if (!verifyRes.ok) return res.status(401).json({ error: 'Token invalide' });

    // Récupérer les acteurs
    const r = await fetch(`${SUPABASE_URL}/rest/v1/acteurs?select=*&order=created_at.desc&limit=1000`, {
      headers: { 
        'apikey': SUPABASE_SERVICE_KEY, 
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Accept': 'application/json'
      }
    });

    const data = await r.json();
    console.log('Réponse Supabase status:', r.status);
    console.log('Type data:', typeof data, Array.isArray(data));
    console.log('Longueur:', Array.isArray(data) ? data.length : 'N/A');

    return res.status(200).json(Array.isArray(data) ? data : []);

  } catch (err) {
    console.error('Erreur:', err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
}
