document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-button");
    const loginModal = document.getElementById("login-modal");
    const closeButton = document.getElementById("login-close-button");
    
    // Flag to track if we already rendered the button
    let googleButtonRendered = false;

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

    // --- 2. INITIALIZE GOOGLE (But don't render yet) ---
    const checkGoogleInterval = setInterval(() => {
        if (typeof google !== 'undefined') {
            clearInterval(checkGoogleInterval);
            google.accounts.id.initialize({
                // MAKE SURE THIS IS YOUR REAL ID
                client_id: "284150378430-gr7ap6qofsmqk1jr9nak3vbea7ts5g68.apps.googleusercontent.com",
                callback: handleGoogleCredentialResponse
            });
        }
    }, 500);

    // --- 3. HANDLE LOGIN ---
    async function handleGoogleCredentialResponse(response) {
        try {
            const res = await fetch("/.netlify/functions/google-auth", {
                method: "POST",
                body: JSON.stringify({ credential: response.credential })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

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

    // --- 4. OPEN MODAL & RENDER BUTTON ---
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
                // Open the modal FIRST
                loginModal.style.display = "block";

                // THEN render the button (only if we haven't done it yet)
                if (!googleButtonRendered && typeof google !== 'undefined') {
                    google.accounts.id.renderButton(
                        document.getElementById("google_btn_container"),
                        { theme: "filled_black", size: "large", shape: "rectangular", width: "300", text: "signin_with" }
                    );
                    googleButtonRendered = true; // Mark as done so we don't render duplicates
                }
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
