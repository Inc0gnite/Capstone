import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...')
    
    const users = await prisma.user.findMany({
      include: {
        role: true
      }
    })
    
    console.log(`📊 Total de usuarios encontrados: ${users.length}`)
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Usuario:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   RUT: ${user.rut}`)
      console.log(`   Nombre: ${user.firstName} ${user.lastName}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Rol: ${user.role?.name || 'Sin rol'}`)
      console.log(`   Activo: ${user.isActive}`)
    })
    
    console.log('\n✅ Usuarios encontrados')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()


