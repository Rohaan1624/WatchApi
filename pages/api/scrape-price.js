import axios from 'axios';
import { parse } from 'node-html-parser';
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

    const url = `https://www.chrono24.com/search/index.htm?currencyId=USD&sortorder=0&pageSize=60&specials=102&query=${encodeURIComponent(query)}&usedOrNew=new&dosearch=true`;

    try {
        const { data: html } = await axios.get(url);

        const root = parse(html);

        const productElement = root.querySelector(
            '.js-article-item.article-item.block-item.rcard .d-flex.justify-content-between.align-items-end.m-b-1 div .text-bold'
        );

        if (!productElement) {
            return res.status(404).json({ query, price: 'Product not found' });
        }

        const price = productElement.text.trim();

        return res.status(200).json({ query, price });
    } catch (error) {
        console.error('Error scraping price:', error);
        return res.status(500).json({ error: 'Failed to scrape price' });
    }
}
