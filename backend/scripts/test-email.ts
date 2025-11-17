/**
 * Script para probar la configuración de email
 * Ejecutar: npx ts-node scripts/test-email.ts
 */

import { sendPasswordResetEmail } from '../src/utils/email'

async function testEmail() {
  console.log('🧪 Iniciando prueba de email...\n')
  
  // Verificar variables de entorno
  console.log('📋 Verificando configuración SMTP:')
  console.log('   SMTP_HOST:', process.env.SMTP_HOST || 'NO CONFIGURADO')
  console.log('   SMTP_PORT:', process.env.SMTP_PORT || 'NO CONFIGURADO')
  console.log('   SMTP_USER:', process.env.SMTP_USER || 'NO CONFIGURADO')
  console.log('   SMTP_PASS:', process.env.SMTP_PASS ? '***configurado***' : 'NO CONFIGURADO')
  console.log('')
  
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ ERROR: SMTP no está configurado correctamente')
    console.error('   Configura SMTP_USER y SMTP_PASS en las variables de entorno')
    process.exit(1)
  }
  
  // Email de prueba (cambiar por uno real para probar)
  const testEmail = process.argv[2] || 'test@example.com'
  const testLink = 'https://capstone-frontend-wine.vercel.app/reset-password?token=test-token-123'
  
  console.log('📧 Enviando correo de prueba...')
  console.log('   Destinatario:', testEmail)
  console.log('   Enlace de prueba:', testLink)
  console.log('')
  
  try {
    await sendPasswordResetEmail(testEmail, testLink)
    console.log('✅ ÉXITO: Correo enviado correctamente')
    console.log('   Verifica la bandeja de entrada (y Spam) del destinatario')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ ERROR al enviar correo:')
    console.error('   Mensaje:', error.message)
    console.error('   Código:', error.code || 'N/A')
    console.error('')
    console.error('🔧 Soluciones:')
    
    if (error.code === 'EAUTH') {
      console.error('   1. Verifica que SMTP_USER sea correcto')
      console.error('   2. Verifica que SMTP_PASS sea una contraseña de aplicación (16 caracteres)')
      console.error('   3. NO uses tu contraseña normal de Gmail')
      console.error('   4. Genera una nueva contraseña de aplicación en:')
      console.error('      https://myaccount.google.com/apppasswords')
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('   1. Verifica tu conexión a internet')
      console.error('   2. Verifica que el puerto 587 no esté bloqueado')
      console.error('   3. Verifica que SMTP_HOST sea: smtp.gmail.com')
    } else {
      console.error('   Revisa los detalles del error arriba')
    }
    
    process.exit(1)
  }
}

testEmail()

