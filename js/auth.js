document.addEventListener("DOMContentLoaded", () => {
    // --- Modal Elements ---
    const loginButton = document.getElementById("login-button");
    const loginModal = document.getElementById("login-modal");
    const loginCloseButton = document.getElementById("login-close-button");

    // --- Tab Elements ---
    const tabLinks = document.querySelectorAll(".auth-tab-link");
    const tabContents = document.querySelectorAll(".auth-tab-content");
    
    // --- Form Elements ---
    const loginForm = document.getElementById("login").querySelector("form");
    const signupForm = document.getElementById("signup").querySelector("form");

    // --- Event Listeners for Modal ---
    
    if (loginButton) {
        loginButton.addEventListener("click", (e) => {
            e.preventDefault();
            loginModal.style.display = "block";
        });
    }

    if (loginCloseButton) {
        loginCloseButton.addEventListener("click", () => {
            loginModal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        }
    });

    // --- Tab switching ---
    tabLinks.forEach(link => {
        link.addEventListener("click", () => {
            const tabName = link.dataset.tab;
            tabLinks.forEach(item => item.classList.remove("active"));
            link.classList.add("active");
            tabContents.forEach(content => {
                content.classList.remove("active");
                if (content.id === tabName) {
                    content.classList.add("active");
                }
            });
        });
    });

    // --- NEW: Signup Form Handler ---
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("signup-name").value;
            const email = document.getElementById("signup-email").value;
            const password = document.getElementById("signup-password").value;

            try {
                const response = await fetch("/.netlify/functions/signup", {
                    method: "POST",
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error);
                }

                alert("Signup successful! Please log in.");
                // Switch to login tab
                document.querySelector('.auth-tab-link[data-tab="login"]').click();

            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });
    }

    // --- NEW: Login Form Handler ---
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            try {
                const response = await fetch("/.netlify/functions/login", {
                    method: "POST",
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error);
                }

                // **Login Successful!**
                // 1. Store the token
                localStorage.setItem('authToken', data.token);

                // 2. Close the modal
                loginModal.style.display = "none";

                // 3. Update the UI
                loginButton.textContent = "Account";
                alert("Login successful!");
                // You could also redirect: window.location.href = "/account.html";

            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });
    }
    
    // --- NEW: Check if already logged in on page load ---
    if (localStorage.getItem('authToken')) {
         loginButton.textContent = "Account";
    }
});