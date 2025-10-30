import nodemailer from 'nodemailer'

const smtpHost = process.env.SMTP_HOST
const smtpPort = Number(process.env.SMTP_PORT || 587)
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
})

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  fromName?: string
  fromEmail?: string
}) {
  const fromName = options.fromName || 'PepsiCo Flota'
  const fromEmail = options.fromEmail || smtpUser || 'no-reply@example.com'
  await transporter.sendMail({
    from: `${fromName} <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
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


