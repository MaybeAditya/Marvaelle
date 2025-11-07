// functions/save-order.js

import { neon } from '@netlify/neon';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';
import crypto from 'crypto'; // This is a built-in Node.js module

// Initialize Neon DB
const sql = neon(process.env.NETLIFY_DATABASE_URL);

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID, // Add this to Netlify
    key_secret: process.env.RAZORPAY_KEY_SECRET, // Add this to Netlify
});

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 1. Get Token & Payment Data from Frontend
    const token = event.headers['authorization']?.split(' ')[1];
    if (!token) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Access denied. No token.' }) };
    }

    const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        cart, // The full cart: [ { id, price, quantity }, ... ]
        totalAmount // The total in cents/paisa
    } = JSON.parse(event.body);

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !cart || !totalAmount) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing payment details.' }) };
    }

    try {
        // 2. Verify Login Token to get the user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // 3. 🚨 CRITICAL: Verify Payment Signature
        // This proves the payment is real and came from Razorpay
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            // This is a fraudulent request!
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid payment signature.' }) };
        }

        // 4. Payment is VERIFIED. Save to database.

        // We use a transaction to make sure we update BOTH tables or NEITHER.
        await sql.transaction(async (tx) => {
            // Insert into 'orders' table
            const orderResult = await tx`
                INSERT INTO orders (user_id, total_amount, payment_id, status)
                VALUES (${userId}, ${totalAmount}, ${razorpay_payment_id}, 'Confirmed')
                RETURNING id;
            `;

            const newOrderId = orderResult[0].id;

            // Prepare items for 'order_items' table
            // The cart from cart.js has price as a float (e.g., 79.99)
            const itemsToInsert = cart.map(item => ({
                order_id: newOrderId,
                product_id: item.id,
                quantity: item.quantity,
                price_at_purchase: Math.round(item.price * 100) // Convert 79.99 to 7999
            }));

            // Insert all items into 'order_items'
            await tx`
                INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                VALUES ${tx(itemsToInsert, 'order_id', 'product_id', 'quantity', 'price_at_purchase')}
            `;
        });

        // 5. Success!
        return {
            statusCode: 201,
            body: JSON.stringify({ success: true, message: 'Order saved successfully.' })
        };

    } catch (error) {
        console.error('Error in save-order:', error);
        if (error.name === 'JsonWebTokenError') {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token.' }) };
        }
        return { statusCode: 500, body: JSON.stringify({ error: 'Server error.' }) };
    }
}