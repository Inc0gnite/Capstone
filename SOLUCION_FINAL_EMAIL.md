# ✅ Solución Final: Configurar Resend para Email en Railway

## 🔍 Problema Identificado

Los logs muestran **"Connection timeout"** porque Railway bloquea conexiones SMTP salientes por seguridad. Esto afecta tanto al puerto 587 como al 465.

**Solución:** Usar **Resend**, un servicio de email diseñado para aplicaciones serverless que funciona perfectamente con Railway.

---

## 🚀 Solución Rápida (5 minutos)

### 1. Crear cuenta en Resend
- Ve a: https://resend.com
- Regístrate (gratis)
- Verifica tu email

### 2. Obtener API Key
- Dashboard → API Keys → Create
- Nombre: "PepsiCo Flota Railway"
- Permisos: "Sending access"
- **Copia la API Key** (se muestra solo una vez)

### 3. Configurar en Railway
- Railway → Tu proyecto → Backend → Variables
- Agrega:
  ```
  RESEND_API_KEY=re_xxxxxxxxxxxxx
  RESEND_FROM_EMAIL=pepsicomanager@gmail.com
  ```

### 4. Redeploy
- Railway redeployea automáticamente
- O haz clic en "Redeploy" manualmente

### 5. Probar
- Intenta recuperar contraseña
- Revisa los logs: deberías ver `✅ Correo enviado exitosamente con Resend`
- Verifica que el correo llegue

---

## 📊 Ventajas de Resend

- ✅ **Gratis** hasta 3,000 emails/mes
- ✅ **Funciona con Railway** sin problemas de red
- ✅ **No requiere SMTP** - usa HTTP/HTTPS
- ✅ **Dashboard** con estadísticas
- ✅ **Más rápido** que SMTP
- ✅ **Más confiable** para aplicaciones serverless

---

## 📝 Archivos Modificados

- ✅ `backend/src/utils/email.ts` - Actualizado para usar Resend o SMTP
- ✅ `backend/package.json` - Resend agregado como dependencia
- ✅ Código detecta automáticamente si usar Resend o SMTP

---

## 🔗 Documentación Completa

- `CONFIGURAR_RESEND_RAILWAY.md` - Guía detallada paso a paso

---

## ⚡ Resultado Esperado

**Antes (con SMTP):**
```
❌ Error al enviar correo: Connection timeout
```

**Después (con Resend):**
```
✅ Resend configurado (recomendado para Railway)
✅ Correo enviado exitosamente con Resend a: [email]
📧 Message ID: [id]
```

---

**¡Después de configurar Resend, el sistema de recuperación de contraseña funcionará perfectamente!** 🎉

