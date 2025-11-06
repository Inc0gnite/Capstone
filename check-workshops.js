const { PrismaClient } = require('@prisma/client');

async function checkWorkshops() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando talleres en la base de datos...');
    
    const workshops = await prisma.workshop.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        isActive: true
      }
    });
    
    console.log('📋 Talleres encontrados:');
    workshops.forEach(workshop => {
      console.log(`  - ID: ${workshop.id}`);
      console.log(`    Nombre: ${workshop.name}`);
      console.log(`    Código: ${workshop.code}`);
      console.log(`    Dirección: ${workshop.address}`);
      console.log(`    Activo: ${workshop.isActive}`);
      console.log('');
    });
    
    // Verificar específicamente el workshopId que se está usando
    const workshopId = '741d8bff-c6dc-4448-9552-134e36cdb848';
    const specificWorkshop = await prisma.workshop.findUnique({
      where: { id: workshopId }
    });
    
    if (specificWorkshop) {
      console.log('✅ El workshopId usado en el frontend SÍ existe:', specificWorkshop.name);
    } else {
      console.log('❌ El workshopId usado en el frontend NO existe:', workshopId);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWorkshops();


