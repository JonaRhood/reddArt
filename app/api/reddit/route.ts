import { NextRequest, NextResponse } from 'next/server';

const REDDIT_API_URL = process.env.REDDIT_API_URL || 'http://localhost:3000'; 


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        // Obtener el token de acceso (puedes reemplazar esto con tu lógica para obtener el token)
        const tokenResponse = await fetch(`${REDDIT_API_URL}/api/reddit-token`);
        const { access_token } = await tokenResponse.json();

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'web:_glPpJan2C9COPXFnqCH5Q:v1.0 (by /u/Brief_King_9490)',
            }
        });

        if (!response.ok) {
            console.error(`Failed to fetch. Status: ${response.status}`);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching Reddit data:', error);
        return NextResponse.json({ error: 'Error fetching Reddit data' }, { status: 500 });
    }
}
