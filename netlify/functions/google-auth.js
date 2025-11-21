import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

export async function handler(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // Handle Browser Pre-checks (CORS)
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    try {
        console.log("1. Function started");

        // --- CHECK SECRETS ---
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
        const JWT_SECRET = process.env.JWT_SECRET;

        if (!GOOGLE_CLIENT_ID) throw new Error("Missing GOOGLE_CLIENT_ID");
        if (!DATABASE_URL) throw new Error("Missing DATABASE_URL");
        if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

        // --- PARSE INPUT ---
        const body = JSON.parse(event.body);
        const credential = body.credential;
        if (!credential) throw new Error("No Google credential received");

        // --- VERIFY GOOGLE TOKEN ---
        console.log("2. Verifying Google Token");
        const client = new OAuth2Client(GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        // --- CONNECT TO DB ---
        console.log(`3. Connecting to DB for: ${email}`);
        const sql = neon(DATABASE_URL);

        // --- CHECK/CREATE USER ---
        const existingUsers = await sql`SELECT * FROM users WHERE email = ${email}`;
        let user;

        if (existingUsers.length > 0) {
            user = existingUsers[0];
        } else {
            console.log("4. Creating new user");
            const newUsers = await sql`
                INSERT INTO users (name, email, password_hash, google_id)
                VALUES (${name}, ${email}, 'GOOGLE_AUTH', ${googleId})
                RETURNING id, name, email
            `;
            user = newUsers[0];
        }

        // --- GENERATE OUR TOKEN ---
        const token = jwt.sign(
            { userId: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ token, name: user.name })
        };

    } catch (error) {
        console.error("ERROR:", error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || "Server Login Error" })
        };
    }
}