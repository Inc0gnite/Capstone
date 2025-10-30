import fetch from 'node-fetch'

async function autoLogin() {
  try {
    console.log('🔐 Haciendo login automático...')

    // Hacer login
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
    console.log('📊 Datos de login:', {
      hasAccessToken: !!loginData.data.accessToken,
      hasRefreshToken: !!loginData.data.refreshToken,
      user: loginData.data.user?.firstName
    })

    // Probar dashboard con autenticación
    console.log('\n🔍 Probando dashboard con autenticación...')
    
    const [entriesResponse, activeResponse] = await Promise.all([
      fetch('http://localhost:3000/api/vehicle-entries?limit=100', {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch('http://localhost:3000/api/vehicle-entries/active', {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      })
    ])

    const entriesData = await entriesResponse.json()
    const activeData = await activeResponse.json()

    if (entriesResponse.ok && activeResponse.ok) {
      console.log('✅ Dashboard funcionando con autenticación')
      console.log('📊 Datos del dashboard:', {
        totalEntries: entriesData.data?.length || 0,
        activeEntries: activeData.data?.length || 0,
        entriesToday: entriesData.data?.filter(entry => 
          entry.entryDate.startsWith(new Date().toISOString().split('T')[0])
        ).length || 0,
        exitsToday: entriesData.data?.filter(entry => 
          entry.exitDate && entry.exitDate.startsWith(new Date().toISOString().split('T')[0])
        ).length || 0
      })

      console.log('\n📋 Ingresos activos:')
      activeData.data?.forEach(entry => {
        console.log(`   ${entry.vehicle.licensePlate} - ${entry.driverName}`)
      })

      console.log('\n💡 Para usar en el frontend:')
      console.log(`   localStorage.setItem('accessToken', '${loginData.data.accessToken}')`)
      console.log(`   localStorage.setItem('refreshToken', '${loginData.data.refreshToken}')`)
      console.log('   Luego recargar la página del dashboard')

    } else {
      console.log('❌ Error en dashboard:', {
        entries: entriesResponse.status,
        active: activeResponse.status
      })
    }

  } catch (error) {
    console.error('❌ Error en auto-login:', error.message)
  }
}

autoLogin()


