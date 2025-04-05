import { v4 as uuidv4 } from 'uuid';

export const loginAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_REDDIT_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_REDDIT_REDIRECT_URL;
    const state = uuidv4();
    const scope = 'read, history';
    const duration = 'permanent';

    localStorage.setItem("STATE", `${state}`);

    const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=code&state=${state}&redirect_uri=${redirectUri}&duration=${duration}&scope=${scope}`;
    window.location.href = authUrl;
}