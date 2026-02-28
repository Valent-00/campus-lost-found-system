const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../models/db");

const EMAIL_DOMAIN = "@quest.edu.my";

// ===============================
// POST /auth/register
// ===============================
router.post("/register", async (req, res) => {
  const { name, email, password, confirm_password } = req.body;

  // Validate email domain
  if (!email || !email.toLowerCase().endsWith(EMAIL_DOMAIN)) {
    return res.status(400).json({ error: `Only ${EMAIL_DOMAIN} email addresses are allowed.` });
  }

  // Validate password match
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: "Passwords do not match." });
  }

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Full name is required." });
  }

  try {
    // Check if email already exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name.trim(), email.toLowerCase(), hashedPassword]
    );

    res.status(200).json({ message: "Account created successfully! You can now log in." });

  } catch (err) {
    console.error("❌ Register error:", err.message);
    res.status(500).json({ error: "Registration failed: " + err.message });
  }
});

// ===============================
// POST /auth/login
// ===============================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Save user in session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    res.json({ message: "Login successful!", user: req.session.user });

  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Login failed: " + err.message });
  }
});

// ===============================
// POST /auth/logout
// ===============================
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully." });
  });
});

// ===============================
// GET /auth/me — check session
// ===============================
router.get("/me", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

module.exports = router;