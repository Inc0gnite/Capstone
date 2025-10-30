import fetch from 'node-fetch'

async function testEntriesPage() {
  try {
    console.log('🔍 Probando funcionalidad de la página Entries...')

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

    // 2. Probar endpoint de todos los ingresos (como lo hace la página Entries)
    console.log('\n🔍 Probando /api/vehicle-entries...')
    const allEntriesResponse = await fetch('http://localhost:3000/api/vehicle-entries', {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const allEntriesData = await allEntriesResponse.json()
    console.log('📊 Respuesta de todos los ingresos:')
    console.log('   Status:', allEntriesResponse.status)
    console.log('   Data length:', allEntriesData.data?.length || 0)

    // 3. Simular filtros de la página Entries
    console.log('\n📊 Simulando filtros de la página Entries...')
    const allEntries = allEntriesData.data || []
    
    // Filtrar por estado 'ingresado' (activos)
    const activeEntries = allEntries.filter(entry => entry.status === 'ingresado')
    console.log(`   Ingresos activos (status='ingresado'): ${activeEntries.length}`)
    
    // Filtrar por estado 'salida' (completados)
    const completedEntries = allEntries.filter(entry => entry.status === 'salida')
    console.log(`   Ingresos completados (status='salida'): ${completedEntries.length}`)

    // 4. Mostrar detalles de los ingresos activos
    console.log('\n📋 Ingresos activos encontrados:')
    if (activeEntries.length > 0) {
      activeEntries.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.vehicle?.licensePlate} - ${entry.driverName}`)
        console.log(`      Estado: ${entry.status}`)
        console.log(`      Código: ${entry.entryCode}`)
        console.log(`      Fecha: ${entry.entryDate}`)
      })
    } else {
      console.log('   ❌ No hay ingresos activos')
    }

    // 5. Mostrar detalles de los ingresos completados
    console.log('\n📋 Ingresos completados:')
    if (completedEntries.length > 0) {
      completedEntries.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.vehicle?.licensePlate} - ${entry.driverName}`)
        console.log(`      Estado: ${entry.status}`)
        console.log(`      Fecha ingreso: ${entry.entryDate}`)
        console.log(`      Fecha salida: ${entry.exitDate}`)
      })
    } else {
      console.log('   ❌ No hay ingresos completados')
    }

    // 6. Verificar si la página debería mostrar datos
    console.log('\n✅ Verificación final:')
    if (activeEntries.length > 0) {
      console.log('✅ La página Entries DEBERÍA mostrar ingresos activos')
      console.log(`📊 Se mostrarán ${activeEntries.length} ingreso(s) activo(s)`)
    } else {
      console.log('❌ La página Entries NO debería mostrar ingresos activos')
    }

    if (completedEntries.length > 0) {
      console.log(`✅ La página Entries DEBERÍA mostrar ${completedEntries.length} ingreso(s) completado(s)`)
    } else {
      console.log('❌ La página Entries NO debería mostrar ingresos completados')
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

testEntriesPage()


