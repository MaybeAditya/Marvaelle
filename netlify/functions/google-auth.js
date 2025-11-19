import { neon } from '@netlify/neon';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

// Initialize Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function handler(event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    const { credential } = JSON.parse(event.body);
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    try {
        // 1. Verify the Google Token (Make sure it's not fake)
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        const googleEmail = payload.email;
        const googleName = payload.name;

        // 2. Check if user exists in Neon DB
        const existingUsers = await sql`SELECT * FROM users WHERE email = ${googleEmail}`;
        let user;

        if (existingUsers.length > 0) {
            // User exists -> Log them in
            user = existingUsers[0];
        } else {
            // User is new -> Create them automatically
            // We put "GOOGLE_AUTH" as a dummy password since they don't use one
            const newUsers = await sql`
                INSERT INTO users (name, email, password_hash)
                VALUES (${googleName}, ${googleEmail}, 'GOOGLE_AUTH')
                RETURNING id, name, email
            `;
            user = newUsers[0];
        }

        // 3. Create OUR Session Token
        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Keep them logged in for 7 days (Luxury = Convenience)
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ token: token, name: user.name })
        };

    } catch (error) {
        console.error("Google Auth Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Authentication failed" }) };
    }
}