// js/checkout.js

document.addEventListener("DOMContentLoaded", async () => {
    // -----------------------------------------------------------------
    //  STEP 1: SETUP
    //  Get your Stripe PUBLISHABLE key. This is safe for the frontend.
    // -----------------------------------------------------------------
    const stripePublicKey = 'pk_test_51SQmqoK0xpbMlmLzVZax3e3Oc80Z8pYpgKAteMwAIdk5P0mKc3qgjaCkPSdBXCunnbuvNrLEJJ10dzt1NVXsbkyD00yPKMrv2e'; // 🚨 PASTE YOUR KEY
    const stripe = Stripe(stripePublicKey);

    // Get DOM elements for the form
    const paymentForm = document.getElementById('payment-form');
    const messageElement = document.getElementById('payment-message');
    const submitButton = document.getElementById('submit-button');

    // -----------------------------------------------------------------
    //  STEP 2: CREATE PAYMENT INTENT
    //  Call our serverless function to get the clientSecret.
    // -----------------------------------------------------------------

    // Get the cart from localStorage
    const cart = JSON.parse(localStorage.getItem('styleSphereCart')) || [];

    // If the cart is empty, redirect to the homepage
    if (cart.length === 0) {
        window.location.href = "/";
        return; // Stop the script
    }

    // Format the cart for our serverless function
    const cartItems = cart.map(item => ({ id: item.id, quantity: item.quantity }));

    let clientSecret;
    try {
        const response = await fetch("/.netlify/functions/create-payment-intent", {
            method: "POST",
            body: JSON.stringify({ cartItems })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create payment intent.');
        }

        const data = await response.json();
        clientSecret = data.clientSecret;

    } catch (error) {
        showMessage(error.message, "error");
        return; // Stop if we can't get the secret
    }

    // -----------------------------------------------------------------
    //  STEP 3: MOUNT STRIPE ELEMENTS
    //  Use the clientSecret to create and show the credit card form.
    // -----------------------------------------------------------------
    const elements = stripe.elements({ clientSecret });
    const paymentElement = elements.create("payment"); // Creates the all-in-one form
    paymentElement.mount("#payment-element");

    // -----------------------------------------------------------------
    //  STEP 4: HANDLE FORM SUBMISSION
    //  This runs when the user clicks "Pay Now".
    // -----------------------------------------------------------------
    paymentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        setLoading(true);

        // This is the URL of your site *after* payment is complete.
        // We'll add logic to a 'success.html' page later.
        const returnUrl = `${window.location.origin}/success.html`;

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: returnUrl,
            },
        });

        // This part only runs if an *immediate* error happens (like
        // network failure). Otherwise, the user is redirected.
        if (error.type === "card_error" || error.type === "validation_error") {
            showMessage(error.message, "error");
        } else {
            showMessage("An unexpected error occurred.", "error");
        }

        setLoading(false);
    });


    // --- Helper Functions ---

    function showMessage(message, type = "success") {
        messageElement.textContent = message;
        messageElement.className = `auth-message ${type}`; // Reuse auth.js styles
    }

    function setLoading(isLoading) {
        submitButton.disabled = isLoading;
        submitButton.querySelector("#button-text").textContent = isLoading
            ? "Processing..."
            : "Pay Now";
    }
});