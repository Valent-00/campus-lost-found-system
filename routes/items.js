const express = require("express");
const router = express.Router();
const db = require("../models/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const xss = require("xss");
const { body, validationResult } = require("express-validator");

// ===============================
// Multer setup — save to public/uploads/
// ===============================
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ok =
      allowed.test(path.extname(file.originalname).toLowerCase()) &&
      allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Only image files are allowed"));
  }
});

// ===============================
// Validation rules for POST
// ===============================
const itemValidation = [
  body("name")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters."),
  body("description")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters."),
  body("category")
    .isIn(["Lost", "Found"])
    .withMessage("Category must be either Lost or Found."),
  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required."),
  body("item_date")
    .notEmpty()
    .withMessage("Date is required.")
    .isDate()
    .withMessage("Please enter a valid date."),
  body("contact_info")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Contact info must be at least 5 characters.")
];

// ===============================
// GET all items
// ===============================
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let rows;

    if (category) {
      [rows] = await db.query(
        "SELECT * FROM items WHERE category = ? ORDER BY created_at DESC",
        [category]
      );
    } else {
      [rows] = await db.query("SELECT * FROM items ORDER BY created_at DESC");
    }

    res.json(rows);
  } catch (err) {
    console.error("❌ GET /items error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// GET my items
// ===============================
router.get("/mine", async (req, res) => {
  const user = req.session?.user;
  if (!user) return res.status(401).json({ error: "Not logged in" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC",
      [user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ GET /items/mine error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// GET single item
// ===============================
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT items.*, users.name AS submitter_name
       FROM items
       LEFT JOIN users ON items.user_id = users.id
       WHERE items.id = ?`,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Item not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ GET /items/:id error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// POST create item
// ===============================
router.post("/", upload.single("image"), itemValidation, async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return res.status(400).json({ error: firstError });
  }

  // 🔐 Sanitize input (XSS protection)
  const name = xss(req.body.name);
  const description = xss(req.body.description);
  const category = xss(req.body.category);
  const location = xss(req.body.location);
  const item_date = xss(req.body.item_date);
  const contact_info = xss(req.body.contact_info);

  const user_id = req.session?.user?.id || null;
  const image = req.file ? "/uploads/" + req.file.filename : null;

  try {
    await db.query(
      `INSERT INTO items 
      (name, description, category, status, location, item_date, contact_info, image, user_id) 
      VALUES (?, ?, ?, 'Active', ?, ?, ?, ?, ?)`,
      [name, description, category, location, item_date, contact_info, image, user_id]
    );

    res.json({ message: "Report submitted successfully" });

  } catch (err) {
    console.error("❌ Insert error:", err.message);
    res.status(500).json({ error: "Database insert failed" });
  }
});

// ===============================
// PUT update status
// ===============================
router.put("/:id", async (req, res, next) => {
  const id = req.params.id;
  const status = xss(req.body.status);
  const user = req.session?.user;

  const allowed = ["Active", "Claimed", "Resolved"];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({
      error: "Status must be Active, Claimed, or Resolved"
    });
  }

  try {
    const [rows] = await db.query(
      "SELECT user_id FROM items WHERE id = ?",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Item not found" });

    if (rows[0].user_id !== null && rows[0].user_id !== user?.id) {
      return res.status(403).json({
        error: "You can only update your own reports."
      });
    }

    await db.query("UPDATE items SET status = ? WHERE id = ?", [status, id]);

    res.json({ message: "Status updated successfully" });

  } catch (err) {
    next(err);
  }
});

// ===============================
// DELETE item
// ===============================
router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  const user = req.session?.user;

  try {
    const [rows] = await db.query(
      "SELECT user_id FROM items WHERE id = ?",
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Item not found" });

    if (rows[0].user_id !== null && rows[0].user_id !== user?.id) {
      return res.status(403).json({
        error: "You can only delete your own reports."
      });
    }

    await db.query("DELETE FROM items WHERE id = ?", [id]);

    res.json({ message: "Item deleted successfully" });

  } catch (err) {
    next(err);
  }
});

module.exports = router;