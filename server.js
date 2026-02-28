require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const db = require("./models/db");

const app = express();

// ===============================
// Middleware
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session — must be before auth guard
app.use(session({
  secret: process.env.SESSION_SECRET || "lostfound_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24  // 1 day
  }
}));

// ===============================
// Allow public assets WITHOUT auth
// (css, js, images served directly)
// ===============================
app.use("/css", express.static(path.join(__dirname, "public/css")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Only nav-auth.js is public — other JS needs login
app.use("/js/nav-auth.js", express.static(path.join(__dirname, "public/js/nav-auth.js")));

// Login and register pages are public
app.use("/login.html", express.static(path.join(__dirname, "public/login.html")));
app.use("/register.html", express.static(path.join(__dirname, "public/register.html")));

// ===============================
// Auth Routes (login/register API)
// Must be before auth guard
// ===============================
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// ===============================
// Auth Guard — all other requests
// require a valid session
// ===============================
app.use((req, res, next) => {
  if (!req.session.user) {
    // API calls get 401
    if (req.headers.accept?.includes("application/json") ||
        req.path.startsWith("/items")) {
      return res.status(401).json({ error: "Please login to continue." });
    }
    // Everything else redirects to login
    return res.redirect("/login.html");
  }
  next();
});

// ===============================
// Protected static files
// (only reached if logged in)
// ===============================
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// Protected API Routes
// ===============================
const itemRoutes = require("./routes/items");
app.use("/items", itemRoutes);

// Home Route
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/index.html");
  } else {
    res.redirect("/login.html");
  }
});

// ===============================
// 404 Handler
// ===============================
app.use((req, res, next) => {
  res.status(404).send("Page not found");
});

// ===============================
// Global Error Handler
// ===============================
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (req.headers.accept?.includes("application/json") || req.xhr) {
    res.status(500).json({ error: err.message || "Server error" });
  } else {
    res.status(500).send("Something went wrong. Please try again later.");
  }
});

// ===============================
// Start Server + Test DB
// ===============================
const PORT = process.env.PORT || 3000;

db.getConnection()
  .then(() => console.log("✅ MySQL Connected Successfully"))
  .catch((err) => console.error("❌ MySQL Connection Failed:", err.message));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));