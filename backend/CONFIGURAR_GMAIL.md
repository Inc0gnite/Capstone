# Configuración de Gmail para Recuperación de Contraseña

Esta guía explica cómo configurar Gmail para que el sistema pueda enviar correos de recuperación de contraseña.

## Pasos para Configurar Gmail

### 1. Habilitar la Autenticación de 2 Factores

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Ve a **Seguridad**
3. Busca **Verificación en dos pasos** y actívala si no está activada

### 2. Generar una Contraseña de Aplicación

1. En la página de **Seguridad** de Google, busca **Contraseñas de aplicaciones**
2. O ve directamente a: https://myaccount.google.com/apppasswords
3. Selecciona:
   - **Aplicación**: "Correo"
   - **Dispositivo**: "Otro (nombre personalizado)"
   - Escribe: "PepsiCo Flota Sistema"
4. Haz clic en **Generar**
5. **Copia la contraseña de 16 caracteres** que se genera (sin espacios)

### 3. Configurar Variables de Entorno

Crea o actualiza el archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=pepsicomanager@gmail.com
SMTP_PASS=la_contraseña_de_aplicación_generada
```

**Importante:**
- `SMTP_USER`: Tu dirección de correo Gmail completa
- `SMTP_PASS`: La contraseña de aplicación de 16 caracteres (NO tu contraseña normal de Gmail)

### 4. Reiniciar el Servidor

Después de actualizar el archivo `.env`, reinicia el servidor backend:

```bash
# Si estás en desarrollo
npm run dev

# Si estás en producción, reinicia el servicio
```

## Verificación

Para verificar que la configuración funciona:

1. Ve a la página de login
2. Haz clic en "¿Olvidaste tu contraseña?"
3. Ingresa un email de usuario registrado
4. Revisa la bandeja de entrada del email (y la carpeta de spam)
5. Deberías recibir un correo con el enlace para restablecer la contraseña

## Solución de Problemas

### Error: "Invalid login credentials"
- Verifica que `SMTP_USER` sea tu correo completo (ej: `usuario@gmail.com`)
- Verifica que `SMTP_PASS` sea la contraseña de aplicación, NO tu contraseña normal

### Error: "Connection timeout"
- Verifica que tengas conexión a internet
- Verifica que el puerto 587 no esté bloqueado por el firewall

### El correo no llega
- Revisa la carpeta de spam
- Verifica que el email del usuario esté correctamente escrito
- Revisa los logs del servidor para ver errores específicos

## Nota de Seguridad

⚠️ **NUNCA** compartas tu contraseña de aplicación públicamente. El archivo `.env` debe estar en `.gitignore` y no debe subirse a repositorios públicos.

