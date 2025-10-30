import fetch from 'node-fetch'

async function testExitRegistration() {
  try {
    console.log('🔍 Probando registro de salidas...')

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

    // 2. Obtener ingresos activos
    const activeResponse = await fetch('http://localhost:3000/api/vehicle-entries/active', {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const activeData = await activeResponse.json()

    if (!activeResponse.ok) {
      console.error('❌ Error obteniendo ingresos activos:', activeData.message)
      return
    }

    console.log('📊 Ingresos activos encontrados:', activeData.data?.length || 0)

    if (activeData.data?.length === 0) {
      console.log('⚠️ No hay ingresos activos para probar salida')
      return
    }

    // 3. Probar registro de salida con el primer ingreso activo
    const firstEntry = activeData.data[0]
    console.log(`\n🚗 Probando salida para: ${firstEntry.vehicle.licensePlate} - ${firstEntry.driverName}`)

    const exitResponse = await fetch(`http://localhost:3000/api/vehicle-entries/${firstEntry.id}/exit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        exitKm: 50000, // KM de salida
        observations: 'Prueba de registro de salida'
      })
    })

    const exitData = await exitResponse.json()

    if (exitResponse.ok) {
      console.log('✅ Salida registrada exitosamente')
      console.log('📊 Datos de la salida:', {
        id: exitData.data.id,
        vehicle: exitData.data.vehicle.licensePlate,
        driver: exitData.data.driverName,
        entryDate: exitData.data.entryDate,
        exitDate: exitData.data.exitDate,
        entryKm: exitData.data.entryKm,
        exitKm: exitData.data.exitKm,
        status: exitData.data.status
      })

      // 4. Verificar que ya no aparece en ingresos activos
      const updatedActiveResponse = await fetch('http://localhost:3000/api/vehicle-entries/active', {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const updatedActiveData = await updatedActiveResponse.json()
      console.log('\n📊 Ingresos activos después de la salida:', updatedActiveData.data?.length || 0)

      if (updatedActiveData.data?.length < activeData.data?.length) {
        console.log('✅ El vehículo ya no aparece en ingresos activos')
      } else {
        console.log('⚠️ El vehículo aún aparece en ingresos activos')
      }

    } else {
      console.log('❌ Error registrando salida:', exitData.message || exitResponse.statusText)
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

testExitRegistration()


