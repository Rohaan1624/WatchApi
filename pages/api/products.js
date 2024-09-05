import axios from 'axios';
import Cors from 'cors';

// Helper function to allow CORS
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

const cors = Cors({
    methods: ['GET', 'HEAD'],
});

export default async function handler(req, res) {
    // Run the CORS middleware
    await runMiddleware(req, res, cors);

    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    try {
        const response = await axios.get(`https://www.chrono24.com/api/product-search/search.json?query=${encodeURIComponent(query)}`);
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching product data:', error);
        return res.status(500).json({ error: 'Failed to fetch product data' });
    }
}
