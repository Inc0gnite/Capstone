import fetch from 'node-fetch'

async function diagnoseConnection() {
  console.log('🔍 Diagnóstico completo de conexión...')
  
  try {
    // 1. Verificar si el backend está ejecutándose
    console.log('\n1️⃣ Verificando backend...')
    const healthResponse = await fetch('http://localhost:3000/health')
    
    if (healthResponse.ok) {
      console.log('✅ Backend funcionando en puerto 3000')
    } else {
      console.log('❌ Backend no responde en puerto 3000')
      console.log('💡 Verificar que el backend esté ejecutándose')
      return
    }
    
    // 2. Probar autenticación
    console.log('\n2️⃣ Probando autenticación...')
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'guardia@pepsico.cl',
        password: 'admin123'
      })
    })
    
    if (!loginResponse.ok) {
      console.log('❌ Error en autenticación:', loginResponse.status)
      return
    }
    
    const loginData = await loginResponse.json()
    console.log('✅ Autenticación exitosa')
    console.log('   Usuario:', loginData.data.user.firstName)
    console.log('   Token:', loginData.data.accessToken ? 'Presente' : 'Ausente')
    
    // 3. Probar API de ingresos
    console.log('\n3️⃣ Probando API de ingresos...')
    const entriesResponse = await fetch('http://localhost:3000/api/vehicle-entries', {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!entriesResponse.ok) {
      console.log('❌ Error en API de ingresos:', entriesResponse.status)
      return
    }
    
    const entriesData = await entriesResponse.json()
    console.log('✅ API de ingresos funcionando')
    console.log('   Total ingresos:', entriesData.data?.length || 0)
    
    // 4. Probar API de ingresos activos
    console.log('\n4️⃣ Probando API de ingresos activos...')
    const activeResponse = await fetch('http://localhost:3000/api/vehicle-entries/active', {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!activeResponse.ok) {
      console.log('❌ Error en API de ingresos activos:', activeResponse.status)
      return
    }
    
    const activeData = await activeResponse.json()
    console.log('✅ API de ingresos activos funcionando')
    console.log('   Ingresos activos:', activeData.data?.length || 0)
    
    // 5. Calcular estadísticas
    console.log('\n5️⃣ Calculando estadísticas...')
    const today = new Date().toISOString().split('T')[0]
    const entriesToday = entriesData.data?.filter(entry => 
      entry.entryDate.startsWith(today)
    ).length || 0
    
    const exitsToday = entriesData.data?.filter(entry => 
      entry.exitDate && entry.exitDate.startsWith(today)
    ).length || 0
    
    console.log('📊 Estadísticas calculadas:')
    console.log(`   Vehículos en taller: ${activeData.data?.length || 0}`)
    console.log(`   Ingresos hoy: ${entriesToday}`)
    console.log(`   Salidas hoy: ${exitsToday}`)
    console.log(`   Total ingresos: ${entriesData.data?.length || 0}`)
    
    // 6. Verificar datos específicos
    console.log('\n6️⃣ Verificando datos específicos...')
    if (entriesData.data && entriesData.data.length > 0) {
      console.log('📋 Primeros ingresos:')
      entriesData.data.slice(0, 3).forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.vehicle?.licensePlate} - ${entry.driverName}`)
        console.log(`      Fecha: ${entry.entryDate}`)
        console.log(`      Salida: ${entry.exitDate || 'Sin salida'}`)
      })
    }
    
    console.log('\n✅ Diagnóstico completo: TODO FUNCIONANDO')
    console.log('💡 El frontend debería mostrar estos datos automáticamente')
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message)
    console.log('\n🔧 Posibles soluciones:')
    console.log('   1. Verificar que el backend esté ejecutándose en puerto 3000')
    console.log('   2. Verificar que el frontend esté configurado para puerto 3000')
    console.log('   3. Verificar que no haya problemas de CORS')
    console.log('   4. Verificar que el usuario esté autenticado en el frontend')
  }
}

diagnoseConnection()
