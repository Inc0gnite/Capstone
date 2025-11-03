# 📧 Configurar Resend para Recuperación de Contraseña (Recomendado para Railway)

## 🎯 ¿Por qué Resend?

Railway bloquea conexiones SMTP salientes por seguridad, causando "Connection timeout". **Resend** es:
- ✅ **Gratis** hasta 3,000 emails/mes
- ✅ **Diseñado para serverless** (Railway, Vercel, etc.)
- ✅ **No requiere configuración SMTP** complicada
- ✅ **Funciona inmediatamente** sin problemas de red
- ✅ **API simple** y confiable

---

## 📋 PASO 1: Crear Cuenta en Resend

1. Ve a: **https://resend.com**
2. Haz clic en **"Sign Up"** (puedes usar Google/GitHub)
3. Verifica tu email
4. Completa el registro

---

## 🔑 PASO 2: Obtener API Key

1. En el Dashboard de Resend, ve a **"API Keys"**
2. Haz clic en **"Create API Key"**
3. Dale un nombre: **"PepsiCo Flota Railway"**
4. Selecciona permisos: **"Sending access"**
5. Haz clic en **"Add"**
6. **⚠️ IMPORTANTE**: Copia la API Key inmediatamente
   - Se muestra solo UNA vez
   - Formato: `re_xxxxxxxxxxxxx`

---

## 🚂 PASO 3: Configurar Variables en Railway

1. Ve a **Railway Dashboard**: https://railway.app/
2. Selecciona tu proyecto → Servicio **backend**
3. Ve a la pestaña **"Variables"**

### Agregar Variables:

#### Variable 1: `RESEND_API_KEY`
```
Name: RESEND_API_KEY
Value: re_xxxxxxxxxxxxx (la API key que copiaste)
```

#### Variable 2: `RESEND_FROM_EMAIL` (Opcional)
```
Name: RESEND_FROM_EMAIL
Value: pepsicomanager@gmail.com
```

**Nota**: Si no configuras `RESEND_FROM_EMAIL`, Resend usará un email de prueba por defecto. Para usar tu propio dominio después, necesitarás verificar tu dominio en Resend.

4. Guarda las variables (Railway guarda automáticamente)

---

## 🔄 PASO 4: Redeploy

1. Railway debería iniciar un redeploy automáticamente
2. Si no, ve a **Deployments** → Haz clic en **"Redeploy"**
3. Espera a que termine (2-3 minutos)

---

## ✅ PASO 5: Verificar que Funciona

### 5.1. Revisar Logs al Iniciar

En Railway → Deployments → Logs, deberías ver:

```
✅ Resend configurado (recomendado para Railway)
   From Email: pepsicomanager@gmail.com
```

Si ves esto, ✅ está configurado correctamente.

### 5.2. Probar Recuperación de Contraseña

1. Ve a tu frontend: https://capstone-frontend-wine.vercel.app
2. Haz clic en **"¿Olvidaste tu contraseña?"**
3. Ingresa un email de usuario registrado
4. Haz clic en **"Enviar"**

### 5.3. Verificar Logs

En Railway → Logs, deberías ver:

```
📧 Iniciando envío de correo de recuperación a: [email]
✅ Correo enviado exitosamente con Resend a: [email]
📧 Message ID: [id]
```

### 5.4. Verificar el Correo

1. Abre el correo del destinatario
2. Revisa **Bandeja de entrada** y **Spam**
3. Deberías recibir el correo con el enlace de recuperación

---

## 🔧 Verificar Email en Resend Dashboard

1. Ve a: https://resend.com/emails
2. Verás todos los correos enviados
3. Puedes ver:
   - Estado (Enviado, Entregado, Fallido)
   - Destinatario
   - Asunto
   - Fecha y hora

---

## 📝 Resumen de Variables

En Railway, configura estas variables:

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=pepsicomanager@gmail.com (opcional)
```

**Eso es todo.** No necesitas configurar SMTP_HOST, SMTP_PORT, SMTP_USER, ni SMTP_PASS.

---

## ✅ Checklist Final

- [ ] Cuenta creada en Resend
- [ ] API Key generada y copiada
- [ ] `RESEND_API_KEY` agregada en Railway
- [ ] `RESEND_FROM_EMAIL` agregada en Railway (opcional)
- [ ] Redeploy completado en Railway
- [ ] Logs muestran "✅ Resend configurado"
- [ ] Prueba de recuperación de contraseña funciona
- [ ] Correo llega correctamente

---

## 🆘 Si Hay Problemas

### Error: "Email no configurado"
- Verifica que `RESEND_API_KEY` esté en Railway
- Verifica que el valor sea correcto (empieza con `re_`)
- Haz redeploy después de agregar la variable

### Error: "Invalid API Key"
- Genera una nueva API Key en Resend
- Actualiza `RESEND_API_KEY` en Railway
- Haz redeploy

### Correo no llega
- Revisa la carpeta Spam
- Verifica en Resend Dashboard que el correo se envió
- Verifica que el email del destinatario sea correcto

---

## 🎉 ¡Listo!

Una vez configurado, Resend funcionará de forma automática y confiable. No tendrás más problemas de "Connection timeout" porque Resend usa HTTP/HTTPS en lugar de SMTP, que Railway no bloquea.

**Ventajas adicionales:**
- 📊 Dashboard con estadísticas de envío
- 📈 Tracking de aperturas y clics (en planes pagos)
- 🔒 Más seguro que SMTP
- ⚡ Más rápido

