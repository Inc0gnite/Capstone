import fetch from 'node-fetch'

async function simulateFrontend() {
  try {
    console.log('🔍 Simulando exactamente lo que hace el frontend...')

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

    // 2. Simular exactamente lo que hace useStats
    console.log('\n🔄 Cargando estadísticas desde el backend...')
    console.log('🔐 Token encontrado, conectando al backend...')
    console.log('🌐 URL del backend: http://localhost:3000/api')

    // Cargar estadísticas básicas (como en useStats)
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

    console.log('📊 Datos recibidos del backend:', {
      activeEntries: activeEntries.data?.length || 0,
      allEntries: allEntries.data?.length || 0,
      activeEntriesData: activeEntries.data,
      allEntriesData: allEntries.data
    })

    // Debugging detallado
    console.log('🔍 Debugging detallado:')
    console.log('   activeEntries es array:', Array.isArray(activeEntries.data))
    console.log('   activeEntries.length:', activeEntries.data?.length || 0)
    console.log('   allEntries.data es array:', Array.isArray(allEntries.data))
    console.log('   allEntries.data.length:', allEntries.data?.length || 0)

    const today = new Date().toISOString().split('T')[0]
    const entriesToday = allEntries.data?.filter((entry) =>
      entry.entryDate.startsWith(today)
    ).length || 0

    const exitsToday = allEntries.data?.filter((entry) =>
      entry.exitDate && entry.exitDate.startsWith(today)
    ).length || 0

    const newStats = {
      vehiclesInWorkshop: activeEntries.data?.length || 0,
      entriesToday,
      exitsToday,
      totalEntries: allEntries.data?.length || 0
    }

    console.log('📈 Estadísticas calculadas y actualizadas:', newStats)

    // Mostrar mensaje de éxito
    if (newStats.totalEntries > 0) {
      console.log('✅ Dashboard actualizado con datos reales de la base de datos')
    }

    // 3. Simular lo que hace GuardiaDashboard
    console.log('\n🔄 Cargando datos del dashboard...')
    
    const [activeEntriesDashboard, recentEntries] = await Promise.all([
      fetch('http://localhost:3000/api/vehicle-entries/active', {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()),
      fetch(`http://localhost:3000/api/vehicle-entries?limit=10&dateFrom=${today}`, {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
    ])

    console.log('📊 Datos cargados:', {
      activeEntries: activeEntriesDashboard.data?.length || 0,
      recentEntries: recentEntries.data?.length || 0,
      activeEntriesData: activeEntriesDashboard.data,
      recentEntriesData: recentEntries.data
    })

    // 4. Comparar resultados
    console.log('\n📊 Comparación de resultados:')
    console.log('   useStats - vehiclesInWorkshop:', newStats.vehiclesInWorkshop)
    console.log('   Dashboard - activeEntries:', activeEntriesDashboard.data?.length || 0)
    
    if (newStats.vehiclesInWorkshop === (activeEntriesDashboard.data?.length || 0)) {
      console.log('✅ Los datos coinciden entre useStats y Dashboard')
    } else {
      console.log('❌ INCONSISTENCIA: Los datos no coinciden')
      console.log('   Diferencia:', Math.abs(newStats.vehiclesInWorkshop - (activeEntriesDashboard.data?.length || 0)))
    }

  } catch (error) {
    console.error('❌ Error en la simulación:', error.message)
  }
}

simulateFrontend()


