import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Agregando permiso reports:read a roles apropiados...')
  
  // Buscar o crear el permiso reports:read
  let reportsPermission = await prisma.permission.findFirst({
    where: {
      resource: 'reports',
      action: 'read'
    }
  })

  if (!reportsPermission) {
    console.log('💡 Creando el permiso reports:read...')
    reportsPermission = await prisma.permission.create({
      data: {
        resource: 'reports',
        action: 'read',
        description: 'Ver y generar reportes'
      }
    })
    console.log('✅ Permiso creado:', reportsPermission.id)
  } else {
    console.log('✅ Permiso reports:read encontrado:', reportsPermission.id)
  }

  // Roles que deberían tener acceso a reportes
  const rolesToUpdate = ['Administrador', 'Jefe de Taller']
  
  for (const roleName of rolesToUpdate) {
    console.log(`\n🔍 Procesando rol: ${roleName}...`)
    
    const role = await prisma.role.findFirst({
      where: { name: roleName }
    })

    if (!role) {
      console.log(`❌ No se encontró el rol ${roleName}`)
      continue
    }

    console.log(`✅ Rol ${roleName} encontrado:`, role.id)

    // Verificar si ya existe la relación
    const existingPermission = await prisma.rolePermission.findFirst({
      where: {
        roleId: role.id,
        permissionId: reportsPermission.id
      }
    })

    if (existingPermission) {
      console.log(`✅ El permiso ya está asignado al rol ${roleName}`)
      console.log('   Fecha de asignación:', existingPermission.createdAt)
      continue
    }

    // Crear la relación
    console.log(`📝 Asignando permiso reports:read al rol ${roleName}...`)
    try {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: reportsPermission.id
        }
      })
      console.log(`✅ Permiso asignado exitosamente al rol ${roleName}!`)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`✅ El permiso ya estaba asignado (duplicado detectado)`)
      } else {
        throw error
      }
    }
  }

  console.log('\n✅ Proceso completado!')
  console.log('   Los roles Administrador y Jefe de Taller ahora pueden generar reportes de flota')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

