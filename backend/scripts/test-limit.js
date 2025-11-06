import fetch from 'node-fetch'

async function testLimit() {
  try {
    console.log('🔍 Probando límite de 100...')

    // Primero hacer login
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

    // Probar con límite de 100
    const response = await fetch('http://localhost:3000/api/vehicle-entries?limit=100', {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (response.ok) {
      console.log('✅ Límite de 100 funciona correctamente')
      console.log('📊 Respuesta:', {
        status: response.status,
        dataLength: data.data?.length || 0,
        total: data.pagination?.total || 0,
        limit: data.pagination?.limit || 0
      })
    } else {
      console.log('❌ Error con límite de 100:', data.message || response.statusText)
    }

    // Probar con límite de 1000 (debería fallar)
    console.log('\n🔍 Probando límite de 1000 (debería fallar)...')
    const response1000 = await fetch('http://localhost:3000/api/vehicle-entries?limit=1000', {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    const data1000 = await response1000.json()

    if (response1000.ok) {
      console.log('⚠️ Límite de 1000 funcionó (inesperado)')
    } else {
      console.log('✅ Límite de 1000 falló correctamente:', data1000.message)
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

testLimit()


