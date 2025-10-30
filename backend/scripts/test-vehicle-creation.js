import fetch from 'node-fetch'

async function testVehicleCreation() {
  try {
    console.log('🔍 Probando creación de vehículos...')

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

    // 2. Probar creación de vehículo con patente única
    const uniquePlate = `TEST${Date.now().toString().slice(-4)}` // Patente única basada en timestamp
    console.log(`\n🚗 Probando creación con patente única: ${uniquePlate}`)

    const vehicleData = {
      licensePlate: uniquePlate,
      vehicleType: 'furgon',
      brand: 'Test Brand',
      model: 'Test Model',
      year: 2025,
      vin: `TEST${Date.now()}`,
      fleetNumber: `FL-${Date.now()}`,
      regionId: '70887ee1-d88f-4261-80c6-fd7315db270d' // RM
    }

    const createResponse = await fetch('http://localhost:3000/api/vehicles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vehicleData)
    })

    const createData = await createResponse.json()

    if (createResponse.ok) {
      console.log('✅ Vehículo creado exitosamente')
      console.log('📊 Datos del vehículo:', {
        id: createData.data.id,
        licensePlate: createData.data.licensePlate,
        vehicleType: createData.data.vehicleType,
        brand: createData.data.brand,
        model: createData.data.model,
        year: createData.data.year,
        region: createData.data.region.code
      })
    } else {
      console.log('❌ Error creando vehículo:', createData.message || createResponse.statusText)
    }

    // 3. Probar creación con patente duplicada (debería fallar)
    console.log(`\n🚗 Probando creación con patente duplicada: QWES12`)
    
    const duplicateData = {
      licensePlate: 'QWES12', // Patente que ya existe
      vehicleType: 'furgon',
      brand: 'Test Brand',
      model: 'Test Model',
      year: 2025,
      regionId: '70887ee1-d88f-4261-80c6-fd7315db270d'
    }

    const duplicateResponse = await fetch('http://localhost:3000/api/vehicles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(duplicateData)
    })

    const duplicateResult = await duplicateResponse.json()

    if (duplicateResponse.ok) {
      console.log('⚠️ Vehículo duplicado creado (inesperado)')
    } else {
      console.log('✅ Error esperado para patente duplicada:', duplicateResult.message)
    }

    // 4. Probar creación con región inválida
    console.log(`\n🚗 Probando creación con región inválida`)
    
    const invalidRegionData = {
      licensePlate: `INVALID${Date.now()}`,
      vehicleType: 'furgon',
      brand: 'Test Brand',
      model: 'Test Model',
      year: 2025,
      regionId: 'invalid-region-id'
    }

    const invalidRegionResponse = await fetch('http://localhost:3000/api/vehicles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidRegionData)
    })

    const invalidRegionResult = await invalidRegionResponse.json()

    if (invalidRegionResponse.ok) {
      console.log('⚠️ Vehículo con región inválida creado (inesperado)')
    } else {
      console.log('✅ Error esperado para región inválida:', invalidRegionResult.message)
    }

    console.log('\n✅ Pruebas de creación de vehículos completadas')

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

testVehicleCreation()


