# 🔧 Solución: Error de Conexión SMTP en Railway

## ❌ Error que Estás Viendo

```
Error de conexión SMTP. Railway puede estar bloqueando conexiones SMTP.
```

## 🔍 Explicación del Problema

**¿Qué significa este error?**
- El sistema está intentando usar **SMTP** (Gmail, Outlook, etc.) para enviar correos
- **Railway bloquea conexiones SMTP** (puertos 587 y 465) por políticas de seguridad
- Por eso todas las conexiones SMTP fallan con timeout

**¿Por qué está usando SMTP?**
- El sistema intenta usar servicios en este orden:
  1. **SendGrid** (recomendado) - Si `SENDGRID_API_KEY` está configurada
  2. **Resend** - Si `RESEND_API_KEY` está configurada
  3. **SMTP** - Solo como último recurso (y falla en Railway)

- Si ves este error, significa que **`SENDGRID_API_KEY` NO está configurada en Railway**

---

## ✅ Solución: Configurar SendGrid

SendGrid es perfecto porque:
- ✅ **No usa SMTP** - Usa HTTP/HTTPS (funciona con Railway)
- ✅ **Gratis hasta 100 emails/día** (suficiente para desarrollo)
- ✅ **No requiere verificar dominio completo** - Solo el email remitente
- ✅ **Funciona inmediatamente** - Sin esperar propagación DNS

---

## 📋 Pasos para Solucionar

### PASO 1: Verificar Email Remitente en SendGrid (Si no lo hiciste)

1. Ve a: **https://app.sendgrid.com/settings/sender_auth**
2. Haz clic en **"Verify a Single Sender"**
3. Completa:
   - **From Email Address**: `pepsicomanager@gmail.com`
   - **From Name**: `PepsiCo Flota`
   - **Reply To**: `pepsicomanager@gmail.com`
   - Completa los demás campos requeridos
4. Haz clic en **"Create"**
5. Abre el correo que SendGrid envió a `pepsicomanager@gmail.com`
6. Haz clic en el enlace de verificación
7. ✅ Email verificado

**✅ Ya tienes tu API Key de SendGrid** (cópiala desde SendGrid)

### PASO 2: Configurar Variables en Railway

1. Ve a: **https://railway.app/**
2. Tu proyecto → Servicio **backend** → **Variables**

3. **Agrega estas 2 variables:**

   **Variable 1:**
   ```
   Name: SENDGRID_API_KEY
   Value: SG.tu_api_key_aqui_de_sendgrid
   ```
   (Pega tu API Key completa desde SendGrid - debe empezar con `SG.`)

   **Variable 2:**
   ```
   Name: SENDGRID_FROM_EMAIL
   Value: pepsicomanager@gmail.com
   ```

4. Railway guarda automáticamente

### PASO 3: Redeploy

1. Railway debería redeployear automáticamente
2. Si no, ve a **Deployments** → **Redeploy**
3. Espera 2-3 minutos

### PASO 4: Verificar que Funciona

1. **Revisa los logs** en Railway al iniciar:
   - Deberías ver: `✅ SendGrid configurado (recomendado - funciona sin dominio)`
   - **NO deberías ver**: `⚠️  Usando SMTP como fallback`

2. **Prueba recuperar contraseña:**
   - Ve a tu frontend
   - "¿Olvidaste tu contraseña?"
   - Ingresa un email de usuario
   - Revisa los logs en Railway

3. **Deberías ver:**
   ```
   ✅ Correo enviado exitosamente con SendGrid a: [email]
   📧 From: pepsicomanager@gmail.com
   ```

4. **NO deberías ver más el error de SMTP**

---

## 🎯 Checklist de Verificación

- [ ] Email `pepsicomanager@gmail.com` verificado en SendGrid
- [ ] `SENDGRID_API_KEY` agregada en Railway Variables
- [ ] `SENDGRID_FROM_EMAIL` agregada en Railway Variables
- [ ] Redeploy completado
- [ ] Logs muestran `✅ SendGrid configurado`
- [ ] Logs NO muestran `⚠️  Usando SMTP como fallback`
- [ ] Prueba de recuperación funciona
- [ ] Correo llega correctamente

---

## 📊 Logs Esperados (Correctos)

Cuando SendGrid está configurado, deberías ver:

```
✅ SendGrid configurado (recomendado - funciona sin dominio)
   From Email: pepsicomanager@gmail.com
📧 Iniciando envío de correo de recuperación a: usuario@ejemplo.com
✅ Correo enviado exitosamente con SendGrid a: usuario@ejemplo.com
📧 From: pepsicomanager@gmail.com
```

---

## 🚫 Logs de Error (Incorrectos)

Si ves esto, significa que SendGrid NO está configurado:

```
⚠️  Usando SMTP como fallback (SendGrid y Resend no disponibles)
   NOTA: Railway puede bloquear conexiones SMTP. Se recomienda usar SendGrid.
❌ Error al enviar correo con SMTP: Error de conexión SMTP...
```

**Solución:** Configura `SENDGRID_API_KEY` en Railway (ver PASO 2 arriba)

---

## 🔒 Seguridad

- ✅ La API Key en Railway está segura (no se muestra en logs públicos)
- ✅ La API Key no debe estar en el código ni en GitHub
- ✅ Solo debe estar en Railway Variables (encriptadas)

---

**Después de estos pasos, el error de SMTP desaparecerá y el sistema usará SendGrid correctamente.** 🎉

