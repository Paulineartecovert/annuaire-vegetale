export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

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

  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return new Response(JSON.stringify({ user: null }), { status: 200, headers });
    }

    // Rafraîchir le token
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ refresh_token }),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ user: null }), { status: 200, headers });
    }

    const data = await res.json();
    return new Response(JSON.stringify({
      user: data.user,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    }), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify({ user: null }), { status: 200, headers });
  }
}
