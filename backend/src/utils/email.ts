import nodemailer from 'nodemailer'
import sgMail from '@sendgrid/mail'

// Resend es un módulo ESM, lo importamos dinámicamente si es necesario
let Resend: any = null
try {
  // @ts-ignore - resend es un módulo ESM
  Resend = require('resend').Resend
} catch (e) {
  // Resend no disponible
}

// Configuración SendGrid (RECOMENDADO - No requiere dominio verificado)
const sendgridApiKey = process.env.SENDGRID_API_KEY
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com'

// Configuración Resend (alternativa, requiere dominio verificado)
const resendApiKey = process.env.RESEND_API_KEY
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

// Configuración SMTP (fallback)
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS

// Detectar qué servicio de email usar (prioridad: SendGrid > Resend > SMTP)
const useSendGrid = !!sendgridApiKey
const useResend = !useSendGrid && !!resendApiKey
const useSMTP = !useSendGrid && !useResend && !!smtpUser && !!smtpPass

// Inicializar SendGrid si está configurado
if (useSendGrid) {
  sgMail.setApiKey(sendgridApiKey!)
}

// Inicializar Resend si está configurado
const resend = useResend && Resend ? new Resend(resendApiKey) : null

// Logging de configuración
if (useSendGrid) {
  console.log('✅ SendGrid configurado (recomendado - funciona sin dominio)')
  console.log('   From Email:', sendgridFromEmail)
} else if (useResend) {
  console.log('✅ Resend configurado')
  console.log('   From Email:', resendFromEmail)
  console.log('   ⚠️  Nota: Resend requiere dominio verificado para enviar a cualquier destinatario')
} else if (useSMTP) {
  console.log('✅ SMTP Configurado correctamente')
  console.log('   Host:', smtpHost)
  console.log('   Port:', smtpPort)
  console.log('   User:', smtpUser)
} else {
  console.error('❌ EMAIL NO CONFIGURADO')
  console.error('   Opción 1 (Recomendado): Configura SENDGRID_API_KEY en Railway')
  console.error('   Opción 2: Configura RESEND_API_KEY en Railway (requiere dominio)')
  console.error('   Opción 3: Configura SMTP_USER y SMTP_PASS en Railway')
  console.error('   Para SendGrid: https://sendgrid.com (gratis hasta 100 emails/día)')
  console.error('   Para Resend: https://resend.com (gratis hasta 3,000 emails/mes)')
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465, // true para puerto 465, false para 587
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
  // Configuración adicional para Gmail
  tls: {
    rejectUnauthorized: false, // Permitir certificados auto-firmados (necesario para Railway)
    ciphers: 'SSLv3', // Forzar versión de TLS compatible
  },
  // Timeouts más largos para Railway (puede tener latencia de red)
  connectionTimeout: 15000, // 15 segundos máximo para conectar
  socketTimeout: 30000, // 30 segundos máximo para enviar
  greetingTimeout: 10000, // 10 segundos máximo para el saludo SMTP
  // Configuración adicional para Railway
  pool: true, // Usar conexiones persistentes
  maxConnections: 1,
  maxMessages: 3,
})

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  fromName?: string
  fromEmail?: string
}) {
  const fromName = options.fromName || 'PepsiCo Flota'
  
  // Usar SendGrid si está configurado (recomendado - no requiere dominio)
  if (useSendGrid) {
    try {
      const fromEmail = options.fromEmail || sendgridFromEmail
      
      const msg = {
        to: options.to,
        from: `${fromName} <${fromEmail}>`,
        subject: options.subject,
        html: options.html,
      }
      
      await sgMail.send(msg)
      
      console.log(`✅ Correo enviado exitosamente con SendGrid a: ${options.to}`)
      console.log(`📧 From: ${fromEmail}`)
      return { messageId: 'sendgrid-sent', service: 'sendgrid' }
    } catch (error: any) {
      console.error('❌ Error al enviar correo con SendGrid:', error.message)
      if (error.response) {
        console.error('   Detalles:', error.response.body)
      }
      // Intentar fallback a Resend o SMTP
      if (useResend || useSMTP) {
        console.log('🔄 Intentando fallback...')
        throw new Error('SENDGRID_ERROR')
      }
      throw error
    }
  }
  
  // Usar Resend si está configurado (requiere dominio verificado)
  if (useResend && resend) {
    try {
      // Resend requiere dominio verificado. Si el email es @gmail.com, usar el email de prueba de Resend
      let fromEmail = options.fromEmail || resendFromEmail
      
      // Si el dominio no está verificado (gmail.com, etc), usar el email de prueba de Resend
      // Resend permite usar "onboarding@resend.dev" sin verificación para pruebas
      if (fromEmail.includes('@gmail.com') || fromEmail.includes('@yahoo.com') || 
          fromEmail.includes('@hotmail.com') || fromEmail.includes('@outlook.com')) {
        console.log('⚠️  Email personal no verificado en Resend, usando email de prueba')
        fromEmail = 'onboarding@resend.dev'
      }
      
      const { data, error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      })
      
      if (error) {
        console.error('❌ Error al enviar correo con Resend:', error.message)
        // Si es error de dominio no verificado o modo prueba, intentar con SMTP como fallback
        if ((error.message.includes('domain is not verified') || 
             error.message.includes('only send testing emails to your own email')) && useSMTP) {
          console.log('🔄 Resend está en modo prueba o dominio no verificado, haciendo fallback a SMTP...')
          throw new Error('RESEND_DOMAIN_ERROR') // Error especial para detectar y hacer fallback
        }
        throw new Error(`Error Resend: ${error.message}`)
      }
      
      console.log(`✅ Correo enviado exitosamente con Resend a: ${options.to}`)
      console.log(`📧 Message ID: ${data?.id}`)
      console.log(`📧 From: ${fromEmail}`)
      return { messageId: data?.id, service: 'resend' }
    } catch (error: any) {
      // Si es error de dominio y tenemos SMTP, hacer fallback
      if (error.message === 'RESEND_DOMAIN_ERROR' && useSMTP) {
        console.log('🔄 Fallback a SMTP debido a dominio no verificado en Resend')
        // Continuar al código de SMTP abajo
      } else if (error.message === 'SENDGRID_ERROR' && useSMTP) {
        console.log('🔄 Fallback a SMTP debido a error en SendGrid')
        // Continuar al código de SMTP abajo
      } else {
        console.error('❌ Error al enviar correo con Resend:', error.message)
        // Si hay SMTP configurado, intentar fallback
        if (useSMTP) {
          console.log('🔄 Intentando fallback a SMTP...')
        } else {
          throw error
        }
      }
    }
  }
  
  // Fallback a SMTP si SendGrid/Resend no están configurados o fallaron
  if (useSMTP) {
    console.log('⚠️  Usando SMTP como fallback (SendGrid y Resend no disponibles)')
    console.log('   NOTA: Railway puede bloquear conexiones SMTP. Se recomienda usar SendGrid.')
    const fromEmail = options.fromEmail || smtpUser || 'no-reply@example.com'
    
    try {
      const info = await transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      })
      
      console.log(`✅ Correo enviado exitosamente con SMTP a: ${options.to}`)
      console.log(`📧 Message ID: ${info.messageId}`)
      return { messageId: info.messageId, service: 'smtp' }
    } catch (error: any) {
      console.error('❌ Error al enviar correo con SMTP:', error.message)
      console.error('📧 Destinatario:', options.to)
      
      // Mejorar mensajes de error comunes
      if (error.code === 'EAUTH') {
        console.error('❌ Error de autenticación SMTP')
        console.error('   Solución: Verifica SMTP_USER y SMTP_PASS en Railway')
        console.error('   Mejor opción: Configura SENDGRID_API_KEY (recomendado)')
        throw new Error('Error de autenticación SMTP. Verifica que SMTP_USER y SMTP_PASS sean correctos. Para Gmail, usa una contraseña de aplicación. RECOMENDADO: Configura SENDGRID_API_KEY en Railway (funciona mejor y no requiere SMTP).')
      }
      if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        console.error('❌ Error de conexión SMTP - Railway bloquea conexiones SMTP')
        console.error('   SENDGRID_API_KEY configurada?', useSendGrid ? '✅ Sí' : '❌ NO')
        console.error('   RESEND_API_KEY configurada?', useResend ? '✅ Sí' : '❌ NO')
        if (!useSendGrid && !useResend) {
          console.error('   ⚠️  SOLUCIÓN: Configura SENDGRID_API_KEY en Railway')
          console.error('   Pasos: https://app.sendgrid.com/settings/api_keys')
          console.error('   1. Crea API Key en SendGrid')
          console.error('   2. Agrega SENDGRID_API_KEY en Railway')
          console.error('   3. Agrega SENDGRID_FROM_EMAIL=pepsicomanager@gmail.com en Railway')
          console.error('   4. Haz redeploy')
        }
        throw new Error('Error de conexión SMTP. Railway bloquea conexiones SMTP (puertos 587/465). SOLUCIÓN: Configura SENDGRID_API_KEY en Railway (gratis hasta 100 emails/día, funciona sin dominio). Pasos: 1) Crea API Key en sendgrid.com, 2) Agrega SENDGRID_API_KEY en Railway Variables, 3) Agrega SENDGRID_FROM_EMAIL=pepsicomanager@gmail.com, 4) Redeploy.')
      }
      if (error.code === 'EENVELOPE') {
        throw new Error('Error en la dirección de correo. Verifica que el email sea válido.')
      }
      throw error
    }
  }
  
  // Si no hay configuración
  console.error('❌ EMAIL NO CONFIGURADO - No se puede enviar correo')
  console.error('   Configuración actual:')
  console.error('   - SENDGRID_API_KEY:', sendgridApiKey ? '✅ Configurada' : '❌ NO configurada (RECOMENDADO)')
  console.error('   - RESEND_API_KEY:', resendApiKey ? '✅ Configurada' : '❌ NO configurada')
  console.error('   - SMTP_USER:', smtpUser ? '✅ Configurada' : '❌ NO configurada')
  console.error('   SOLUCIÓN RÁPIDA: Configura SENDGRID_API_KEY en Railway')
  console.error('   1. https://sendgrid.com → Crea cuenta gratuita')
  console.error('   2. https://app.sendgrid.com/settings/api_keys → Crea API Key')
  console.error('   3. Railway → Variables → Agrega SENDGRID_API_KEY')
  console.error('   4. Railway → Variables → Agrega SENDGRID_FROM_EMAIL=pepsicomanager@gmail.com')
  console.error('   5. Redeploy')
  throw new Error('Email no configurado. RECOMENDADO: Configura SENDGRID_API_KEY y SENDGRID_FROM_EMAIL en Railway (gratis hasta 100 emails/día, funciona perfectamente con Railway). Alternativa: RESEND_API_KEY o SMTP_USER/SMTP_PASS (pero Railway bloquea SMTP).')
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer Contraseña - PepsiCo Flota</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; width: 100%;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">PepsiCo Flota</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">Restablecer Contraseña</h2>
              
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en PepsiCo Flota.
              </p>
              
              <p style="margin: 0 0 30px 0; color: #4a4a4a; font-size: 16px; line-height: 1.6;">
                Haz clic en el siguiente botón para crear una nueva contraseña:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="${resetLink}" 
                       style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center;">
                      Restablecer Contraseña
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin: 0 0 30px 0; padding: 12px; background-color: #f3f4f6; border-radius: 4px; word-break: break-all;">
                <a href="${resetLink}" style="color: #2563eb; text-decoration: none; font-size: 13px;">${resetLink}</a>
              </p>
              
              <!-- Warning -->
              <div style="padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                  <strong>⚠️ Importante:</strong> Este enlace expirará en <strong>15 minutos</strong> por seguridad.
                </p>
              </div>
              
              <!-- Footer Note -->
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña no será modificada.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                Este es un correo automático, por favor no respondas.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                © ${new Date().getFullYear()} PepsiCo Flota. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
  
  await sendEmail({ 
    to, 
    subject: 'Restablecer Contraseña - PepsiCo Flota',
    html,
    fromName: 'PepsiCo Flota'
  })
}







