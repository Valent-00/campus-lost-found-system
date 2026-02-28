// ================================
// Detect Current Page
// ================================
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = document.body.dataset.page;

    document.querySelectorAll(".nav-links a").forEach(link => {
        if (link.dataset.page === currentPage) link.classList.add("active");
    });

    if (currentPage === "lost")       loadItems("Lost");
    if (currentPage === "found")      loadItems("Found");
    if (currentPage === "details")    loadDetails();
    if (currentPage === "myreports")  loadMyReports();
});


// ================================
// Load Items (Lost / Found)
// ================================
async function loadItems(category) {
    const container    = document.getElementById("itemsContainer");
    const resultsCount = document.getElementById("resultsCount");

    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading items...</p>
        </div>`;

    try {
        const res = await fetch(`/items?category=${category}`);
        const items = await res.json();
        container.innerHTML = "";

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p>No ${category.toLowerCase()} items found.</p>
                </div>`;
            if (resultsCount) resultsCount.textContent = "";
            return;
        }

        window._allItems = items;
        renderCards(container, items);
        if (resultsCount) resultsCount.textContent = `${items.length} item${items.length !== 1 ? "s" : ""} found`;

        const runFilter = () => applyFilters(container, resultsCount);
        document.getElementById("searchInput")?.addEventListener("input", runFilter);
        document.getElementById("statusFilter")?.addEventListener("change", runFilter);
        document.getElementById("sortFilter")?.addEventListener("change", runFilter);

    } catch (err) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <p>Failed to load items. Please try again.</p>
            </div>`;
    }
}


// ================================
// Render Cards
// ================================
function renderCards(container, items) {
    container.innerHTML = "";
    items.forEach(item => {
        const statusClass =
            item.status === "Active"   ? "status-active"   :
            item.status === "Claimed"  ? "status-claimed"  :
            item.status === "Resolved" ? "status-resolved" : "status-active";

        const displayDate = item.item_date
            ? new Date(item.item_date).toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" })
            : "—";

        const imgHtml = item.image
            ? `<img src="${item.image}" alt="${item.name}" class="item-card-img">`
            : "";

        const card = document.createElement("div");
        card.classList.add("item-card");
        card.innerHTML = `
            ${imgHtml}
            <h3>${item.name}</h3>
            <p><strong>📍 Location:</strong> ${item.location || "—"}</p>
            <p><strong>📅 Date:</strong> ${displayDate}</p>
            <p style="margin-top:8px"><span class="status ${statusClass}">${item.status}</span></p>
            <a href="details.html?id=${item.id}" class="view-btn">View Details →</a>
        `;
        container.appendChild(card);
    });
}


// ================================
// Apply Search + Filter + Sort
// ================================
function applyFilters(container, resultsCount) {
    const query     = (document.getElementById("searchInput")?.value  || "").trim().toLowerCase();
    const statusVal = (document.getElementById("statusFilter")?.value || "").toLowerCase();
    const sortVal   =  document.getElementById("sortFilter")?.value   || "newest";

    let filtered = (window._allItems || []).filter(item => {
        const matchSearch = !query ||
            (item.name     || "").toLowerCase().includes(query) ||
            (item.location || "").toLowerCase().includes(query);
        const matchStatus = !statusVal || (item.status || "").toLowerCase() === statusVal;
        return matchSearch && matchStatus;
    });

    if (sortVal === "newest") filtered.sort((a, b) => new Date(b.item_date) - new Date(a.item_date));
    else if (sortVal === "oldest") filtered.sort((a, b) => new Date(a.item_date) - new Date(b.item_date));
    else if (sortVal === "az") filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <p>No results match your search.</p>
            </div>`;
    } else {
        renderCards(container, filtered);
    }

    if (resultsCount) resultsCount.textContent = `${filtered.length} item${filtered.length !== 1 ? "s" : ""} found`;
}


