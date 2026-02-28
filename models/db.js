const mysql = require("mysql2");

const db = mysql.createPool(process.env.DATABASE_URL);

module.exports = db.promise();