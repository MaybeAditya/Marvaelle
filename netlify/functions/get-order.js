// functions/get-orders.js

import { neon } from '@netlify/neon';
import jwt from 'jsonwebtoken';

export async function handler(event) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 1. Get and verify the user's token
    const token = event.headers['authorization']?.split(' ')[1];
    if (!token) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Access denied.' }) };
    }

    let userId;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
    } catch (error) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token.' }) };
    }

    // 2. Connect to the database
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    try {
        // 3. Fetch all orders and their items for this user
        // This query joins the 'orders' table with 'order_items'
        // and uses json_agg to nest the items as a JSON array
        // inside each order.
        const orders = await sql`
            SELECT
                o.id AS order_id,
                o.total_amount,
                o.status,
                o.created_at,
                o.payment_id,
                (
                    SELECT json_agg(json_build_object(
                        'product_id', oi.product_id,
                        'quantity', oi.quantity,
                        'price_at_purchase', oi.price_at_purchase
                    ))
                    FROM order_items oi
                    WHERE oi.order_id = o.id
                ) AS items
            FROM orders o
            WHERE o.user_id = ${userId}
            ORDER BY o.created_at DESC; -- Show newest orders first
        `;

        // 4. Return the list of orders
        return {
            statusCode: 200,
            body: JSON.stringify(orders)
        };

    } catch (error) {
        console.error('Database error in get-orders:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Server error.' }) };
    }
}