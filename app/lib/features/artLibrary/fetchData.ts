// fetchData.ts
const BASE_URL = 'https://oauth.reddit.com';
const token = localStorage.getItem('REDDART_ACCESS_TOKEN')


export async function fetchToNavBar(subreddit: string) {
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


// export async function fetchToken() {
//     try {
//         const response = await fetch('./api/reddit-token');
//         const data = await response.json();
//         if (data.token) {
//             localStorage.setItem('REDDIT_ACCESS_TOKEN', data.token);
//             localStorage.setItem('lastTokenTime', Date.now().toString());
//             console.log('Token stored in localStorage.');
//         } else {
//             console.error('Failed to fetch token:', data.error);
//         }
//     } catch (error) {
//         console.error('Error fetching token:', error);
//         throw new Error('Error fetching token.');
//     }
// }

export async function fetchSubReddit(subreddit: string, limit = 100, after = '', before = '') {
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



