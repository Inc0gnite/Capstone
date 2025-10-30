import fetch from 'node-fetch'

async function testFrontendStats() {
  try {
    console.log('🔍 Probando estadísticas del frontend...')

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

    // 2. Probar API de ingresos activos (como lo hace el frontend)
    console.log('\n🔍 Probando API de ingresos activos...')
    const activeResponse = await fetch('http://localhost:3000/api/vehicle-entries/active', {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const activeData = await activeResponse.json()
    console.log('📊 Respuesta de ingresos activos:', {
      status: activeResponse.status,
      dataLength: activeData.data?.length || 0,
      data: activeData.data
    })

    // 3. Probar API de todos los ingresos (como lo hace el frontend)
    console.log('\n🔍 Probando API de todos los ingresos...')
    const allResponse = await fetch('http://localhost:3000/api/vehicle-entries?limit=100', {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const allData = await allResponse.json()
    console.log('📊 Respuesta de todos los ingresos:', {
      status: allResponse.status,
      dataLength: allData.data?.length || 0,
      total: allData.total || 0
    })

    // 4. Calcular estadísticas como en el frontend
    console.log('\n📈 Calculando estadísticas como en el frontend...')
    const today = new Date().toISOString().split('T')[0]
    const entriesToday = allData.data?.filter((entry) =>
      entry.entryDate.startsWith(today)
    ).length || 0

    const exitsToday = allData.data?.filter((entry) =>
      entry.exitDate && entry.exitDate.startsWith(today)
    ).length || 0

    const stats = {
      vehiclesInWorkshop: activeData.data?.length || 0,
      entriesToday,
      exitsToday,
      totalEntries: allData.data?.length || 0
    }

    console.log('📊 Estadísticas calculadas:', stats)

    // 5. Verificar datos específicos
    console.log('\n🔍 Verificación de datos específicos:')
    console.log('📅 Fecha de hoy:', today)
    console.log('🚗 Ingresos activos:')
    activeData.data?.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.vehicle.licensePlate} - ${entry.driverName} (${entry.entryDate.split('T')[0]})`)
    })

    console.log('\n📊 Ingresos de hoy:')
    allData.data?.filter(entry => entry.entryDate.startsWith(today)).forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.vehicle.licensePlate} - ${entry.driverName}`)
    })

    console.log('\n📊 Salidas de hoy:')
    allData.data?.filter(entry => entry.exitDate && entry.exitDate.startsWith(today)).forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.vehicle.licensePlate} - ${entry.driverName}`)
    })

    // 6. Verificar consistencia
    console.log('\n✅ Verificación de consistencia:')
    if (stats.vehiclesInWorkshop === (activeData.data?.length || 0)) {
      console.log('✅ Vehículos en taller coincide con ingresos activos')
    } else {
      console.log('❌ INCONSISTENCIA: Vehículos en taller no coincide')
    }

    if (stats.entriesToday === entriesToday) {
      console.log('✅ Ingresos hoy calculados correctamente')
    } else {
      console.log('❌ INCONSISTENCIA: Ingresos hoy no coincide')
    }

    if (stats.exitsToday === exitsToday) {
      console.log('✅ Salidas hoy calculadas correctamente')
    } else {
      console.log('❌ INCONSISTENCIA: Salidas hoy no coincide')
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

testFrontendStats()


