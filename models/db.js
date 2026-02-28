const mysql = require("mysql2");
require("dotenv").config();

const url = new URL(process.env.DATABASE_URL);

const db = mysql.createPool({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.replace("/", ""),
  port: url.port,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = db.promise();