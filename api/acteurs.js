export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req) {
  // CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    // Vérifier que l'utilisateur est connecté via son JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), { status: 401, headers });
    }

    const userToken = authHeader.replace('Bearer ', '');

    // Vérifier le token auprès de Supabase
    const verifyRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${userToken}`,
      }
    });

    if (!verifyRes.ok) {
      return new Response(JSON.stringify({ error: 'Token invalide' }), { status: 401, headers });
    }

    // Token valide → récupérer les acteurs avec la clé service (côté serveur)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/acteurs?select=*&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500, headers });
  }
}
