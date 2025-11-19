// --- RAZORPAY CHECKOUT LOGIC ---

// 1. Load Razorpay Script
const rzpScript = document.createElement('script');
rzpScript.src = "https://checkout.razorpay.com/v1/checkout.js";
document.head.appendChild(rzpScript);

// 2. Handle Checkout Click
document.addEventListener("click", async (e) => {
    if (e.target && e.target.matches('#cart-modal .btn-primary')) {

        const checkoutBtn = e.target;
        const cart = JSON.parse(localStorage.getItem('styleSphereCart')) || [];

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        // Calculate Total
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // UI Loading State
        const originalText = checkoutBtn.textContent;
        checkoutBtn.textContent = "Processing...";
        checkoutBtn.disabled = true;

        try {
            // A. Create Order on Server
            const response = await fetch("/.netlify/functions/create-order", {
                method: "POST",
                body: JSON.stringify({ amount: totalAmount })
            });

            const orderData = await response.json();
            if (!response.ok) throw new Error(orderData.error);

            // B. Open Razorpay Payment
            const options = {
                "key": "rzp_test_RhbHNyejePQu6T", // <--- PASTE YOUR KEY ID HERE (starts with rzp_test_)
                "amount": orderData.amount,
                "currency": "INR",
                "name": "Édition de Marvaelle",
                "description": "Luxury Checkout",
                "order_id": orderData.id,
                "handler": function (response) {
                    alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
                    localStorage.removeItem('styleSphereCart');
                    window.location.reload();
                },
                "theme": { "color": "#111111" }
            };

            const rzp1 = new Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error(error);
            alert("Checkout failed. Please try again.");
        } finally {
            checkoutBtn.textContent = originalText;
            checkoutBtn.disabled = false;
        }
    }
});