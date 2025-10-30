// Script para probar la conexión a la base de datos PostgreSQL
import pkg from 'pg';
const { Client } = pkg;

// Leer variables de entorno desde .env
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

console.log('🔍 Probando conexión a la base de datos...\n');

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL no está definida en el archivo .env');
  process.exit(1);
}

// Extraer información de la URL
const urlMatch = DATABASE_URL.match(/postgresql:\/\/(\w+):(\w+)@([^:]+):(\d+)\/(\w+)/);
if (!urlMatch) {
  console.error('❌ Error: DATABASE_URL tiene un formato incorrecto');
  process.exit(1);
}

const [, user, password, host, port, database] = urlMatch;

console.log('📋 Información de conexión:');
console.log(`   Host: ${host}`);
console.log(`   Puerto: ${port}`);
console.log(`   Base de datos: ${database}`);
console.log(`   Usuario: ${user}`);
console.log('');

// Crear cliente de PostgreSQL
const client = new Client({
  host,
  port: parseInt(port),
  database,
  user,
  password,
  connectionTimeoutMillis: 5000, // 5 segundos de timeout
});

// Intentar conectar
const startTime = Date.now();

client.connect()
  .then(() => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ Conexión exitosa!');
    console.log(`   Tiempo de respuesta: ${duration}ms`);
    
    // Probar una consulta simple
    return client.query('SELECT NOW() as current_time, version() as version');
  })
  .then((result) => {
    console.log('\n📊 Información de la base de datos:');
    console.log(`   Hora del servidor: ${result.rows[0].current_time}`);
    console.log(`   Versión de PostgreSQL: ${result.rows[0].version}`);
    
    // Probar el número de tablas
    return client.query(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
  })
  .then((result) => {
    console.log(`   Tablas en la base de datos: ${result.rows[0].table_count}`);
    
    console.log('\n✅ Todas las pruebas pasaron correctamente!\n');
    client.end();
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error al conectar a la base de datos:');
    console.error(`   Tipo: ${error.code || 'Unknown'}`);
    console.error(`   Mensaje: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Posibles soluciones:');
      console.error('   1. Verifica que PostgreSQL esté ejecutándose');
      console.error(`   2. Verifica que el puerto ${port} esté abierto`);
      console.error('   3. Ejecuta: sudo service postgresql start (Linux)');
      console.error('   4. O reinicia el servicio de PostgreSQL');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Solución:');
      console.error('   El host no se puede encontrar. Verifica la configuración de red.');
    } else if (error.code === 'EAI_AGAIN') {
      console.error('\n💡 Solución:');
      console.error('   No se puede resolver el nombre del host.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Solución:');
      console.error('   Timeout: El servidor no respondió a tiempo.');
    } else if (error.code === '28P01') {
      console.error('\n💡 Solución:');
      console.error('   Credenciales incorrectas. Verifica usuario y contraseña.');
    } else if (error.code === '3D000') {
      console.error('\n💡 Solución:');
      console.error(`   La base de datos "${database}" no existe.`);
    }
    
    console.error('');
    client.end();
    process.exit(1);
  });

