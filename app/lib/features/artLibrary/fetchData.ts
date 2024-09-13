// fetchData.ts
const BASE_URL = 'https://oauth.reddit.com';
const API_URL = '/api/reddit';

export async function fetchToNavBar(subreddit: string) {
    try {
        // Fetch the Reddit data using the token
        const response = await fetch(`${BASE_URL}/r/${subreddit}/about`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('REDDART_ACCESS_TOKEN')}`,
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


export async function fetchToken() {
    try {
        const response = await fetch('./api/reddit-token');
        const data = await response.json();
        if (data.token) {
            localStorage.setItem('REDDIT_ACCESS_TOKEN', data.token);
            localStorage.setItem('lastTokenTime', Date.now().toString());
            console.log('Token stored in localStorage.');
        } else {
            console.error('Failed to fetch token:', data.error);
        }
    } catch (error) {
        console.error('Error fetching token:', error);
        throw new Error('Error fetching token.');
    }
}

export async function fetchSubReddit(query: string) {
    try {
        const response = await fetch(`${API_URL}?url=${encodeURIComponent(`${BASE_URL}/${query}.json?raw_json=1`)}`);
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`HTTP Error: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching subreddit data:', error);
        throw error;
    }
}

interface Avatars {
    [key: string]: string;
}

export async function fetchUserAvatars(authors: string[]): Promise<Avatars> {
    const avatars: Avatars = {};
    const cachedAvatars = JSON.parse(localStorage.getItem('userAvatars') || '{}') as Avatars;
    const token = localStorage.getItem('REDDIT_ACCESS_TOKEN');

    if (!token) {
        console.error('No Reddit access token found. Please fetch a token first.');
        return avatars;
    }

    for (const author of authors) {
        if (cachedAvatars[author]) {
            avatars[author] = cachedAvatars[author];
        } else {
            try {
                const response = await fetch(`/api/reddit?url=${encodeURIComponent(`https://www.reddit.com/user/${author}/about.json?raw_json=1`)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                await new Promise(resolve => setTimeout(resolve, 100)); // Rate limiting

                if (response.ok) {
                    const data = await response.json();
                    const iconImg = data?.data?.subreddit?.icon_img;

                    if (iconImg) {
                        avatars[author] = iconImg;
                        cachedAvatars[author] = iconImg;
                    }
                } else {
                    console.error(`Error fetching avatar for user ${author}: ${response.statusText}`);
                }
            } catch (error) {
                console.error(`Error fetching avatar for user ${author}:`, error);
            }
        }
    }

    localStorage.setItem('userAvatars', JSON.stringify(cachedAvatars));
    return avatars;
}
