import { neon } from '@netlify/neon';
import bcrypt from 'bcryptjs';

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // 1. Parse all new fields from the request
    const { 
        name, email, password, 
        title, phone, dob, country 
    } = JSON.parse(event.body);

    if (!name || !email || !password) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Please provide name, email, and password.' }) };
    }

    // 2. Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Connect to the database
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    try {
        // 5. Insert the new user with all fields
        // This requires your database table to have these columns!
        await sql`
            INSERT INTO users (
                name, email, password_hash, 
                title, phone, dob, country
            ) 
            VALUES (
                ${name}, ${email}, ${passwordHash}, 
                ${title}, ${phone}, ${dob}, ${country}
            )
        `;

        return {
            statusCode: 201, 
            body: JSON.stringify({ message: 'User created successfully.' })
        };
    } catch (error) {
        if (error.message.includes('unique constraint')) {
            return {
                statusCode: 409,
                body: JSON.stringify({ error: 'An account with this email already exists.' })
            };
        }
        // Log the actual error to your Netlify function logs for debugging
        console.error(error); 
        return { statusCode: 500, body: JSON.stringify({ error: 'Database error.' }) };
    }
}