import fetch from 'node-fetch'

async function checkBackend() {
  try {
    console.log('🔍 Verificando backend...')
    
    // Verificar si el servidor está ejecutándose
    const response = await fetch('http://localhost:3000/api/vehicle-entries')
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Backend funcionando correctamente')
      console.log('📊 Respuesta de la API:', {
        status: response.status,
        dataLength: data.data?.length || 0,
        total: data.total || 0
      })
      
      if (data.data && data.data.length > 0) {
        console.log('\n📋 Primeros ingresos:')
        data.data.slice(0, 3).forEach((entry, index) => {
          console.log(`   ${index + 1}. ${entry.vehicle?.licensePlate} - ${entry.driverName}`)
        })
      }
    } else {
      console.log('❌ Backend no responde correctamente')
      console.log('   Status:', response.status)
      console.log('   Status Text:', response.statusText)
    }
    
  } catch (error) {
    console.error('❌ Error conectando al backend:', error.message)
    console.log('💡 Posibles soluciones:')
    console.log('   1. Verificar que el backend esté ejecutándose: npm run dev')
    console.log('   2. Verificar que el puerto 3001 esté disponible')
    console.log('   3. Verificar la configuración de CORS')
  }
}

checkBackend()
