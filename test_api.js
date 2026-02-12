
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testApi() {
    try {
        const response = await fetch('http://localhost:5000/api/exercises');
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
    } catch (err) {
        console.error('Fetch error:', err.message);
    }
}

testApi();
