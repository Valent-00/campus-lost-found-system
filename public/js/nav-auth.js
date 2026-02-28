// ================================
// Nav Auth — runs on every page
// ================================
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/auth/me");
        const data = await res.json();

        const navLinks = document.querySelector(".nav-links");
        if (!navLinks) return;

        // Remove existing auth link if any
        navLinks.querySelectorAll(".nav-auth-item").forEach(el => el.remove());

        if (data.loggedIn) {
            // My Reports link
            const myReportsEl = document.createElement("a");
            myReportsEl.href = "my-reports.html";
            myReportsEl.className = "nav-auth-item";
            myReportsEl.dataset.page = "myreports";
            myReportsEl.textContent = "My Reports";
            navLinks.appendChild(myReportsEl);

            // User name + logout
            const userEl = document.createElement("span");
            userEl.className = "nav-auth-item";
            userEl.style.cssText = "display:flex;align-items:center;gap:10px;font-size:14px;";
            userEl.innerHTML = `
                <span style="color:var(--muted)">👋 ${data.user.name.split(" ")[0]}</span>
                <a href="#" id="logoutBtn" style="color:var(--red);font-weight:600;">Logout</a>
            `;
            navLinks.appendChild(userEl);

            document.getElementById("logoutBtn")?.addEventListener("click", async (e) => {
                e.preventDefault();
                await fetch("/auth/logout", { method: "POST" });
                window.location.href = "login.html";
            });

        } else {
            const loginEl = document.createElement("a");
            loginEl.href = "login.html";
            loginEl.className = "nav-auth-item";
            loginEl.style.cssText = "color:var(--blue);font-weight:600;font-size:14px;";
            loginEl.textContent = "Login";
            navLinks.appendChild(loginEl);
        }
    } catch (err) {
        console.error("Nav auth check failed:", err);
    }
});