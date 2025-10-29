document.addEventListener("DOMContentLoaded", () => {
    
    const loginForm = document.getElementById("login-page-form");
    const signupForm = document.getElementById("signup-page-form");
    
    // --- Login Page Logic ---
    // --- Login Page Logic ---
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            let response; // Define response here

            try {
                response = await fetch("/.netlify/functions/login", {
                    method: "POST",
                    body: JSON.stringify({ email, password })
                });

                // *** THIS IS THE FIX ***
                // 1. Check if the response was NOT successful
                if (!response.ok) {
                    // 2. Get the raw server error text
                    const errorText = await response.text();
                    // 3. Throw a new error to be caught
                    throw new Error(`Server Error: ${response.status} ${response.statusText}\n\n${errorText}`);
                }

                // 4. If we get here, the response IS ok
                const data = await response.json();

                localStorage.setItem('authToken', data.token);
                alert("Login successful!");
                window.location.href = "/"; 

            } catch (error) {
                // This catch block will now show the REAL error
                console.error("Login Error:", error);
                alert(error.message); // This will alert the useful message
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            let response; // Keep this defined up here

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
                    // 2. Get the raw server error text (since it's not JSON)
                    const errorText = await response.text();
                    
                    // 3. Throw a new error to be caught by the 'catch' block
                    throw new Error(`Server Error: ${response.status} ${response.statusText}\n\n${errorText}`);
                }

                // 4. If we get here, the response IS ok and we can safely parse JSON
                const data = await response.json();

                alert("Signup successful! Please log in.");
                window.location.href = "/login.html"; 

            } catch (error) {
                // This catch block will now show the REAL error message
                console.error("Signup Error:", error);
                alert(error.message); // This will alert the useful message from the 'throw' above
            }
        });
    }

    // --- Header Logic (for 'Account' button) ---
    const loginButton = document.getElementById("login-button");
    if (loginButton && localStorage.getItem('authToken')) {
         loginButton.textContent = "Account";
    }
});