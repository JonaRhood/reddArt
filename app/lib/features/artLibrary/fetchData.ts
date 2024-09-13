// fetchData.ts

const BASE_URL = 'https://oauth.reddit.com';

export async function fetchToNavBar(subreddit: string, token: string | null) {
    if (!token) {
        throw new Error('No token provided');
    }

    try {
        const response = await fetch(`${BASE_URL}/r/${subreddit}/about`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            return response.json();
        } else {
            console.error('HTTP Error:', response.statusText);
            return {}; 
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        return {}; 
    }
}


export async function fetchSubReddit(subreddit: string, token: string, limit = 100, after = '', before = '') {
    try {
        const url = `${BASE_URL}/r/${subreddit}/hot?limit=${limit}${after ? `&after=${after}` : ''}${before ? `&before=${before}` : ''}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            return response.json();
        } else {
            console.error('HTTP Error:', response.statusText);
            return {}; // Return an empty object in case of failure
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        return {}; // Return an empty object in case of error
    }
}

