import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database:  'ctrl_animals',
  password: 'lari123'
});

export default db;