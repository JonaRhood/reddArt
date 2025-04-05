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

    // Verifica que el token de Reddit no esté presente y que haya un refresh token
    if (tokenRefresh && !redditToken) {
        try {
            console.log("Refreshing token...");


            const refreshTokenResponse = await fetch(`${process.env.BASE_URL}api/reddit-refresh-token`, {
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
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};
