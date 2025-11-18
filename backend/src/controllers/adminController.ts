import { Request, Response } from 'express'
import prisma from '../config/database'
import { sendSuccess, sendError } from '../utils/response'

/**
 * Controlador de administración (endpoints temporales para migraciones)
 */
export class AdminController {
  /**
   * POST /api/admin/add-reports-permission
   * Agregar permiso reports:read a roles Administrador y Jefe de Taller
   * Endpoint temporal para migración de permisos
   */
  async addReportsPermission(_req: Request, res: Response) {
    try {
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
      const results: any[] = []
      
      for (const roleName of rolesToUpdate) {
        console.log(`\n🔍 Procesando rol: ${roleName}...`)
        
        const role = await prisma.role.findFirst({
          where: { name: roleName }
        })

        if (!role) {
          results.push({ role: roleName, status: 'not_found', message: `Rol ${roleName} no encontrado` })
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
          results.push({ 
            role: roleName, 
            status: 'already_exists', 
            message: `El permiso ya está asignado al rol ${roleName}` 
          })
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
          results.push({ 
            role: roleName, 
            status: 'success', 
            message: `Permiso asignado exitosamente al rol ${roleName}` 
          })
          console.log(`✅ Permiso asignado exitosamente al rol ${roleName}!`)
        } catch (error: any) {
          if (error.code === 'P2002') {
            results.push({ 
              role: roleName, 
              status: 'duplicate', 
              message: `El permiso ya estaba asignado (duplicado detectado)` 
            })
          } else {
            throw error
          }
        }
      }

      return sendSuccess(res, {
        permission: {
          id: reportsPermission.id,
          resource: reportsPermission.resource,
          action: reportsPermission.action
        },
        roles: results,
        message: 'Proceso completado'
      }, 'Permiso reports:read agregado exitosamente')
    } catch (error: any) {
      console.error('❌ Error:', error)
      return sendError(res, error.message, 500)
    }
  }
}

export default new AdminController()

