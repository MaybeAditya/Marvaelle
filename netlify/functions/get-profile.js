// functions/get-profile.js

import { neon } from '@netlify/neon';
import jwt from 'jsonwebtoken';

export async function handler(event) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 1. Get the token from the request headers
    const authHeader = event.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer TOKEN"

    if (!token) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Access denied. No token provided.' }) };
    }

    try {
        // 2. Verify the token
        // This uses the same secret you created in login.js
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 'decoded' now contains { userId: ..., email: ... }
        const userId = decoded.userId;

        // 3. Connect to the database
        const sql = neon(process.env.NETLIFY_DATABASE_URL);

        // 4. Fetch the user's *non-sensitive* information
        const users = await sql`
            SELECT name, email, phone, country 
            FROM users 
            WHERE id = ${userId}
        `;

        if (users.length === 0) {
            return { statusCode: 404, body: JSON.stringify({ error: 'User not found.' }) };
        }

        const user = users[0];

        // 5. Send the user's data back to the account.html page
        return {
            statusCode: 200,
            body: JSON.stringify(user) // e.g., { name: "Adi", email: "..." }
        };

    } catch (error) {
        // This will catch invalid/expired tokens
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token.' }) };
    }
}