import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getRegionIds() {
  try {
    console.log('🔍 Obteniendo IDs de regiones...\n')
    
    const regions = await prisma.region.findMany({
      select: {
        id: true,
        code: true,
        name: true
      }
    })

    console.log('📋 Regiones en la base de datos:')
    regions.forEach((region, index) => {
      console.log(`\n${index + 1}. ${region.name}`)
      console.log(`   Código: ${region.code}`)
      console.log(`   ID: ${region.id}`)
    })

    console.log('\n💡 Copia estos IDs para actualizar el frontend:')
    console.log('\nconst fallbackRegions = [')
    regions.forEach(region => {
      console.log(`  { id: '${region.id}', code: '${region.code}', name: '${region.name}' },`)
    })
    console.log(']')

  } catch (error) {
    console.error('❌ Error obteniendo regiones:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
getRegionIds()









