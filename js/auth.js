// NEW auth.js - No alerts

document.addEventListener("DOMContentLoaded", () => {
    
    const loginForm = document.getElementById("login-page-form");
    const signupForm = document.getElementById("signup-page-form");
    
    // --- Login Page Logic ---
    if (loginForm) {
        const messageElement = document.getElementById("login-message");

        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            let response; 
            
            // Clear previous message
            messageElement.textContent = "";
            messageElement.className = "auth-message";

            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            try {
                response = await fetch("/.netlify/functions/login", {
                    method: "POST",
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    // Try to get the specific error message from the server
                    let serverError = {};
                    try {
                        const errorText = await response.text();
                        serverError = JSON.parse(errorText);
                    } catch (e) { /* It wasn't JSON, just use the status */ }
                    
                    // Throw the *clean* error message from the server, or a fallback
                    throw new Error(serverError.error || `Error: ${response.statusText}`);
                }

                const data = await response.json();

                // SUCCESS! Show success message
                messageElement.textContent = "Login successful! Redirecting...";
                messageElement.className = "auth-message success";
                
                localStorage.setItem('authToken', data.token);
                
                // Redirect after 1 second so user can see the message
                setTimeout(() => {
                    window.location.href = "/"; 
                }, 1000);

            } catch (error) {
                // ERROR! Show error message
                messageElement.textContent = error.message; // e.g., "Invalid credentials."
                messageElement.className = "auth-message error";
            }
        });
    }

    // --- Signup Page Logic ---
    if (signupForm) {
        const messageElement = document.getElementById("signup-message");

        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            let response;

            // Clear previous message
            messageElement.textContent = "";
            messageElement.className = "auth-message";

            const signupData = {
                name: document.getElementById("signup-firstname").value + " " + document.getElementById("signup-lastname").value,
                email: document.getElementById("signup-email").value,
                password: document.getElementById("signup-password").value,
                title: document.getElementById("signup-title").value,
                phone: document.getElementById("signup-phone").value,
                dob: (document.getElementById("signup-dob-year").value && document.getElementById("signup-dob-month").value && document.getElementById("signup-dob-day").value) ? `${document.getElementById("signup-dob-year").value}-${document.getElementById("signup-dob-month").value}-${document.getElementById("signup-dob-day").value}` : null,
                country: document.getElementById("signup-country").value
            };

            try {
                response = await fetch("/.netlify/functions/signup", {
                    method: "POST",
                    body: JSON.stringify(signupData)
                });

                if (!response.ok) {
                    // Try to get the specific error message from the server
                    let serverError = {};
                    try {
                        const errorText = await response.text();
                        serverError = JSON.parse(errorText);
                    } catch (e) { /* It wasn't JSON, just use the status */ }
                    
                    // Throw the *clean* error message from the server, or a fallback
                    throw new Error(serverError.error || `Error: ${response.statusText}`);
                }

                // SUCCESS! Show success message
                messageElement.textContent = "Signup successful! Redirecting to login...";
                messageElement.className = "auth-message success";

                // Redirect after 1.5 seconds so user can see the message
                setTimeout(() => {
                    window.location.href = "/login.html"; 
                }, 1500);

            } catch (error) {
                // ERROR! Show error message
                messageElement.textContent = error.message; // e.g., "An account with this email already exists."
                messageElement.className = "auth-message error";
            }
        });
    }
});