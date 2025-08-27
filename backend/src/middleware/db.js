// Use the MariaDB Node.js Connector
var mariadb = require('mariadb');
 
// Create a connection pool
var pool = 
  mariadb.createPool({
    host: 'db', // Le nom du service Docker pour MariaDB
    port: process.env.MYSQL_PORT,
    // Conversion automatique des BigInt en chaînes
    supportBigNumbers: true,
    bigNumberStrings: true,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  });
  
 
// Expose a method to establish connection with MariaDB
module.exports = Object.freeze({
  pool: pool,
  query: async (sql, params) => {
    let conn;
    try {
      conn = await pool.getConnection();
      const result = await conn.query(sql, params);
      return [result];
    } catch (err) {
      throw err;
    } finally {
      if (conn) conn.end();
    }
  }
});