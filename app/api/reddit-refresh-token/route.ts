import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import axios from 'axios';

export async function GET(request: NextRequest) {
    const refreshToken = request.headers.get("Authorization")?.split(" ")[1];

    if (!refreshToken) {
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
                grant_type: 'refresh_token',
                refresh_token: refreshToken, 
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
        console.error('Error fetching Reddit token:', error);
        return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
    }
}
