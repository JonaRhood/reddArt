// fetchData.ts
const BASE_URL = 'https://oauth.reddit.com';


export async function fetchToNavBar(subreddit: string) {
    const token = localStorage.getItem('REDDART_ACCESS_TOKEN')
    try {
        // Fetch the Reddit data using the token
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
            return {}; // Return an empty object in case of failure
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        return {}; // Return an empty object in case of error
    }
}

export async function fetchSubReddit(subreddit: string, limit: number, after = '', before = '') {
    const token = localStorage.getItem('REDDART_ACCESS_TOKEN')
    try {
        // Construye la URL con los parámetros after y before
        const url = `${BASE_URL}/r/${subreddit}/hot?limit=${limit}${after ? `&after=${after}` : ''}${before ? `&before=${before}` : ''}`;

        // Fetch the Reddit data using the token
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



