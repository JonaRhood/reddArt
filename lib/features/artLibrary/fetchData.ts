const BASE_URL = 'https://www.reddit.com';

export async function fetchToNavBar(url: string) {
    try {
        console.log('Fetching Reddit data...');

        const response = await fetch(url)
        if (response.ok) {
            console.log('Data fetch completed.')
            return response.json()
        } else {
            console.error('Promise resolved but HTTP status failed');
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch Reddit data.')
    }
}

export async function fetchToken() {
    try {
        // Corrige la ruta si es necesario
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
};


export async function searchReddit(query: string): Promise<any> {
    try {
        const response = await fetch(`${BASE_URL}/${query}.json`);

        if (!response.ok) {
            throw new Error(`¡Error HTTP! Estado: ${response.status}`);
        }
        
        return response.json();
    } catch (error) {
        console.error('Error al obtener datos de Reddit:', error);
        throw error;
    }
}
