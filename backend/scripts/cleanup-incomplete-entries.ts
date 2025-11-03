import prisma from '../src/config/database'

/**
 * Script para limpiar registros de vehículos ingresados que nunca completaron el proceso correctamente
 */

interface ProblematicEntry {
  id: string
  entryCode: string
  vehicleId: string
  driverName: string
  entryDate: Date
  status: string
  hasWorkOrders: boolean
  hasPhotos: boolean
  hasKeyControl: boolean
  issues: string[]
}

async function identifyProblematicEntries(): Promise<ProblematicEntry[]> {
  console.log('🔍 Identificando registros problemáticos...')
  
  // Buscar todos los ingresos con estado "ingresado" que podrían ser problemáticos
  const entries = await prisma.vehicleEntry.findMany({
    where: {
      status: 'ingresado',
      exitDate: null
    },
    include: {
      workOrders: true,
      photos: true,
      keyControl: true,
      vehicle: true
    }
  })

  console.log(`📊 Total de ingresos activos encontrados: ${entries.length}`)

  const problematicEntries: ProblematicEntry[] = []

  for (const entry of entries) {
    const issues: string[] = []
    
    // Verificar si tiene órdenes de trabajo
    if (entry.workOrders.length === 0) {
      issues.push('Sin órdenes de trabajo')
    }
    
    // Verificar si tiene fotos
    if (entry.photos.length === 0) {
      issues.push('Sin fotos del vehículo')
    }
    
    // Verificar si tiene control de llaves
    if (!entry.keyControl) {
      issues.push('Sin control de llaves')
    }
    
    // Verificar si el vehículo existe
    if (!entry.vehicle) {
      issues.push('Vehículo no existe')
    }
    
    // Verificar si la fecha de ingreso es muy antigua (más de 30 días)
    const daysSinceEntry = Math.floor((Date.now() - entry.entryDate.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSinceEntry > 30) {
      issues.push(`Ingreso muy antiguo (${daysSinceEntry} días)`)
    }
    
    // Verificar si el código de ingreso es válido
    if (!entry.entryCode || entry.entryCode.length < 10) {
      issues.push('Código de ingreso inválido')
    }
    
    // Si tiene múltiples problemas, es probable que sea un registro problemático
    if (issues.length >= 2) {
      problematicEntries.push({
        id: entry.id,
        entryCode: entry.entryCode,
        vehicleId: entry.vehicleId,
        driverName: entry.driverName,
        entryDate: entry.entryDate,
        status: entry.status,
        hasWorkOrders: entry.workOrders.length > 0,
        hasPhotos: entry.photos.length > 0,
        hasKeyControl: !!entry.keyControl,
        issues
      })
    }
  }

  return problematicEntries
}

async function cleanupProblematicEntries(entries: ProblematicEntry[], dryRun: boolean = true): Promise<void> {
  console.log(`\n🧹 ${dryRun ? 'SIMULACIÓN' : 'ELIMINANDO'} registros problemáticos...`)
  
  for (const entry of entries) {
    console.log(`\n📋 Registro: ${entry.entryCode}`)
    console.log(`   Conductor: ${entry.driverName}`)
    console.log(`   Fecha: ${entry.entryDate.toLocaleDateString('es-CL')}`)
    console.log(`   Problemas: ${entry.issues.join(', ')}`)
    
    if (!dryRun) {
      try {
        // Eliminar en orden correcto para evitar problemas de foreign key
        await prisma.$transaction(async (tx) => {
          // 1. Eliminar fotos
          await tx.vehicleEntryPhoto.deleteMany({
            where: { entryId: entry.id }
          })
          
          // 2. Eliminar control de llaves
          await tx.keyControl.deleteMany({
            where: { entryId: entry.id }
          })
          
          // 3. Eliminar órdenes de trabajo relacionadas
          await tx.workOrder.deleteMany({
            where: { entryId: entry.id }
          })
          
          // 4. Eliminar el ingreso
          await tx.vehicleEntry.delete({
            where: { id: entry.id }
          })
        })
        
        console.log(`   ✅ Eliminado exitosamente`)
      } catch (error) {
        console.log(`   ❌ Error al eliminar: ${error}`)
      }
    } else {
      console.log(`   🔍 [SIMULACIÓN] Se eliminaría este registro`)
    }
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando limpieza de registros problemáticos...\n')
    
    // Identificar registros problemáticos
    const problematicEntries = await identifyProblematicEntries()
    
    console.log(`\n📊 Resumen:`)
    console.log(`   Total de registros problemáticos encontrados: ${problematicEntries.length}`)
    
    if (problematicEntries.length === 0) {
      console.log('✅ No se encontraron registros problemáticos')
      return
    }
    
    // Mostrar detalles
    console.log('\n📋 Detalles de registros problemáticos:')
    problematicEntries.forEach((entry, index) => {
      console.log(`\n${index + 1}. ${entry.entryCode}`)
      console.log(`   Conductor: ${entry.driverName}`)
      console.log(`   Fecha: ${entry.entryDate.toLocaleDateString('es-CL')}`)
      console.log(`   Problemas: ${entry.issues.join(', ')}`)
    })
    
    // Preguntar si continuar
    console.log('\n⚠️  ADVERTENCIA: Esta operación eliminará permanentemente los registros problemáticos.')
    console.log('   Asegúrate de hacer un backup de la base de datos antes de continuar.')
    
    // Por ahora, solo mostrar la simulación
    await cleanupProblematicEntries(problematicEntries, true)
    
    console.log('\n✅ Simulación completada. Para ejecutar la limpieza real, modifica el script.')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el script
main()














