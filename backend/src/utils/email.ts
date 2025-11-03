import nodemailer from 'nodemailer'

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS

// Validar configuración de SMTP
if (!smtpUser || !smtpPass) {
  console.error('❌ SMTP NO CONFIGURADO')
  console.error('   SMTP_USER:', smtpUser ? 'configurado' : 'NO CONFIGURADO')
  console.error('   SMTP_PASS:', smtpPass ? 'configurado' : 'NO CONFIGURADO')
  console.error('   Las variables SMTP_USER y SMTP_PASS son requeridas.')
  console.error('   Revisa las variables de entorno en Railway y sigue las instrucciones en ACTUALIZAR_GMAIL_RAILWAY.md')
} else {
  console.log('✅ SMTP Configurado correctamente')
  console.log('   Host:', smtpHost)
  console.log('   Port:', smtpPort)
  console.log('   User:', smtpUser)
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
  // Agregar configuración adicional para Gmail
  tls: {
    rejectUnauthorized: false, // Solo para desarrollo, en producción usar true
  },
  // Timeouts para evitar que se quede esperando indefinidamente
  connectionTimeout: 5000, // 5 segundos máximo para conectar
  socketTimeout: 10000, // 10 segundos máximo para enviar
  greetingTimeout: 5000, // 5 segundos máximo para el saludo SMTP
})

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  fromName?: string
  fromEmail?: string
}) {
  // Validar que SMTP esté configurado
  if (!smtpUser || !smtpPass) {
    throw new Error('SMTP no está configurado. Por favor, configura SMTP_USER y SMTP_PASS en el archivo .env')
  }

  // Verificar que el transporter esté configurado correctamente
  if (!transporter) {
    throw new Error('Transporter SMTP no está inicializado correctamente')
  }

  const fromName = options.fromName || 'PepsiCo Flota'
  const fromEmail = options.fromEmail || smtpUser || 'no-reply@example.com'
  
  try {
    // Enviar correo directamente (los timeouts protegerán contra demoras)
    const info = await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    
    console.log(`✅ Correo enviado exitosamente a: ${options.to}`)
    console.log(`📧 Message ID: ${info.messageId}`)
    return info
  } catch (error: any) {
    console.error('❌ Error al enviar correo:', error.message)
    console.error('📧 Destinatario:', options.to)
    
    // Mejorar mensajes de error comunes
    if (error.code === 'EAUTH') {
      throw new Error('Error de autenticación SMTP. Verifica que SMTP_USER y SMTP_PASS sean correctos. Para Gmail, usa una contraseña de aplicación, no tu contraseña normal.')
    }
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      throw new Error('Error de conexión SMTP. Verifica tu conexión a internet y que el puerto no esté bloqueado.')
    }
    if (error.code === 'EENVELOPE') {
      throw new Error('Error en la dirección de correo. Verifica que el email sea válido.')
    }
    throw error
  }
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







