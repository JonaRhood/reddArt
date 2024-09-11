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