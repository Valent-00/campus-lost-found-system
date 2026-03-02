const mysql = require("mysql2");
require("dotenv").config();

let db;

if (process.env.DATABASE_URL) {
  // Railway / Production
  const url = new URL(process.env.DATABASE_URL);

  db = mysql.createPool({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.replace("/", ""),
    port: url.port,
    waitForConnections: true,
    connectionLimit: 10,
  });

  console.log("🌐 Using Railway DATABASE_URL");
} else {
  // Local development
  db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
  });

  console.log("💻 Using Local DB config");
}

module.exports = db.promise();