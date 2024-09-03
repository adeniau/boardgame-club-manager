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
  
 
// Expose a method to establish connection with MariaDB SkySQL
module.exports = Object.freeze({
  pool: pool
});