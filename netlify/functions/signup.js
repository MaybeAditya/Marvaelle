import { neon } from '@netlify/neon';
import bcrypt from 'bcryptjs';

export async function handler(event) {
    // 1. We only accept POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 2. Parse the incoming data
    const { name, email, password } = JSON.parse(event.body);
    if (!name || !email || !password) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Please provide name, email, and password.' }) };
    }

    // 3. Hash the password
    const passwordHash = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // 4. Connect to the database
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    try {
        // 5. Insert the new user
        await sql`
            INSERT INTO users (name, email, password_hash) 
            VALUES (${name}, ${email}, ${passwordHash})
        `;

        return {
            statusCode: 201, // 201 means "Created"
            body: JSON.stringify({ message: 'User created successfully.' })
        };
    } catch (error) {
        // 6. Handle errors (like a duplicate email)
        if (error.message.includes('unique constraint')) {
            return {
                statusCode: 409, // 409 means "Conflict"
                body: JSON.stringify({ error: 'An account with this email already exists.' })
            };
        }
        return { statusCode: 500, body: JSON.stringify({ error: 'Database error.' }) };
    }
}