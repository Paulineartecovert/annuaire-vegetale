const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

    const required = ['prenom', 'nom', 'email', 'structure', 'site_web', 'adresse', 'ville', 'pays', 'description', 'recherche'];
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return res.status(400).json({ error: `Champ manquant : ${field}` });
      }
    }

    const r = await fetch(`${SUPABASE_URL}/rest/v1/acteurs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        prenom: body.prenom.trim(), nom: body.nom.trim(),
        structure: body.structure?.trim() || null,
        email: body.email.trim(), site_web: body.site_web?.trim() || null,
        adresse: body.adresse?.trim() || null, ville: body.ville.trim(),
        code_postal: body.code_postal?.trim() || null,
        pays: body.pays?.trim() || 'France',
        activites: body.activites || null,
        description: body.description.trim(), recherche: body.recherche.trim(),
        latitude: body.latitude || null, longitude: body.longitude || null,
        approuve: true,
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: "Erreur lors de l'insertion" });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Inscription error:', err.message);
    return res.status(500).json({ error: 'Erreur serveur: ' + err.message });
  }
}
