import fetch from 'node-fetch'

async function testFrontendAuth() {
  try {
    console.log('🔍 Probando autenticación del frontend...')

    // 1. Hacer login como lo haría el frontend
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
    console.log('🔐 Token obtenido:', loginData.data.accessToken ? 'SÍ' : 'NO')

    // 2. Simular exactamente lo que hace el frontend
    console.log('\n🔄 Simulando llamadas del frontend...')
    
    // Simular useStats
    console.log('📊 Probando useStats (estadísticas)...')
    const [activeEntries, allEntries] = await Promise.all([
      fetch('http://localhost:3000/api/vehicle-entries/active', {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()),
      fetch('http://localhost:3000/api/vehicle-entries?limit=100', {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
    ])

    console.log('📊 useStats - activeEntries:', activeEntries.data?.length || 0)
    console.log('📊 useStats - allEntries:', allEntries.data?.length || 0)

    // Simular GuardiaDashboard
    console.log('\n📊 Probando GuardiaDashboard...')
    const [activeEntriesDashboard, recentEntries] = await Promise.all([
      fetch('http://localhost:3000/api/vehicle-entries/active', {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()),
      fetch(`http://localhost:3000/api/vehicle-entries?limit=10&dateFrom=${new Date().toISOString().split('T')[0]}`, {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
    ])

    console.log('📊 Dashboard - activeEntries:', activeEntriesDashboard.data?.length || 0)
    console.log('📊 Dashboard - recentEntries:', recentEntries.data?.length || 0)

    // 3. Verificar consistencia
    console.log('\n✅ Verificación de consistencia:')
    const useStatsActive = activeEntries.data?.length || 0
    const dashboardActive = activeEntriesDashboard.data?.length || 0
    
    console.log(`   useStats vehículos activos: ${useStatsActive}`)
    console.log(`   Dashboard vehículos activos: ${dashboardActive}`)
    
    if (useStatsActive === dashboardActive) {
      console.log('✅ Los datos coinciden entre useStats y Dashboard')
    } else {
      console.log('❌ INCONSISTENCIA: Los datos no coinciden')
    }

    // 4. Verificar si debería mostrar vehículos
    if (dashboardActive > 0) {
      console.log('\n✅ El dashboard DEBERÍA mostrar vehículos activos')
      console.log('📋 Vehículos que deberían aparecer:')
      activeEntriesDashboard.data.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.vehicle?.licensePlate} - ${entry.driverName}`)
      })
    } else {
      console.log('\n❌ El dashboard NO debería mostrar vehículos activos')
    }

    // 5. Verificar autenticación
    console.log('\n🔐 Verificando autenticación...')
    const meResponse = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const meData = await meResponse.json()
    console.log('👤 Usuario autenticado:', meData.data?.email || 'No autenticado')
    console.log('🔐 Token válido:', meResponse.ok ? 'SÍ' : 'NO')

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

testFrontendAuth()


