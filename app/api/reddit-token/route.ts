import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import axios, { AxiosError } from 'axios';

export async function GET(request: NextRequest) {
  const code = request.headers.get("Authorization")?.split(" ")[1];

  if (!code) {
    return NextResponse.json({ error: 'Refresh token is missing' }, { status: 400 });
}

  const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT, REDDIT_REDIRECT_URL } = process.env;

  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USER_AGENT || !REDDIT_REDIRECT_URL) {
    return NextResponse.json({ error: 'Missing environment variables' }, { status: 500 });
  }

  const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');

  try {
    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDDIT_REDIRECT_URL, // Ensure this matches your redirect URI
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'User-Agent': REDDIT_USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return NextResponse.json({ token: response.data.access_token, refresh_token: response.data.refresh_token });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios-specific errors
      console.error('Error fetching Reddit token:', error.response?.data || error.message);
    } else {
      // Handle non-Axios errors
      console.error('Error fetching Reddit token:', (error as Error).message);
    }
    return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
  }
}
