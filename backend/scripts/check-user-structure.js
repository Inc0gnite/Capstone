import fetch from 'node-fetch'

async function checkUserStructure() {
  try {
    console.log('🔍 Verificando estructura del usuario...')
    
    // Login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@pepsico.cl',
        password: 'admin123'
      })
    })
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`)
    }
    
    const loginData = await loginResponse.json()
    console.log('✅ Login exitoso')
    console.log('📊 Token:', loginData.data.accessToken.substring(0, 20) + '...')
    
    // Obtener usuario actual
    const userResponse = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${loginData.data.accessToken}`
      }
    })
    
    if (!userResponse.ok) {
      throw new Error(`Get user failed: ${userResponse.status}`)
    }
    
    const userData = await userResponse.json()
    console.log('👤 Usuario obtenido:')
    console.log('📋 Estructura completa:', JSON.stringify(userData.data, null, 2))
    
    // Verificar si tiene rol
    if (userData.data.role) {
      console.log('✅ Usuario tiene propiedad "role"')
      console.log('🎭 Rol:', userData.data.role.name)
    } else if (userData.data.roleId) {
      console.log('⚠️  Usuario solo tiene "roleId":', userData.data.roleId)
    } else {
      console.log('❌ Usuario no tiene ni "role" ni "roleId"')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkUserStructure()
