document.addEventListener("DOMContentLoaded", () => {
    
    const loginForm = document.getElementById("login-page-form");
    const signupForm = document.getElementById("signup-page-form");
    
    // --- Login Page Logic ---
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            let response; // Define response here to access it in catch block

            try {
                response = await fetch("/.netlify/functions/login", {
                    method: "POST",
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error);
                }

                localStorage.setItem('authToken', data.token);
                alert("Login successful!");
                window.location.href = "/"; 

            } catch (error) {
                // NEW DEBUGGING CATCH BLOCK
                console.error("Login Error:", error);
                if (response) {
                    // If the response was not JSON, alert the raw text
                    const rawText = await response.text();
                    alert(`Server Error: ${response.status} ${response.statusText}\n\nResponse:\n${rawText}`);
                } else {
                    // If fetch itself failed
                    alert(`Fetch Error: ${error.message}`);
                }
            }
        });
    }

    // --- Signup Page Logic ---
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            let response; // Define response here to access it in catch block

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

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error);
                }

                alert("Signup successful! Please log in.");
                window.location.href = "/login.html"; 

            } catch (error) {
                // NEW DEBUGGING CATCH BLOCK
                console.error("Signup Error:", error);
                if (response) {
                    // If the response was not JSON, alert the raw text
                    const rawText = await response.text();
                    alert(`Server Error: ${response.status} ${response.statusText}\n\nResponse:\n${rawText}`);
                } else {
                    // If fetch itself failed
                    alert(`Fetch Error: ${error.message}`);
                }
            }
        });
    }

    // --- Header Logic (for 'Account' button) ---
    const loginButton = document.getElementById("login-button");
    if (loginButton && localStorage.getItem('authToken')) {
         loginButton.textContent = "Account";
    }
});