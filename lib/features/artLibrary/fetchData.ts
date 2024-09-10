export async function fetchToNavBar() {
    try {
        console.log('Fetching Reddit data...');
        const data = await fetch('')
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch Reddit data.')
    }
}