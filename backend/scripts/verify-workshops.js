import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyWorkshops() {
  try {
    console.log('🔍 Verificando talleres en la base de datos...')
    
    const workshops = await prisma.workshop.findMany({
      orderBy: { name: 'asc' },
      include: {
        region: true
      }
    })
    
    console.log(`📊 Total de talleres encontrados: ${workshops.length}`)
    console.log('\n📋 Detalles de los talleres:')
    
    workshops.forEach((workshop, index) => {
      console.log(`\n${index + 1}. Taller:`)
      console.log(`   ID: ${workshop.id}`)
      console.log(`   Código: ${workshop.code}`)
      console.log(`   Nombre: ${workshop.name}`)
      console.log(`   Región: ${workshop.region.code} - ${workshop.region.name}`)
      console.log(`   Ciudad: ${workshop.city}`)
      console.log(`   Activo: ${workshop.isActive}`)
      console.log(`   Creado: ${workshop.createdAt}`)
    })
    
    if (workshops.length === 0) {
      console.log('\n⚠️  No hay talleres en la base de datos.')
      console.log('💡 Solución: Ejecutar el seed de la base de datos')
      console.log('   Comando: npx prisma db seed')
    } else {
      console.log('\n✅ Talleres encontrados')
      console.log('🎯 IDs para usar en el frontend:')
      workshops.forEach(workshop => {
        console.log(`   ${workshop.code}: ${workshop.id}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error verificando talleres:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyWorkshops()


