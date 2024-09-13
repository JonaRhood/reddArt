import { v4 as uuidv4 } from 'uuid';


export default function redirectAuth() {
    const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
    const redirectUri = 'http://localhost:3000/'; // Example redirect URI
    const state = uuidv4(); // Generate a random state for security
    const scope = 'read'; // Example scope
    const duration = 'permanent'; // Example duration

    if (clientId) {
        const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}&duration=${duration}&scope=${scope}`;
        window.location.href = authUrl;
    } else {
        console.error('REDDIT_CLIENT_ID is not defined');
    };
};