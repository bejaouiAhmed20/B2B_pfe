const mysql = require('mysql2');
require('dotenv').config();

// Configuration de la connexion
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'b2b_db3'
});

console.log('Tentative de connexion à MySQL...');
console.log('Configuration:');
console.log('- Host:', process.env.DB_HOST || 'localhost');
console.log('- Port:', process.env.DB_PORT || 3306);
console.log('- User:', process.env.DB_USERNAME || 'root');
console.log('- Database:', process.env.DB_NAME || 'b2b_db3');

connection.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion à MySQL:', err.message);
    console.error('Code d\'erreur:', err.code);
    
    if (err.code === 'ECONNREFUSED') {
      console.log('\n🔧 Solutions possibles:');
      console.log('1. Vérifiez que MySQL est démarré');
      console.log('2. Vérifiez le port (3306 par défaut)');
      console.log('3. Vérifiez les paramètres de connexion');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Solutions possibles:');
      console.log('1. Vérifiez le nom d\'utilisateur et mot de passe');
      console.log('2. Vérifiez les permissions MySQL');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.log('\n🔧 Solutions possibles:');
      console.log('1. Créez la base de données:', process.env.DB_NAME || 'b2b_db3');
      console.log('2. Vérifiez le nom de la base de données');
    }
  } else {
    console.log('✅ Connexion à MySQL réussie!');
    
    // Test de création de la base de données si elle n'existe pas
    connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'b2b_db3'}`, (err) => {
      if (err) {
        console.error('❌ Erreur lors de la création de la base de données:', err.message);
      } else {
        console.log('✅ Base de données vérifiée/créée avec succès!');
      }
      
      connection.end();
    });
  }
});