// ================================
// Load Details Page
// ================================
async function loadDetails() {
    const id = new URLSearchParams(window.location.search).get("id");
    const container = document.getElementById("itemDetails");

    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading details...</p>
        </div>`;

    try {
        const [itemRes, meRes] = await Promise.all([
            fetch(`/items/${id}`),
            fetch("/auth/me")
        ]);
        const item = await itemRes.json();
        const me   = await meRes.json();

        const statusClass =
            item.status === "Active"   ? "status-active"   :
            item.status === "Claimed"  ? "status-claimed"  :
            item.status === "Resolved" ? "status-resolved" : "status-active";

        const displayDate = item.item_date
            ? new Date(item.item_date).toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" })
            : "—";

        const imgHtml = item.image
            ? `<img src="${item.image}" alt="${item.name}" class="details-img">` : "";

        // Show action buttons only if this is the owner
        const isOwner = me.loggedIn && me.user.id === item.user_id;
        const actionsHtml = isOwner ? `
            <div class="details-actions">
                <button class="update-btn" onclick="updateStatus(${item.id}, 'Claimed')">🔖 Mark as Claimed</button>
                <button class="update-btn" style="background:#12b76a" onclick="updateStatus(${item.id}, 'Resolved')">✅ Mark as Resolved</button>
                <button class="delete-btn" onclick="deleteItem(${item.id})">🗑 Delete</button>
            </div>` : `<p class="field-hint" style="margin-top:16px">💡 Only the person who submitted this report can update or delete it.</p>`;

        // Contact button — mailto or tel
        const contact = item.contact_info || "";
        const contactHtml = contact.includes("@")
            ? `<a href="mailto:${contact}" class="primary-btn" style="display:inline-block;margin-top:8px">📧 Email Owner</a>`
            : `<a href="tel:${contact}" class="primary-btn" style="display:inline-block;margin-top:8px">📞 Call Owner</a>`;

        container.innerHTML = `
            ${imgHtml}
            <h2>${item.name}</h2>
            <div class="details-grid">
                <div class="details-group">
                    <p><strong>Description</strong></p>
                    <p>${item.description}</p>
                </div>
                <div class="details-group">
                    <p><strong>Category</strong> ${item.category}</p>
                    <p><strong>📍 Location</strong> ${item.location || "—"}</p>
                    <p><strong>📅 Date</strong> ${displayDate}</p>
                    <p><strong>Submitted by</strong> ${item.submitter_name || "Anonymous"}</p>
                </div>
            </div>

            <div style="margin-top:16px">
                <p><strong>Status</strong></p>
                <span class="status ${statusClass}">${item.status}</span>
            </div>

            <div style="margin-top:20px; padding-top:20px; border-top:1px solid var(--border)">
                <p><strong>📞 Contact</strong> ${contact || "—"}</p>
                ${contact ? contactHtml : ""}
            </div>

            ${actionsHtml}
        `;
    } catch (err) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <p>Could not load item details.</p>
            </div>`;
    }
}


// ================================
// Load My Reports Page
// ================================
async function loadMyReports() {
    const container = document.getElementById("myReportsContainer");

    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading your reports...</p>
        </div>`;

    try {
        const res = await fetch("/items/mine");
        const items = await res.json();

        container.innerHTML = "";

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p>You haven't submitted any reports yet.</p>
                    <a href="report.html" class="primary-btn" style="margin-top:16px;display:inline-block">Submit a Report</a>
                </div>`;
            return;
        }

        items.forEach(item => {
            const statusClass =
                item.status === "Active"   ? "status-active"   :
                item.status === "Claimed"  ? "status-claimed"  :
                item.status === "Resolved" ? "status-resolved" : "status-active";

            const displayDate = item.item_date
                ? new Date(item.item_date).toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" })
                : "—";

            const imgHtml = item.image
                ? `<img src="${item.image}" alt="${item.name}" class="item-card-img">` : "";

            const card = document.createElement("div");
            card.classList.add("item-card");
            card.innerHTML = `
                ${imgHtml}
                <h3>${item.name}</h3>
                <p><strong>📂 Category:</strong> ${item.category}</p>
                <p><strong>📍 Location:</strong> ${item.location || "—"}</p>
                <p><strong>📅 Date:</strong> ${displayDate}</p>
                <p style="margin-top:8px"><span class="status ${statusClass}">${item.status}</span></p>
                <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
                    <a href="details.html?id=${item.id}" class="view-btn">View →</a>
                    <button class="update-btn" style="font-size:13px;padding:6px 12px" onclick="updateStatus(${item.id}, 'Resolved')">✅ Resolve</button>
                    <button class="delete-btn" style="font-size:13px;padding:6px 12px" onclick="deleteItem(${item.id})">🗑 Delete</button>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <p>Failed to load your reports.</p>
            </div>`;
    }
}


// ================================
// Update Status
// ================================
async function updateStatus(id, status) {
    try {
        const res = await fetch(`/items/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (!res.ok) { alert("❌ " + data.error); return; }
        alert(`✅ Status updated to ${status}!`);
        window.location.reload();
    } catch (err) {
        alert("Failed to update status.");
    }
}


// ================================
// Delete Item
// ================================
async function deleteItem(id) {
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
        const res = await fetch(`/items/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) { alert("❌ " + data.error); return; }
        alert("Item deleted.");
        window.location.href = "index.html";
    } catch (err) {
        alert("Failed to delete item.");
    }
}