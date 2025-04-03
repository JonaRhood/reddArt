import { NextRequest, NextResponse } from "next/server";
import { getCookie } from "@/app/lib/utils/utils";

type RequestBody = {
    urlCode: string;
    redirectUri: string;
};

type ResultBody = {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
}

export async function POST(request: NextRequest) {

    try {
        const { urlCode, redirectUri }: RequestBody = await request.json(); 
        
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
                "grant_type": "authorization_code",
                "code": urlCode,
                "redirect_uri": redirectUri
            })
        });

        if (!response.ok) {
            throw new Error("Error al obtener el token de acceso");
        }

        const result: ResultBody = await response.json();
        console.log(result);
        
        const res = new NextResponse(JSON.stringify(result), { status: 200 });

        res.cookies.set("reddit-token", result.access_token, {
            path: "/", 
            maxAge: 3600, 
        });

        res.cookies.set("refresh-token", result.refresh_token, {
            path: "/", 
        }); 

        return res;

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

}
