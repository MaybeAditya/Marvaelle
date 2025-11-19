import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export async function handler(event) {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        const { amount } = JSON.parse(event.body);

        const options = {
            amount: amount * 100, // Convert to paisa
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