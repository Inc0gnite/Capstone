// Script para reiniciar el backend
const { exec } = require('child_process');

console.log('🔄 Reiniciando backend...');

// Matar procesos en el puerto 3000
exec('netstat -ano | findstr :3000', (error, stdout, stderr) => {
  if (stdout) {
    const lines = stdout.split('\n');
    const pids = [];
    
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length > 4 && parts[1].includes(':3000') && parts[3] === 'LISTENING') {
        pids.push(parts[4]);
      }
    });
    
    if (pids.length > 0) {
      console.log(`🔍 Encontrados procesos en puerto 3000: ${pids.join(', ')}`);
      
      pids.forEach(pid => {
        exec(`taskkill /PID ${pid} /F`, (error, stdout, stderr) => {
          if (error) {
            console.log(`❌ Error matando proceso ${pid}:`, error.message);
          } else {
            console.log(`✅ Proceso ${pid} terminado`);
          }
        });
      });
    } else {
      console.log('✅ No hay procesos en puerto 3000');
    }
  }
  
  // Esperar un momento y luego iniciar el backend
  setTimeout(() => {
    console.log('🚀 Iniciando backend...');
    exec('cd backend && npm run dev', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error iniciando backend:', error);
        return;
      }
      console.log('✅ Backend iniciado correctamente');
    });
  }, 2000);
});


