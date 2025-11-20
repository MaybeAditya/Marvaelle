document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-button");
    const loginModal = document.getElementById("login-modal");
    const closeButton = document.getElementById("login-close-button");

    let googleButtonRendered = false;
    let googleInitialized = false;

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

    // --- 2. SIMPLE GOOGLE INITIALIZATION ---
    function initializeGoogle() {
        if (typeof google === 'undefined') {
            console.log('Google library not available yet');
            return false;
        }

        try {
            google.accounts.id.initialize({
                client_id: "284150378430-gr7ap6qofsmqk1jr9nak3vbea7ts5g68.apps.googleusercontent.com",
                callback: handleGoogleCredentialResponse
            });
            googleInitialized = true;
            console.log('Google Auth initialized');
            return true;
        } catch (error) {
            console.error('Google init error:', error);
            return false;
        }
    }

    // Try to initialize Google immediately and keep retrying
    const initGoogle = setInterval(() => {
        if (typeof google !== 'undefined') {
            clearInterval(initGoogle);
            initializeGoogle();
        }
    }, 100);

    // Stop trying after 10 seconds
    setTimeout(() => clearInterval(initGoogle), 10000);

    // --- 3. HANDLE LOGIN RESPONSE ---
    async function handleGoogleCredentialResponse(response) {
        console.log('Google login response received');
        try {
            const res = await fetch("/.netlify/functions/google-auth", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ credential: response.credential })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Authentication failed');

            localStorage.setItem('authToken', data.token);
            loginModal.style.display = "none";
            checkLoginState();

            // Show welcome toast
            const toast = document.createElement("div");
            toast.className = "toast show";
            toast.textContent = `Welcome back, ${data.name}`;
            document.getElementById("toast-container").appendChild(toast);
            setTimeout(() => toast.remove(), 3000);

        } catch (error) {
            console.error('Login error:', error);
            alert("Login failed. Please try again.");
        }
    }

    // --- 4. RENDER GOOGLE BUTTON (Only when needed) ---
    function renderGoogleButton() {
        const container = document.getElementById("google_btn_container");
        if (!container) {
            console.error('Google button container not found');
            return false;
        }

        // Clear any existing content
        container.innerHTML = '';

        if (!googleInitialized) {
            container.innerHTML = `
                <div style="padding: 12px; background: #f5f5f5; border-radius: 4px; text-align: center;">
                    <p>Loading Google Sign-In...</p>
                    <button onclick="location.reload()" style="margin-top: 8px; padding: 8px 16px;">Retry</button>
                </div>
            `;
            return false;
        }

        try {
            google.accounts.id.renderButton(
                container,
                { 
                    theme: "filled_black", 
                    size: "large", 
                    shape: "rectangular", 
                    width: "300", 
                    text: "signin_with"
                }
            );
            googleButtonRendered = true;
            console.log('Google button rendered successfully');
            return true;
        } catch (error) {
            console.error('Failed to render Google button:', error);
            container.innerHTML = `
                <div style="padding: 12px; background: #ffebee; border: 1px solid #f44336; border-radius: 4px; text-align: center;">
                    <p>Google Sign-In failed to load</p>
                    <button onclick="location.reload()" style="margin-top: 8px; padding: 8px 16px;">Reload Page</button>
                </div>
            `;
            return false;
        }
    }

    // --- 5. MODAL HANDLING ---
    if (loginButton) {
        loginButton.addEventListener("click", (e) => {
            e.preventDefault();
            const token = localStorage.getItem('authToken');

            if (token) {
                // User is logged in - offer logout
                if (confirm("Log out?")) {
                    localStorage.removeItem('authToken');
                    checkLoginState();
                    // Show logout toast
                    const toast = document.createElement("div");
                    toast.className = "toast show";
                    toast.textContent = "Logged out successfully";
                    document.getElementById("toast-container").appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                }
            } else {
                // User is not logged in - open login modal
                console.log('Opening login modal');
                loginModal.style.display = "block";

                // Render Google button if not already rendered
                if (!googleButtonRendered) {
                    // Small delay to ensure modal is visible
                    setTimeout(() => {
                        renderGoogleButton();
                    }, 100);
                }
            }
        });
    }

    // Close modal handlers
    if (closeButton) {
        closeButton.addEventListener("click", () => {
            loginModal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = "none";
        }
    });

    console.log('Auth system loaded');
});
