const { PrismaClient } = require('@prisma/client');

async function checkPermissions() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando permisos del rol Guardia...');
    
    // Buscar el rol Guardia
    const guardiaRole = await prisma.role.findFirst({
      where: { name: 'Guardia' },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });
    
    if (!guardiaRole) {
      console.log('❌ Rol Guardia no encontrado');
      return;
    }
    
    console.log('✅ Rol Guardia encontrado:', guardiaRole.name);
    console.log('🆔 ID del rol:', guardiaRole.id);
    console.log('📋 Permisos asignados:');
    
    guardiaRole.rolePermissions.forEach(rp => {
      console.log(`  - ${rp.permission.resource}:${rp.permission.action}`);
    });
    
    // Verificar específicamente el permiso regions:read
    const regionsReadPermission = await prisma.permission.findFirst({
      where: {
        resource: 'regions',
        action: 'read'
      }
    });
    
    if (!regionsReadPermission) {
      console.log('❌ Permiso regions:read no existe');
      return;
    }
    
    console.log('✅ Permiso regions:read existe:', regionsReadPermission.id);
    
    // Verificar si está asignado al rol guardia
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        roleId: guardiaRole.id,
        permissionId: regionsReadPermission.id
      }
    });
    
    if (rolePermission) {
      console.log('✅ Permiso regions:read está asignado al rol Guardia');
    } else {
      console.log('❌ Permiso regions:read NO está asignado al rol Guardia');
      console.log('🔧 Agregando permiso...');
      
      await prisma.rolePermission.create({
        data: {
          roleId: guardiaRole.id,
          permissionId: regionsReadPermission.id
        }
      });
      
      console.log('✅ Permiso agregado exitosamente');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissions();


