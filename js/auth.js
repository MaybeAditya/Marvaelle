document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-button");
    const loginModal = document.getElementById("login-modal");
    const closeButton = document.getElementById("login-close-button");

    // --- 1. CHECK LOGIN STATE ---
    checkLoginState();

    function checkLoginState() {
        const token = localStorage.getItem('authToken');
        if (token && loginButton) {
            loginButton.textContent = "Account";
        } else if (loginButton) {
            loginButton.textContent = "Login";
        }
    }

    // --- 2. INITIALIZE GOOGLE BUTTON ---
    // We wait for the window to load so the Google script is ready
    window.onload = function () {
        if (typeof google !== 'undefined') { // Check if Google script loaded
            google.accounts.id.initialize({
                client_id: "284150378430-gr7ap6qofsmqk1jr9nak3vbea7ts5g68.apps.googleusercontent.com", // <--- PASTE YOUR CLIENT ID HERE FOR LOCAL TESTING
                callback: handleGoogleCredentialResponse
            });

            // Render the button (Black theme for luxury)
            google.accounts.id.renderButton(
                document.getElementById("google_btn_container"),
                { theme: "filled_black", size: "large", shape: "rectangular", width: "300", text: "signin_with" }
            );
        }
    };

    // --- 3. HANDLE GOOGLE LOGIN ---
    async function handleGoogleCredentialResponse(response) {
        // The user clicked the button and Google gave us a "credential"
        try {
            const res = await fetch("/.netlify/functions/google-auth", {
                method: "POST",
                body: JSON.stringify({ credential: response.credential })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            // Success!
            localStorage.setItem('authToken', data.token);
            loginModal.style.display = "none";
            checkLoginState();

            // Show Toast
            const toast = document.createElement("div");
            toast.className = "toast show";
            toast.textContent = `Welcome back, ${data.name}`;
            document.getElementById("toast-container").appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

        } catch (error) {
            alert("Login failed. Please try again.");
            console.error(error);
        }
    }

    // --- 4. MODAL OPEN/CLOSE LOGIC ---
    if (loginButton) {
        loginButton.addEventListener("click", (e) => {
            e.preventDefault();
            const token = localStorage.getItem('authToken');
            if (token) {
                if (confirm("Log out?")) {
                    localStorage.removeItem('authToken');
                    checkLoginState();
                }
            } else {
                loginModal.style.display = "block";
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener("click", () => loginModal.style.display = "none");
    }

    window.addEventListener("click", (event) => {
        if (event.target === loginModal) loginModal.style.display = "none";
    });
});