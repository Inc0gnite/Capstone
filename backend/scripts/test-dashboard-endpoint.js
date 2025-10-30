import fetch from 'node-fetch'

async function testDashboardEndpoint() {
  try {
    console.log('🔍 Probando endpoint específico del dashboard...')

    // 1. Hacer login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'guardia@pepsico.cl',
        password: 'admin123'
      })
    })

    const loginData = await loginResponse.json()

    if (!loginResponse.ok) {
      console.error('❌ Error de login:', loginData.message)
      return
    }

    console.log('✅ Login exitoso')

    // 2. Probar endpoint de ingresos activos (como lo hace el dashboard)
    console.log('\n🔍 Probando /api/vehicle-entries/active...')
    const activeResponse = await fetch('http://localhost:3000/api/vehicle-entries/active', {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 Respuesta del endpoint activos:')
    console.log('   Status:', activeResponse.status)
    console.log('   Status Text:', activeResponse.statusText)
    
    const activeData = await activeResponse.json()
    console.log('   Data:', JSON.stringify(activeData, null, 2))

    // 3. Verificar estructura de datos
    console.log('\n🔍 Verificación de estructura:')
    console.log('   Es objeto:', typeof activeData === 'object')
    console.log('   Tiene data:', 'data' in activeData)
    console.log('   data es array:', Array.isArray(activeData.data))
    console.log('   data.length:', activeData.data?.length || 0)

    if (activeData.data && activeData.data.length > 0) {
      console.log('\n📋 Primer ingreso activo:')
      const firstEntry = activeData.data[0]
      console.log('   ID:', firstEntry.id)
      console.log('   Código:', firstEntry.entryCode)
      console.log('   Vehículo:', firstEntry.vehicle?.licensePlate)
      console.log('   Conductor:', firstEntry.driverName)
      console.log('   Estado:', firstEntry.status)
      console.log('   Fecha ingreso:', firstEntry.entryDate)
      console.log('   Fecha salida:', firstEntry.exitDate)
    }

    // 4. Probar endpoint de ingresos recientes (como lo hace el dashboard)
    console.log('\n🔍 Probando /api/vehicle-entries con filtros...')
    const today = new Date().toISOString().split('T')[0]
    const recentResponse = await fetch(`http://localhost:3000/api/vehicle-entries?limit=10&dateFrom=${today}`, {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 Respuesta del endpoint recientes:')
    console.log('   Status:', recentResponse.status)
    console.log('   Status Text:', recentResponse.statusText)
    
    const recentData = await recentResponse.json()
    console.log('   Data length:', recentData.data?.length || 0)

    // 5. Simular exactamente lo que hace el dashboard
    console.log('\n🔄 Simulando carga del dashboard...')
    console.log('📊 Datos cargados:', {
      activeEntries: activeData.data?.length || 0,
      recentEntries: recentData.data?.length || 0,
      activeEntriesData: activeData.data,
      recentEntriesData: recentData.data
    })

    // 6. Verificar si los datos son correctos
    const activeCount = activeData.data?.length || 0
    console.log('\n✅ Verificación final:')
    console.log(`   Ingresos activos encontrados: ${activeCount}`)
    
    if (activeCount > 0) {
      console.log('✅ El dashboard DEBERÍA mostrar vehículos activos')
      console.log('📋 Vehículos que deberían aparecer:')
      activeData.data.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.vehicle?.licensePlate} - ${entry.driverName}`)
      })
    } else {
      console.log('❌ El dashboard NO debería mostrar vehículos activos')
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

testDashboardEndpoint()


