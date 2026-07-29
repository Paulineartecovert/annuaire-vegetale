export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    const body = await req.json();

    // Validation des champs obligatoires
    const required = ['prenom', 'nom', 'email', 'structure', 'site_web', 'adresse', 'ville', 'pays', 'description', 'recherche'];
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return new Response(JSON.stringify({ error: `Champ manquant : ${field}` }), { status: 400, headers });
      }
    }

    // Insérer dans Supabase avec la clé service (invisible côté client)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/acteurs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        prenom: body.prenom.trim(),
        nom: body.nom.trim(),
        structure: body.structure?.trim() || null,
        email: body.email.trim(),
        site_web: body.site_web?.trim() || null,
        adresse: body.adresse?.trim() || null,
        ville: body.ville.trim(),
        code_postal: body.code_postal?.trim() || null,
        pays: body.pays?.trim() || 'France',
        activites: body.activites || null,
        description: body.description.trim(),
        recherche: body.recherche.trim(),
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        approuve: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Supabase error:', err);
      return new Response(JSON.stringify({ error: 'Erreur lors de l\'insertion' }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), { status: 500, headers });
  }
}
