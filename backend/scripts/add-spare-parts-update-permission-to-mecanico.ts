import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Buscando rol Mecánico...')
  
  // Buscar el rol Mecánico
  const mecanicoRole = await prisma.role.findFirst({
    where: { name: 'Mecánico' }
  })

  if (!mecanicoRole) {
    console.error('❌ No se encontró el rol Mecánico')
    process.exit(1)
  }

  console.log('✅ Rol Mecánico encontrado:', mecanicoRole.id, mecanicoRole.name)

  // Buscar el permiso spare-parts:update
  const updatePermission = await prisma.permission.findFirst({
    where: {
      resource: 'spare-parts',
      action: 'update'
    }
  })

  if (!updatePermission) {
    console.error('❌ No se encontró el permiso spare-parts:update')
    console.log('💡 Creando el permiso...')
    
    // Crear el permiso si no existe
    const newPermission = await prisma.permission.create({
      data: {
        resource: 'spare-parts',
        action: 'update',
        description: 'Actualizar repuestos'
      }
    })
    console.log('✅ Permiso creado:', newPermission.id)
    
    // Usar el nuevo permiso
    const permissionId = newPermission.id
    
    // Verificar si ya existe la relación
    const existingPermission = await prisma.rolePermission.findFirst({
      where: {
        roleId: mecanicoRole.id,
        permissionId: permissionId
      }
    })

    if (existingPermission) {
      console.log('✅ El permiso ya está asignado al rol Mecánico')
      return
    }

    // Crear la relación usando upsert para evitar errores
    console.log('📝 Asignando permiso spare-parts:update al rol Mecánico...')
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: mecanicoRole.id,
          permissionId: permissionId
        }
      },
      update: {},
      create: {
        roleId: mecanicoRole.id,
        permissionId: permissionId
      }
    })

    console.log('✅ Permiso asignado exitosamente!')
    return
  }

  console.log('✅ Permiso spare-parts:update encontrado:', updatePermission.id)

  // Verificar si ya existe la relación
  const existingPermission = await prisma.rolePermission.findFirst({
    where: {
      roleId: mecanicoRole.id,
      permissionId: updatePermission.id
    }
  })

  if (existingPermission) {
    console.log('✅ El permiso ya está asignado al rol Mecánico')
    console.log('   Fecha de asignación:', existingPermission.createdAt)
    return
  }

  // Crear la relación usando upsert para evitar errores de duplicados
  console.log('📝 Asignando permiso spare-parts:update al rol Mecánico...')
  try {
    await prisma.rolePermission.create({
      data: {
        roleId: mecanicoRole.id,
        permissionId: updatePermission.id
      }
    })
    console.log('✅ Permiso asignado exitosamente!')
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('✅ El permiso ya estaba asignado (duplicado detectado)')
    } else {
      throw error
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

