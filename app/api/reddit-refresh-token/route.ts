export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";

type RequestBody = {
    refresh_token: string;
};

type ResultBody = {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

export async function POST(request: NextRequest) {

    try {
        const { refresh_token }: RequestBody = await request.json(); 
        
        const credentials = Buffer.from(
            `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
        ).toString("base64"); 

        const response = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            credentials: "include",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                "grant_type": "refresh_token",
                "refresh_token": refresh_token
            })
        });

        if (!response.ok) {
            throw new Error("Error al obtener el token nuevo");
        }

        const result: ResultBody = await response.json();
        
        const res = new NextResponse(JSON.stringify(result), { status: 200 });

        return res;

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

}
