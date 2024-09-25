export const runtime = 'edge';

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Define el tipo para la respuesta del token de acceso
interface RedditTokenResponse {
  access_token: string;
  refresh_token: string;
  error?: string;
  // Agrega otros campos según sea necesario
}

export async function GET(request: NextRequest) {
  const code = request.headers.get("Authorization")?.split(" ")[1];

  if (!code) {
    return NextResponse.json({ error: 'Refresh token is missing' }, { status: 400 });
  }

  const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT, REDDIT_REDIRECT_URL } = process.env;

  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USER_AGENT || !REDDIT_REDIRECT_URL) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  const auth = btoa(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`);

  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'User-Agent': REDDIT_USER_AGENT,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDDIT_REDIRECT_URL, // Ensure this matches your redirect URI
      }),
    });

    const data: RedditTokenResponse = await response.json(); // Asegura que 'data' tenga el tipo correcto

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch token');
    }

    return NextResponse.json({ token: data.access_token, refresh_token: data.refresh_token });
  } catch (error) {
    console.error('Error fetching Reddit token:', (error as Error).message);
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}
