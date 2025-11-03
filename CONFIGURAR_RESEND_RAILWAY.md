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

**Tu API Key (que proporcionaste):**
```
re_YxmpJL4C_7LEARm1w6AGsdZo5cHjsQVCP
```

---

## 🚂 PASO 3: Configurar Variables en Railway

1. Ve a **Railway Dashboard**: https://railway.app/
2. Selecciona tu proyecto → Servicio **backend**
3. Ve a la pestaña **"Variables"**

### Agregar Variables:

#### Variable 1: `RESEND_API_KEY` (OBLIGATORIO)
```
Name: RESEND_API_KEY
Value: re_YxmpJL4C_7LEARm1w6AGsdZo5cHjsQVCP
```

#### Variable 2: `RESEND_FROM_EMAIL` (OPCIONAL)
```
Name: RESEND_FROM_EMAIL
Value: onboarding@resend.dev
```

**⚠️ IMPORTANTE sobre RESEND_FROM_EMAIL:**
- Si usas `onboarding@resend.dev`: Funciona inmediatamente sin verificación
- Si usas `pepsicomanager@gmail.com`: Requiere verificar el dominio gmail.com (no es posible)
- **Recomendación**: Usa `onboarding@resend.dev` por ahora
- El correo llegará desde ese remitente, pero funcionará perfectamente

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
   From Email: onboarding@resend.dev
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
⚠️  Email personal no verificado en Resend, usando email de prueba
✅ Correo enviado exitosamente con Resend a: [email]
📧 Message ID: [id]
📧 From: onboarding@resend.dev
```

### 5.4. Verificar el Correo

1. Abre el correo del destinatario
2. Revisa **Bandeja de entrada** y **Spam**
3. El correo llegará desde: **onboarding@resend.dev**
4. Deberías recibir el correo con el enlace de recuperación

---

## 📝 Resumen de Variables en Railway

```
RESEND_API_KEY=re_YxmpJL4C_7LEARm1w6AGsdZo5cHjsQVCP
RESEND_FROM_EMAIL=onboarding@resend.dev
```

**Eso es todo.** No necesitas configurar SMTP_HOST, SMTP_PORT, SMTP_USER, ni SMTP_PASS.

---

## 📧 Sobre el Email Remitente

**El correo llegará desde:** `PepsiCo Flota <onboarding@resend.dev>`

Esto es normal y funciona perfectamente. Los usuarios recibirán el correo correctamente. Si más adelante quieres usar tu propio dominio:

1. Verifica tu dominio en Resend (Dashboard → Domains)
2. Actualiza `RESEND_FROM_EMAIL` con tu dominio verificado

---

## ✅ Checklist Final

- [x] API Key obtenida: `re_YxmpJL4C_7LEARm1w6AGsdZo5cHjsQVCP`
- [ ] `RESEND_API_KEY` agregada en Railway
- [ ] `RESEND_FROM_EMAIL=onboarding@resend.dev` agregada en Railway
- [ ] Redeploy completado en Railway
- [ ] Logs muestran "✅ Resend configurado"
- [ ] Prueba de recuperación de contraseña funciona
- [ ] Correo llega correctamente desde onboarding@resend.dev

---

## 🆘 Si Hay Problemas

### Error: "Email no configurado"
- Verifica que `RESEND_API_KEY` esté en Railway
- Verifica que el valor sea correcto: `re_YxmpJL4C_7LEARm1w6AGsdZo5cHjsQVCP`
- Haz redeploy después de agregar la variable

### Error: "Invalid API Key"
- Verifica que la API Key sea correcta
- Genera una nueva API Key en Resend si es necesario
- Actualiza `RESEND_API_KEY` en Railway

### Correo no llega
- Revisa la carpeta Spam
- Verifica en Resend Dashboard (https://resend.com/emails) que el correo se envió
- Verifica que el email del destinatario sea correcto

---

## 🎉 ¡Listo!

Una vez configurado, Resend funcionará de forma automática y confiable. No tendrás más problemas de "Connection timeout" porque Resend usa HTTP/HTTPS en lugar de SMTP, que Railway no bloquea.

**El código detecta automáticamente si usar Resend o SMTP, y hace fallback si es necesario.**
