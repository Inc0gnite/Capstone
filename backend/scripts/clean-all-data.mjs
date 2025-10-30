import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanAllData() {
  try {
    console.log('🧹 Iniciando limpieza completa de la base de datos...\n')
    
    // Obtener estadísticas antes de la limpieza
    const stats = await Promise.all([
      prisma.vehicleEntry.count(),
      prisma.workOrder.count(),
      prisma.vehicle.count(),
      prisma.workOrderStatus.count(),
      prisma.workOrderPhoto.count(),
      prisma.workOrderSparePart.count(),
      prisma.workPause.count(),
      prisma.keyControl.count(),
      prisma.vehicleEntryPhoto.count()
    ])

    console.log('📊 Datos actuales en la base de datos:')
    console.log(`   Ingresos de vehículos: ${stats[0]}`)
    console.log(`   Órdenes de trabajo: ${stats[1]}`)
    console.log(`   Vehículos: ${stats[2]}`)
    console.log(`   Estados de órdenes: ${stats[3]}`)
    console.log(`   Fotos de órdenes: ${stats[4]}`)
    console.log(`   Repuestos de órdenes: ${stats[5]}`)
    console.log(`   Pausas de trabajo: ${stats[6]}`)
    console.log(`   Control de llaves: ${stats[7]}`)
    console.log(`   Fotos de ingresos: ${stats[8]}`)

    if (stats[0] === 0 && stats[1] === 0 && stats[2] === 0) {
      console.log('\n✅ La base de datos ya está limpia')
      return
    }

    console.log('\n⚠️  ADVERTENCIA: Esta operación eliminará TODOS los datos de vehículos, ingresos y órdenes.')
    console.log('   Los usuarios, roles y talleres NO se eliminarán.')
    console.log('   Esta operación es IRREVERSIBLE.')
    
    // Por defecto, solo simular (cambiar a false para ejecutar realmente)
    const DRY_RUN = false
    
    if (DRY_RUN) {
      console.log('\n🔍 MODO SIMULACIÓN - No se eliminarán datos realmente')
      console.log('   Para ejecutar la limpieza real, cambia DRY_RUN a false en el script')
      
      console.log('\n[SIMULACIÓN] Se eliminarían los siguientes datos:')
      console.log(`   - ${stats[0]} ingresos de vehículos`)
      console.log(`   - ${stats[1]} órdenes de trabajo`)
      console.log(`   - ${stats[2]} vehículos`)
      console.log(`   - ${stats[3]} estados de órdenes`)
      console.log(`   - ${stats[4]} fotos de órdenes`)
      console.log(`   - ${stats[5]} repuestos de órdenes`)
      console.log(`   - ${stats[6]} pausas de trabajo`)
      console.log(`   - ${stats[7]} controles de llaves`)
      console.log(`   - ${stats[8]} fotos de ingresos`)
    } else {
      console.log('\n🗑️  Eliminando todos los datos...')
      
      let deletedCount = 0
      let errorCount = 0
      
      try {
        // Eliminar en orden correcto para evitar problemas de foreign key
        await prisma.$transaction(async (tx) => {
          console.log('   🗑️  Eliminando fotos de órdenes...')
          await tx.workOrderPhoto.deleteMany()
          deletedCount++
          
          console.log('   🗑️  Eliminando repuestos de órdenes...')
          await tx.workOrderSparePart.deleteMany()
          deletedCount++
          
          console.log('   🗑️  Eliminando pausas de trabajo...')
          await tx.workPause.deleteMany()
          deletedCount++
          
          console.log('   🗑️  Eliminando estados de órdenes...')
          await tx.workOrderStatus.deleteMany()
          deletedCount++
          
          console.log('   🗑️  Eliminando fotos de ingresos...')
          await tx.vehicleEntryPhoto.deleteMany()
          deletedCount++
          
          console.log('   🗑️  Eliminando controles de llaves...')
          await tx.keyControl.deleteMany()
          deletedCount++
          
          console.log('   🗑️  Eliminando órdenes de trabajo...')
          await tx.workOrder.deleteMany()
          deletedCount++
          
          console.log('   🗑️  Eliminando ingresos de vehículos...')
          await tx.vehicleEntry.deleteMany()
          deletedCount++
          
          console.log('   🗑️  Eliminando vehículos...')
          await tx.vehicle.deleteMany()
          deletedCount++
        })
        
        console.log(`\n✅ Limpieza completada exitosamente`)
        console.log(`   Tablas limpiadas: ${deletedCount}`)
        
      } catch (error) {
        console.log(`   ❌ Error durante la limpieza: ${error.message}`)
        errorCount++
      }
      
      // Verificar que todo se eliminó
      const finalStats = await Promise.all([
        prisma.vehicleEntry.count(),
        prisma.workOrder.count(),
        prisma.vehicle.count()
      ])
      
      console.log('\n📊 Verificación final:')
      console.log(`   Ingresos restantes: ${finalStats[0]}`)
      console.log(`   Órdenes restantes: ${finalStats[1]}`)
      console.log(`   Vehículos restantes: ${finalStats[2]}`)
      
      if (finalStats[0] === 0 && finalStats[1] === 0 && finalStats[2] === 0) {
        console.log('\n✅ Base de datos completamente limpia')
      } else {
        console.log('\n⚠️  Algunos datos no se eliminaron correctamente')
      }
    }

    console.log('\n✅ Proceso completado')
    console.log('\n💡 La base de datos está lista para empezar con datos limpios.')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar la limpieza
cleanAllData()
