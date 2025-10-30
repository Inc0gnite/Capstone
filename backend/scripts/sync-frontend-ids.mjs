import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function syncFrontendIds() {
  try {
    console.log('🔄 Sincronizando IDs del frontend con la base de datos...\n')
    
    // Obtener IDs reales de la base de datos
    const regions = await prisma.region.findMany({
      select: { id: true, code: true, name: true }
    })
    
    const workshops = await prisma.workshop.findMany({
      select: { id: true, code: true, name: true, regionId: true }
    })
    
    console.log('📋 IDs reales obtenidos:')
    console.log('🏛️ Regiones:', regions.length)
    console.log('🏭 Talleres:', workshops.length)
    
    // Generar el archivo de configuración actualizado
    const configServicePath = path.join(process.cwd(), '..', 'frontend', 'src', 'services', 'configService.ts')
    
    // Leer el archivo actual
    let configContent = await fs.promises.readFile(configServicePath, 'utf8')
    
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
    
    // Escribir el archivo actualizado
    await fs.promises.writeFile(configServicePath, configContent, 'utf8')
    
    console.log('✅ Archivo configService.ts actualizado con IDs reales')
    console.log('\n📄 Cambios realizados:')
    console.log(`   - ${regions.length} regiones actualizadas`)
    console.log(`   - ${workshops.length} talleres actualizados`)
    
    // Verificar que no hay más IDs hardcodeados problemáticos
    console.log('\n🔍 Verificando IDs restantes...')
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
    const allRealIds = [...regions.map(r => r.id), ...workshops.map(w => w.id)]
    const matches = configContent.match(uuidRegex) || []
    
    let hasInvalidIds = false
    for (const match of matches) {
      if (!allRealIds.includes(match)) {
        console.log(`   ⚠️  ID no válido encontrado: ${match}`)
        hasInvalidIds = true
      }
    }
    
    if (!hasInvalidIds) {
      console.log('   ✅ Todos los IDs son válidos')
    }
    
  } catch (error) {
    console.error('❌ Error sincronizando IDs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar
syncFrontendIds()









