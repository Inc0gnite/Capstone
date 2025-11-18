import prisma from '../config/database'
import logger from '../config/logger'

/**
 * Migración automática de permisos
 * Se ejecuta al iniciar el servidor para asegurar que los permisos necesarios existan
 */
export async function migrateReportsPermission() {
  try {
    logger.info('🔍 Verificando permiso reports:read...')
    
    // Buscar o crear el permiso reports:read
    let reportsPermission = await prisma.permission.findFirst({
      where: {
        resource: 'reports',
        action: 'read'
      }
    })

    if (!reportsPermission) {
      logger.info('💡 Creando el permiso reports:read...')
      reportsPermission = await prisma.permission.create({
        data: {
          resource: 'reports',
          action: 'read',
          description: 'Ver y generar reportes'
        }
      })
      logger.info(`✅ Permiso creado: ${reportsPermission.id}`)
    } else {
      logger.info(`✅ Permiso reports:read ya existe: ${reportsPermission.id}`)
    }

    // Roles que deberían tener acceso a reportes
    const rolesToUpdate = ['Administrador', 'Jefe de Taller']
    let addedCount = 0
    
    for (const roleName of rolesToUpdate) {
      const role = await prisma.role.findFirst({
        where: { name: roleName }
      })

      if (!role) {
        logger.warn(`⚠️  Rol ${roleName} no encontrado`)
        continue
      }

      // Verificar si ya existe la relación
      const existingPermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: role.id,
          permissionId: reportsPermission.id
        }
      })

      if (existingPermission) {
        logger.info(`✅ Rol ${roleName} ya tiene el permiso reports:read`)
        continue
      }

      // Crear la relación
      try {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: reportsPermission.id
          }
        })
        logger.info(`✅ Permiso reports:read asignado al rol ${roleName}`)
        addedCount++
      } catch (error: any) {
        if (error.code === 'P2002') {
          logger.info(`✅ Permiso ya estaba asignado al rol ${roleName} (duplicado detectado)`)
        } else {
          logger.error(`❌ Error asignando permiso a ${roleName}:`, error)
        }
      }
    }

    if (addedCount > 0) {
      logger.info(`✅ Migración completada: ${addedCount} permisos agregados`)
    } else {
      logger.info('✅ Migración completada: todos los permisos ya estaban asignados')
    }
  } catch (error: any) {
    logger.error('❌ Error en migración de permisos:', error)
    // No lanzar error para que el servidor pueda iniciar incluso si falla la migración
  }
}

