import mysql from "mysql";

console.log("db");

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '0219JK0114WK!@',
    database : 'userdb'
  });
   
connection.connect();

export default connection;