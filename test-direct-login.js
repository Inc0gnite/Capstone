// Test directo del login sin interceptores
async function testDirectLogin() {
    console.log('🔐 Probando login directo...');
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'guardia@pepsico.cl',
                password: 'admin123'
            })
        });
        
        console.log('📡 Status:', response.status);
        console.log('📡 Headers:', response.headers);
        
        const data = await response.json();
        console.log('📊 Datos completos:', data);
        
        if (data.success) {
            console.log('✅ Login exitoso');
            console.log('👤 Usuario:', data.data.user);
            console.log('🔑 Token:', data.data.accessToken ? 'Presente' : 'Ausente');
            
            // Guardar tokens
            sessionStorage.setItem('accessToken', data.data.accessToken);
            sessionStorage.setItem('refreshToken', data.data.refreshToken);
            
            console.log('💾 Tokens guardados');
            console.log('🔍 Verificando tokens guardados:');
            console.log('  - accessToken:', sessionStorage.getItem('accessToken') ? 'OK' : 'ERROR');
            console.log('  - refreshToken:', sessionStorage.getItem('refreshToken') ? 'OK' : 'ERROR');
            
            return true;
        } else {
            console.error('❌ Login falló:', data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        return false;
    }
}

// Ejecutar test
testDirectLogin();


