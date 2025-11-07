// functions/create-payment-intent.js

import { neon } from '@netlify/neon';
import Stripe from 'stripe';

// Initialize Stripe with your secret key (from environment variables)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize the Neon database connection
const sql = neon(process.env.NETLIFY_DATABASE_URL);

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 1. Get the cart items from the client's request
        // We only trust the IDs and quantities, not the prices!
        const { cartItems } = JSON.parse(event.body); // e.g., [{ id: '1', quantity: 2 }]

        if (!cartItems || cartItems.length === 0) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Cart is empty.' }) };
        }

        // 2. Get all product IDs from the cart
        const productIds = cartItems.map(item => item.id);

        // 3. Fetch the *official* prices from our secure database
        const dbProducts = await sql`
            SELECT id, price FROM products WHERE id = ANY(${productIds})
        `;

        // 4. Calculate the *secure, server-side* total
        let totalInCents = 0;

        // Use a Map for easy price lookup
        const priceMap = new Map(dbProducts.map(p => [p.id, p.price]));

        for (const item of cartItems) {
            const officialPrice = priceMap.get(item.id);

            if (officialPrice) {
                totalInCents += officialPrice * item.quantity;
            } else {
                // This item from the cart doesn't exist in our DB
                throw new Error(`Product with ID ${item.id} not found.`);
            }
        }

        // 5. Create a Payment Intent with Stripe
        // This tells Stripe we're expecting a payment of this amount.
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalInCents,
            currency: 'usd', // Or your preferred currency
            // You can add more details here, like metadata
            metadata: {
                itemCount: cartItems.length
            }
        });

        // 6. Send the "client secret" back to the frontend
        // The frontend will use this to securely complete the payment
        return {
            statusCode: 200,
            body: JSON.stringify({
                clientSecret: paymentIntent.client_secret
            })
        };

    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Server error: ' + error.message }) };
    }
}