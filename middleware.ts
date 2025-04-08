import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers';

type ResultBody = {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

export async function middleware(request: NextRequest) {
    const cookiesHeader = cookies();
    const redditToken = cookiesHeader.get('reddit-token');
    const tokenRefresh = cookiesHeader.get('refresh-token')?.value;

    const baseUrl = `http://${request.nextUrl.host}/`;
    const { pathname } = request.nextUrl;

    // Checks that a refresh token exists and the Reddit token is not present
    if (tokenRefresh && !redditToken) {
        try {
            console.log("Refreshing token...");


            const refreshTokenResponse = await fetch(`${process.env.BASE_URL}assets/routes/reddit-refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: tokenRefresh }),
            });


            if (!refreshTokenResponse.ok) {
                throw new Error('Error refreshing token');
            }

            const result: ResultBody = await refreshTokenResponse.json();
            console.log('Setting cookie with token:', result.access_token);


            const response = NextResponse.next();
            response.cookies.set("reddit-token", result.access_token, {
                path: "/",
                maxAge: 3600,
            });

            return response;

        } catch (err) {
            console.error('Error refreshing token: ', err);
            return NextResponse.redirect('/');
        }
    // If the Reddit token is missing and the user accesses a protected route, redirect to the landing page
    } else {
        if (!redditToken && request.headers.get("accept")?.includes("text/html") && pathname.length > 1) {
            return NextResponse.redirect(baseUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};
