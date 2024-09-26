// fetchData.ts
const BASE_URL = 'https://oauth.reddit.com';

async function fetchRedditData(url: string, signal?: AbortSignal) {
    const token = localStorage.getItem('REDDART_ACCESS_TOKEN');
    if (!token) {
        console.error('Token is missing');
        return null; // O lanza un error
    }

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            signal
        });

        if (!response.ok) {
            console.error('HTTP Error:', response.statusText);
            return null; 
        }

        return await response.json();
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted'); // O simplemente no registres nada
            } else {
                console.error('Fetch Error:', error);
            }
        }
        return null; 
    }
}

export async function fetchToNavBar(subreddit: string) {
    const url = `${BASE_URL}/r/${subreddit}/about`;
    return fetchRedditData(url);
}

export async function fetchSubReddit(subreddit: string, limit: number, after = '', before = '', signal?: AbortSignal) {
    const url = `${BASE_URL}/r/${subreddit}/hot?limit=${limit}${after ? `&after=${after}` : ''}${before ? `&before=${before}` : ''}`;
    return fetchRedditData(url, signal);
}

export async function fetchUserReddit(redditUser: string, limit: number, after = '', before = '', signal?: AbortSignal) {
    const url = `${BASE_URL}/user/${redditUser}/overview?limit=${limit}&sort=top${after ? `&after=${after}` : ''}${before ? `&before=${before}` : ''}`;
    return fetchRedditData(url, signal);
}

export async function fetchUserIcon(redditUser: string, signal?: AbortSignal) {
    const url = `${BASE_URL}/user/${redditUser}/about`;
    const data = await fetchRedditData(url, signal);
    
    if (data) {
        console.log("USER ABOUT DATA", data);
    }

    return data;
}
