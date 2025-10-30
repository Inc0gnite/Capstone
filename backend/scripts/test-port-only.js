// Script simple para probar solo el puerto de la base de datos
import net from 'net';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const DATABASE_URL = process.env.DATABASE_URL;

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

console.log(`🔍 Probando puerto ${port} en ${host}...\n`);

// Crear conexión TCP simple
const socket = new net.Socket();
const startTime = Date.now();

socket.setTimeout(5000);

socket.on('connect', () => {
  const duration = Date.now() - startTime;
  console.log(`✅ Puerto ${port} está abierto y accesible`);
  console.log(`   Tiempo de respuesta: ${duration}ms`);
  socket.destroy();
  process.exit(0);
});

socket.on('timeout', () => {
  console.log(`❌ Timeout: El puerto ${port} no respondió`);
  socket.destroy();
  process.exit(1);
});

socket.on('error', (error) => {
  console.log(`❌ Error al conectar al puerto ${port}:`);
  
  if (error.code === 'ECONNREFUSED') {
    console.log(`   Conexión rechazada. PostgreSQL no está ejecutándose en el puerto ${port}`);
    console.log('\n💡 Soluciones:');
    console.log('   1. Inicia PostgreSQL: sudo service postgresql start');
    console.log('   2. Verifica que el puerto esté correcto en .env');
    console.log('   3. Verifica si PostgreSQL está escuchando en otro puerto');
  } else if (error.code === 'ETIMEDOUT') {
    console.log('   Timeout: El servidor no respondió');
  } else if (error.code === 'ENOTFOUND') {
    console.log(`   Host "${host}" no encontrado`);
  } else {
    console.log(`   ${error.message}`);
  }
  
  socket.destroy();
  process.exit(1);
});

// Intentar conectar
socket.connect(port, host);

