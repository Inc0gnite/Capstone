import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyRegions() {
  try {
    console.log('🔍 Verificando regiones en la base de datos...')
    
    const regions = await prisma.region.findMany({
      orderBy: { name: 'asc' }
    })
    
    console.log(`📊 Total de regiones encontradas: ${regions.length}`)
    console.log('\n📋 Detalles de las regiones:')
    
    regions.forEach((region, index) => {
      console.log(`\n${index + 1}. Región:`)
      console.log(`   ID: ${region.id}`)
      console.log(`   Código: ${region.code}`)
      console.log(`   Nombre: ${region.name}`)
      console.log(`   Activa: ${region.isActive}`)
      console.log(`   Creada: ${region.createdAt}`)
    })
    
    if (regions.length === 0) {
      console.log('\n⚠️  No hay regiones en la base de datos.')
      console.log('💡 Solución: Ejecutar el seed de la base de datos')
      console.log('   Comando: npx prisma db seed')
    } else if (regions.length !== 3) {
      console.log('\n⚠️  Se esperaban 3 regiones pero se encontraron', regions.length)
      console.log('💡 Solución: Verificar el seed o ejecutar nuevamente')
    } else {
      console.log('\n✅ Regiones correctas encontradas')
      console.log('🎯 IDs para usar en el frontend:')
      regions.forEach(region => {
        console.log(`   ${region.code}: ${region.id}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error verificando regiones:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyRegions()
