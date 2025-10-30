import fetch from 'node-fetch'

async function testAuth() {
  try {
    console.log('🔍 Probando autenticación...')
    
    // Primero, intentar hacer login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'guardia@pepsico.cl',
        password: 'admin123'
      })
    })
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json()
      console.log('✅ Login exitoso')
      console.log('📊 Datos de login:', {
        hasAccessToken: !!loginData.data.accessToken,
        hasRefreshToken: !!loginData.data.refreshToken,
        user: loginData.data.user?.firstName
      })
      
      // Ahora probar la API con el token
      const apiResponse = await fetch('http://localhost:3000/api/vehicle-entries', {
        headers: {
          'Authorization': `Bearer ${loginData.data.accessToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        console.log('✅ API funcionando con autenticación')
        console.log('📊 Datos de la API:', {
          status: apiResponse.status,
          dataLength: apiData.data?.length || 0,
          total: apiData.total || 0
        })
        
        if (apiData.data && apiData.data.length > 0) {
          console.log('\n📋 Primeros ingresos:')
          apiData.data.slice(0, 3).forEach((entry, index) => {
            console.log(`   ${index + 1}. ${entry.vehicle?.licensePlate} - ${entry.driverName}`)
          })
        }
      } else {
        console.log('❌ API no responde correctamente')
        console.log('   Status:', apiResponse.status)
        console.log('   Status Text:', apiResponse.statusText)
      }
      
    } else {
      console.log('❌ Login falló')
      console.log('   Status:', loginResponse.status)
      console.log('   Status Text:', loginResponse.statusText)
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

testAuth()
