export const runtime = 'edge';

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface RedditTokenResponse {
    access_token: string;
    refresh_token: string;
}

interface RedditErrorResponse {
    error: string;
}

export async function GET(request: NextRequest) {
    const refreshToken = request.headers.get("Authorization")?.split(" ")[1];

    if (!refreshToken) {
        return NextResponse.json({ error: 'Refresh token is missing' }, { status: 400 });
    }

    const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT } = process.env;

    if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USER_AGENT) {
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
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            const errorData: RedditErrorResponse = await response.json(); // Cast to RedditErrorResponse
            throw new Error(errorData.error || 'Failed to fetch token');
        }

        const data: RedditTokenResponse = await response.json();

        return NextResponse.json({ 
            token: data.access_token, 
            refresh_token: data.refresh_token 
        });
    } catch (error) {
        console.error('Error fetching Reddit token:', (error as Error).message);
        return NextResponse.json({ error: 'Failed to fetch token' }, { status: 500 });
    }
}
