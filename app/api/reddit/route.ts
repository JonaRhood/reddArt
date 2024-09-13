import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Art_Client/1.0 by Brief_King_9490'
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
