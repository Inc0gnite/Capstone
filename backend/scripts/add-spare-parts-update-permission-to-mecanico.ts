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
    return
  }

  console.log('✅ Rol Mecánico encontrado:', mecanicoRole.id)

  // Buscar el permiso spare-parts:update
  const updatePermission = await prisma.permission.findFirst({
    where: {
      resource: 'spare-parts',
      action: 'update'
    }
  })

  if (!updatePermission) {
    console.error('❌ No se encontró el permiso spare-parts:update')
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
    return
  }

  // Crear la relación
  console.log('📝 Asignando permiso spare-parts:update al rol Mecánico...')
  await prisma.rolePermission.create({
    data: {
      roleId: mecanicoRole.id,
      permissionId: updatePermission.id
    }
  })

  console.log('✅ Permiso asignado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

