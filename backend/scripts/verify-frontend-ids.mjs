import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function verifyFrontendIds() {
  try {
    console.log('🔍 Verificando IDs hardcodeados en el frontend...\n')
    
    // Obtener IDs reales de la base de datos
    const regions = await prisma.region.findMany({
      select: { id: true, code: true, name: true }
    })
    
    const workshops = await prisma.workshop.findMany({
      select: { id: true, code: true, name: true }
    })
    
    console.log('📋 IDs reales en la base de datos:')
    console.log('\n🏛️ Regiones:')
    regions.forEach(region => {
      console.log(`   ${region.code}: ${region.id}`)
    })
    
    console.log('\n🏭 Talleres:')
    workshops.forEach(workshop => {
      console.log(`   ${workshop.code}: ${workshop.id}`)
    })
    
    // Buscar archivos del frontend que contengan UUIDs
    const frontendPath = path.join(process.cwd(), '..', 'frontend', 'src')
    const files = await findFilesWithUUIDs(frontendPath)
    
    console.log('\n🔍 Archivos del frontend con posibles IDs hardcodeados:')
    for (const file of files) {
      console.log(`\n📄 ${file.path}`)
      console.log(`   UUIDs encontrados: ${file.uuids.length}`)
      file.uuids.forEach(uuid => {
        console.log(`   - ${uuid}`)
      })
    }
    
    // Verificar si los IDs encontrados coinciden con los de la base de datos
    console.log('\n✅ Verificación de coincidencias:')
    const allRealIds = [...regions.map(r => r.id), ...workshops.map(w => w.id)]
    
    for (const file of files) {
      for (const uuid of file.uuids) {
        if (allRealIds.includes(uuid)) {
          console.log(`   ✅ ${uuid} - ID válido encontrado en BD`)
        } else {
          console.log(`   ⚠️  ${uuid} - ID no encontrado en BD (posible problema)`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error verificando IDs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

async function findFilesWithUUIDs(dir) {
  const files = []
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
  
  async function scanDirectory(currentDir) {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        await scanDirectory(fullPath)
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
        try {
          const content = await fs.promises.readFile(fullPath, 'utf8')
          const matches = content.match(uuidRegex)
          
          if (matches) {
            files.push({
              path: path.relative(process.cwd(), fullPath),
              uuids: [...new Set(matches)] // Eliminar duplicados
            })
          }
        } catch (error) {
          // Ignorar errores de lectura
        }
      }
    }
  }
  
  await scanDirectory(dir)
  return files
}

// Ejecutar
verifyFrontendIds()









