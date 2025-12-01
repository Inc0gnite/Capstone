/**
 * Script para agregar permiso work-orders:read al rol Guardia
 * Este script busca el permiso y el rol por nombre, no por índice
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Iniciando asignación de permiso work-orders:read al rol Guardia...')

  try {
    // Buscar el rol Guardia
    const guardiaRole = await prisma.role.findUnique({
      where: { name: 'Guardia' },
    })

    if (!guardiaRole) {
      console.error('❌ No se encontró el rol "Guardia"')
      process.exit(1)
    }

    console.log(`✅ Rol Guardia encontrado: ${guardiaRole.id}`)

    // Buscar el permiso work-orders:read
    const workOrdersReadPermission = await prisma.permission.findFirst({
      where: {
        resource: 'work-orders',
        action: 'read',
      },
    })

    if (!workOrdersReadPermission) {
      console.error('❌ No se encontró el permiso "work-orders:read"')
      console.log('📝 Creando el permiso...')
      
      const newPermission = await prisma.permission.create({
        data: {
          resource: 'work-orders',
          action: 'read',
          description: 'Ver órdenes de trabajo',
        },
      })
      
      console.log(`✅ Permiso creado: ${newPermission.id}`)
      
      // Asignar el permiso al rol Guardia
      await prisma.rolePermission.create({
        data: {
          roleId: guardiaRole.id,
          permissionId: newPermission.id,
        },
      })
      
      console.log('✅ Permiso work-orders:read asignado al rol Guardia exitosamente')
    } else {
      console.log(`✅ Permiso work-orders:read encontrado: ${workOrdersReadPermission.id}`)

      // Verificar si el permiso ya está asignado
      const existingPermission = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: guardiaRole.id,
            permissionId: workOrdersReadPermission.id,
          },
        },
      })

      if (existingPermission) {
        console.log('ℹ️  El permiso work-orders:read ya está asignado al rol Guardia')
      } else {
        // Asignar el permiso al rol Guardia
        await prisma.rolePermission.create({
          data: {
            roleId: guardiaRole.id,
            permissionId: workOrdersReadPermission.id,
          },
        })

        console.log('✅ Permiso work-orders:read asignado al rol Guardia exitosamente')
      }
    }

    // Verificar los permisos actuales del rol Guardia
    const guardiaWithPermissions = await prisma.role.findUnique({
      where: { id: guardiaRole.id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    console.log('\n📋 Permisos actuales del rol Guardia:')
    guardiaWithPermissions?.permissions.forEach((rp) => {
      console.log(`   - ${rp.permission.resource}:${rp.permission.action}`)
    })

    console.log('\n✅ Proceso completado exitosamente')
  } catch (error) {
    console.error('❌ Error al asignar permiso:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()

