import { neon } from '@netlify/neon';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { email, password } = JSON.parse(event.body);
    if (!email || !password) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Please provide email and password.' }) };
    }

    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    try {
        // 1. Find the user by email
        const users = await sql`
            SELECT id, email, password_hash FROM users WHERE email = ${email}
        `;
        
        if (users.length === 0) {
            // IMPORTANT: Be vague. Don't say "user not found"
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials.' }) };
        }

        const user = users[0];

        // 2. Compare the provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return { statusCode: 401, body: JSON.stringify({ error: 'Invalid credentials.' }) };
        }

        // 3. Create a login token (JWT)
        const token = jwt.sign(
            { userId: user.id, email: user.email }, // This is the data stored in the token
            process.env.JWT_SECRET,                  // This is your secret key
            { expiresIn: '1d' }                      // The token will expire in 1 day
        );

        // 4. Send the token back to the frontend
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Login successful.', token: token })
        };

    } catch (error) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Database error.' }) };
    }
}