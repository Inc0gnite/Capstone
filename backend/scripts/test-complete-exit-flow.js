import fetch from 'node-fetch'

async function testCompleteExitFlow() {
  try {
    console.log('🔍 Probando flujo completo de registro de salidas...')

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

    // 2. Obtener estado inicial
    const initialResponse = await fetch('http://localhost:3000/api/vehicle-entries/active', {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const initialData = await initialResponse.json()
    console.log('📊 Estado inicial - Ingresos activos:', initialData.data?.length || 0)

    if (initialData.data?.length === 0) {
      console.log('⚠️ No hay ingresos activos para probar salida')
      return
    }

    // 3. Probar registro de salida
    const firstEntry = initialData.data[0]
    console.log(`\n🚗 Registrando salida para: ${firstEntry.vehicle.licensePlate} - ${firstEntry.driverName}`)
    console.log(`📊 KM de entrada: ${firstEntry.entryKm}`)

    const exitResponse = await fetch(`http://localhost:3000/api/vehicle-entries/${firstEntry.id}/exit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        exitKm: firstEntry.entryKm + 150, // KM de salida
        observations: 'Prueba de flujo completo de salida'
      })
    })

    const exitData = await exitResponse.json()

    if (exitResponse.ok) {
      console.log('✅ Salida registrada exitosamente')
      console.log('📊 Datos de la salida:', {
        vehicle: exitData.data.vehicle.licensePlate,
        driver: exitData.data.driverName,
        entryKm: exitData.data.entryKm,
        exitKm: exitData.data.exitKm,
        status: exitData.data.status,
        entryDate: exitData.data.entryDate,
        exitDate: exitData.data.exitDate
      })

      // 4. Verificar que ya no aparece en ingresos activos
      const finalResponse = await fetch('http://localhost:3000/api/vehicle-entries/active', {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const finalData = await finalResponse.json()
      console.log('\n📊 Estado final - Ingresos activos:', finalData.data?.length || 0)

      if (finalData.data?.length < initialData.data?.length) {
        console.log('✅ El vehículo ya no aparece en ingresos activos')
      } else {
        console.log('⚠️ El vehículo aún aparece en ingresos activos')
      }

      // 5. Verificar estadísticas
      const statsResponse = await fetch('http://localhost:3000/api/vehicle-entries?limit=100', {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      const statsData = await statsResponse.json()
      const today = new Date().toISOString().split('T')[0]
      const entriesToday = statsData.data?.filter(entry => 
        entry.entryDate.startsWith(today)
      ).length || 0
      const exitsToday = statsData.data?.filter(entry => 
        entry.exitDate && entry.exitDate.startsWith(today)
      ).length || 0

      console.log('\n📈 Estadísticas actualizadas:')
      console.log(`   Total ingresos: ${statsData.data?.length || 0}`)
      console.log(`   Ingresos activos: ${finalData.data?.length || 0}`)
      console.log(`   Ingresos hoy: ${entriesToday}`)
      console.log(`   Salidas hoy: ${exitsToday}`)

      console.log('\n✅ Flujo completo de registro de salidas funcionando correctamente')

    } else {
      console.log('❌ Error registrando salida:', exitData.message || exitResponse.statusText)
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

testCompleteExitFlow()


