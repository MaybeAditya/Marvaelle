import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function handler(event) {
    // 1. Security: Reject non-POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { amount } = JSON.parse(event.body);

        // 2. Validation: Ensure amount exists
        if (!amount) {
            return { statusCode: 400, body: JSON.stringify({ error: "Amount is required" }) };
        }

        const options = {
            // FIX: Use Math.round() to prevent "Invalid amount" errors
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: "order_" + Math.random().toString(36).substring(7)
        };

        const order = await razorpay.orders.create(options);

        return {
            statusCode: 200,
            body: JSON.stringify(order)
        };

    } catch (error) {
        console.error("Razorpay Error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
}