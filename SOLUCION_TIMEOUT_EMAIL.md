# 🔧 Solución: Connection Timeout en Railway para Email

## ❌ Problema Identificado

Los logs muestran:
```
❌ Error al enviar correo: Connection timeout
Error de conexión SMTP
```

**Causa**: Railway está bloqueando conexiones salientes al puerto 587 de Gmail, o hay restricciones de red.

---

## ✅ SOLUCIÓN 1: Cambiar a Puerto 465 (SSL)

El puerto 465 con SSL puede funcionar mejor en Railway.

### Paso 1: Actualizar Variable en Railway

1. Ve a Railway Dashboard → Tu proyecto → Backend → **Variables**
2. Busca `SMTP_PORT`
3. Cambia el valor de `587` a `465`
4. Guarda el cambio

**O crea la variable si no existe:**
```
Name: SMTP_PORT
Value: 465
```

### Paso 2: Redeploy

Railway debería redeployear automáticamente. Si no:
1. Ve a Deployments
2. Haz clic en "Redeploy"

### Paso 3: Probar

Intenta recuperar contraseña nuevamente y revisa los logs.

---

## ✅ SOLUCIÓN 2: Usar Servicio de Email Externo (Recomendado para Producción)

Railway puede tener restricciones de red. Usar un servicio especializado es más confiable.

### Opción A: Resend (Recomendado - Gratis hasta 3,000 emails/mes)

1. **Crear cuenta**: https://resend.com
2. **Obtener API Key**: Dashboard → API Keys → Create
3. **Actualizar código** (si decides usar esto):

Instalar paquete:
```bash
npm install resend
```

Actualizar `backend/src/utils/email.ts` para usar Resend.

### Opción B: SendGrid (Gratis hasta 100 emails/día)

1. Crear cuenta: https://sendgrid.com
2. Verificar dominio
3. Obtener API Key
4. Actualizar variables en Railway

### Opción C: Mailgun

Similar a SendGrid, gratis para desarrollo.

---

## ✅ SOLUCIÓN 3: Verificar Configuración de Railway

Railway puede tener restricciones de red. Verifica:

1. **Network Settings** en Railway
2. **Firewall Rules** - Asegúrate de que puertos salientes estén permitidos
3. **Private Network** - Si está en red privada, puede no tener acceso saliente

---

## 🔍 Diagnóstico Actual

Según los logs:
- ✅ SMTP está configurado correctamente
- ✅ Credenciales están presentes
- ❌ **Connection timeout** - No puede conectarse a Gmail

Esto confirma que es un problema de red de Railway, no de configuración.

---

## 📋 Checklist de Acciones

1. [ ] Intentar cambiar `SMTP_PORT` a `465` en Railway
2. [ ] Hacer redeploy
3. [ ] Probar recuperación de contraseña
4. [ ] Revisar logs nuevamente
5. [ ] Si sigue fallando, considerar servicio externo (Resend/SendGrid)

---

## 🚀 Próximo Paso Inmediato

**Cambia `SMTP_PORT` a `465` en Railway y haz redeploy.**

Esto tiene más probabilidades de funcionar porque:
- Puerto 465 usa SSL directo (más seguro)
- Railway puede tener mejor soporte para puertos SSL
- Es el método recomendado por Gmail para aplicaciones

---

## ⚠️ Si Nada Funciona

Considera usar un servicio de email externo como **Resend** que está diseñado para aplicaciones serverless y funciona perfectamente con Railway.

