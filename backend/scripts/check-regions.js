const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkRegions() {
  try {
    console.log('🔍 Verificando regiones en la base de datos...')
    
    const regions = await prisma.region.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    
    console.log(`📊 Encontradas ${regions.length} regiones:`)
    regions.forEach(region => {
      console.log(`  - ${region.code}: ${region.name} (ID: ${region.id})`)
    })
    
    if (regions.length === 0) {
      console.log('⚠️  No hay regiones en la base de datos. Creando regiones básicas...')
      
      const newRegions = await Promise.all([
        prisma.region.create({ 
          data: { code: 'RM', name: 'Región Metropolitana' } 
        }),
        prisma.region.create({ 
          data: { code: 'V', name: 'Región de Valparaíso' } 
        }),
        prisma.region.create({ 
          data: { code: 'VIII', name: 'Región del Biobío' } 
        })
      ])
      
      console.log('✅ Regiones creadas exitosamente:')
      newRegions.forEach(region => {
        console.log(`  - ${region.code}: ${region.name} (ID: ${region.id})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error verificando regiones:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRegions()


