#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

/**
 * Script de mantenimiento para sincronizar IDs del frontend con la base de datos
 * 
 * Este script:
 * 1. Obtiene los IDs reales de la base de datos
 * 2. Actualiza el configService.ts con los IDs correctos
 * 3. Verifica que no haya IDs inválidos
 * 4. Genera un reporte de cambios
 * 
 * Uso: node scripts/maintain-frontend-ids.mjs
 */

async function maintainFrontendIds() {
  const startTime = new Date()
  console.log('🔄 Iniciando mantenimiento de IDs del frontend...')
  console.log(`⏰ ${startTime.toLocaleString()}\n`)
  
  try {
    // 1. Obtener IDs reales de la base de datos
    console.log('📊 Obteniendo datos de la base de datos...')
    const [regions, workshops] = await Promise.all([
      prisma.region.findMany({
        select: { id: true, code: true, name: true }
      }),
      prisma.workshop.findMany({
        select: { id: true, code: true, name: true, regionId: true }
      })
    ])
    
    console.log(`   ✅ ${regions.length} regiones encontradas`)
    console.log(`   ✅ ${workshops.length} talleres encontrados`)
    
    // 2. Leer archivo de configuración actual
    const configServicePath = path.join(process.cwd(), '..', 'frontend', 'src', 'services', 'configService.ts')
    let configContent = await fs.promises.readFile(configServicePath, 'utf8')
    
    // 3. Extraer IDs actuales del archivo
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
    const currentIds = [...new Set(configContent.match(uuidRegex) || [])]
    
    console.log(`\n🔍 IDs actuales en configService.ts: ${currentIds.length}`)
    
    // 4. Obtener IDs reales de la base de datos
    const realIds = [...regions.map(r => r.id), ...workshops.map(w => w.id)]
    
    // 5. Identificar IDs que necesitan actualización
    const invalidIds = currentIds.filter(id => !realIds.includes(id))
    const missingIds = realIds.filter(id => !currentIds.includes(id))
    
    console.log(`   ⚠️  IDs inválidos: ${invalidIds.length}`)
    console.log(`   ➕ IDs faltantes: ${missingIds.length}`)
    
    if (invalidIds.length === 0 && missingIds.length === 0) {
      console.log('\n✅ Todos los IDs están sincronizados. No se requieren cambios.')
      return
    }
    
    // 6. Actualizar el archivo
    console.log('\n🔄 Actualizando configService.ts...')
    
    // Actualizar regiones
    const regionsCode = regions.map(region => 
      `      { id: '${region.id}', code: '${region.code}', name: '${region.name}' }`
    ).join(',\n')
    
    const regionsRegex = /private getDefaultRegions\(\): Region\[\] \{\s*return \[\s*([\s\S]*?)\s*\]\s*\}/g
    configContent = configContent.replace(regionsRegex, 
      `private getDefaultRegions(): Region[] {
    return [
${regionsCode}
    ]
  }`)
    
    // Actualizar talleres
    const workshopsCode = workshops.map(workshop => 
      `      { 
        id: '${workshop.id}', 
        code: '${workshop.code}', 
        name: '${workshop.name}',
        regionId: '${workshop.regionId}'
      }`
    ).join(',\n')
    
    const workshopsRegex = /private getDefaultWorkshops\(\): Workshop\[\] \{\s*return \[\s*([\s\S]*?)\s*\]\s*\}/g
    configContent = configContent.replace(workshopsRegex, 
      `private getDefaultWorkshops(): Workshop[] {
    return [
${workshopsCode}
    ]
  }`)
    
    // Actualizar fallback del taller por defecto
    if (workshops.length > 0) {
      const defaultWorkshopId = workshops[0].id
      configContent = configContent.replace(
        /return '[0-9a-f-]{36}'/g,
        `return '${defaultWorkshopId}'`
      )
    }
    
    // 7. Escribir archivo actualizado
    await fs.promises.writeFile(configServicePath, configContent, 'utf8')
    
    // 8. Verificación final
    console.log('🔍 Verificando actualización...')
    const updatedContent = await fs.promises.readFile(configServicePath, 'utf8')
    const updatedIds = [...new Set(updatedContent.match(uuidRegex) || [])]
    const remainingInvalidIds = updatedIds.filter(id => !realIds.includes(id))
    
    if (remainingInvalidIds.length === 0) {
      console.log('✅ Verificación exitosa: Todos los IDs son válidos')
    } else {
      console.log(`⚠️  Aún hay ${remainingInvalidIds.length} IDs inválidos:`)
      remainingInvalidIds.forEach(id => console.log(`   - ${id}`))
    }
    
    // 9. Reporte final
    const endTime = new Date()
    const duration = endTime.getTime() - startTime.getTime()
    
    console.log('\n📊 Reporte de mantenimiento:')
    console.log(`   ⏱️  Duración: ${duration}ms`)
    console.log(`   🔄 IDs actualizados: ${invalidIds.length + missingIds.length}`)
    console.log(`   ✅ Estado final: ${remainingInvalidIds.length === 0 ? 'Sincronizado' : 'Requiere revisión manual'}`)
    
    if (invalidIds.length > 0) {
      console.log('\n📋 IDs que fueron reemplazados:')
      invalidIds.forEach(id => console.log(`   - ${id}`))
    }
    
    if (missingIds.length > 0) {
      console.log('\n📋 IDs que fueron agregados:')
      missingIds.forEach(id => console.log(`   - ${id}`))
    }
    
  } catch (error) {
    console.error('❌ Error durante el mantenimiento:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  maintainFrontendIds()
}

export { maintainFrontendIds }









