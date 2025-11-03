import nodemailer from 'nodemailer'
import { Resend } from 'resend'

// Configuración Resend (recomendado para Railway)
const resendApiKey = process.env.RESEND_API_KEY
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

// Configuración SMTP (fallback)
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS

// Detectar qué servicio de email usar
const useResend = !!resendApiKey
const useSMTP = !useResend && !!smtpUser && !!smtpPass

// Inicializar Resend si está configurado
const resend = useResend ? new Resend(resendApiKey) : null

// Logging de configuración
if (useResend) {
  console.log('✅ Resend configurado (recomendado para Railway)')
  console.log('   From Email:', resendFromEmail)
} else if (useSMTP) {
  console.log('✅ SMTP Configurado correctamente')
  console.log('   Host:', smtpHost)
  console.log('   Port:', smtpPort)
  console.log('   User:', smtpUser)
} else {
  console.error('❌ EMAIL NO CONFIGURADO')
  console.error('   Opción 1 (Recomendado): Configura RESEND_API_KEY en Railway')
  console.error('   Opción 2: Configura SMTP_USER y SMTP_PASS en Railway')
  console.error('   Para configurar Resend: https://resend.com (gratis hasta 3,000 emails/mes)')
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
  
  // Usar Resend si está configurado (recomendado para Railway)
  if (useResend && resend) {
    try {
      const fromEmail = options.fromEmail || resendFromEmail
      
      const { data, error } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      })
      
      if (error) {
        console.error('❌ Error al enviar correo con Resend:', error.message)
        throw new Error(`Error Resend: ${error.message}`)
      }
      
      console.log(`✅ Correo enviado exitosamente con Resend a: ${options.to}`)
      console.log(`📧 Message ID: ${data?.id}`)
      return { messageId: data?.id, service: 'resend' }
    } catch (error: any) {
      console.error('❌ Error al enviar correo con Resend:', error.message)
      throw error
    }
  }
  
  // Fallback a SMTP si Resend no está configurado
  if (useSMTP) {
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
        throw new Error('Error de autenticación SMTP. Verifica que SMTP_USER y SMTP_PASS sean correctos. Para Gmail, usa una contraseña de aplicación, no tu contraseña normal.')
      }
      if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        throw new Error('Error de conexión SMTP. Railway puede estar bloqueando conexiones SMTP. Considera usar Resend (RESEND_API_KEY) que funciona mejor con Railway.')
      }
      if (error.code === 'EENVELOPE') {
        throw new Error('Error en la dirección de correo. Verifica que el email sea válido.')
      }
      throw error
    }
  }
  
  // Si no hay configuración
  throw new Error('Email no configurado. Configura RESEND_API_KEY (recomendado) o SMTP_USER/SMTP_PASS en Railway.')
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Restablecer contraseña</h2>
      <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
      <p>Puedes crear una nueva contraseña haciendo clic en el siguiente botón:</p>
      <p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">Restablecer contraseña</a>
      </p>
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Este enlace expirará en 15 minutos.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    </div>
  `
  await sendEmail({ to, subject: 'Instrucciones para restablecer contraseña', html })
}







