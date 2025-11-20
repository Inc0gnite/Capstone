# 🔍 Diagnóstico: Correo de Recuperación No Llega

## ⚠️ Problema
El correo de recuperación de contraseña no está llegando.

---

## 📋 Checklist de Diagnóstico

### ✅ PASO 1: Verificar Variables en Railway

1. Ve a **Railway Dashboard**: https://railway.app/
2. Selecciona tu proyecto → Servicio **backend**
3. Ve a la pestaña **"Variables"**
4. **Verifica que estas variables existan:**

```
✅ SMTP_HOST=smtp.gmail.com
✅ SMTP_PORT=587
✅ SMTP_USER=pepsicomanager@gmail.com
✅ SMTP_PASS=[contraseña de aplicación de 16 caracteres]
```

**❌ Si alguna falta:**
- Agrégala haciendo clic en **"+ New Variable"**
- Para `SMTP_PASS`, genera una nueva contraseña de aplicación:
  1. Ve a: https://myaccount.google.com/apppasswords
  2. Selecciona: Aplicación "Correo", Dispositivo "Otro"
  3. Nombre: "PepsiCo Flota Sistema"
  4. Copia la contraseña de 16 caracteres

---

### ✅ PASO 2: Verificar Logs en Railway

1. En Railway, ve a **Deployments**
2. Haz clic en el deployment más reciente
3. Ve a la pestaña **"Logs"**
4. Busca mensajes relacionados con email cuando pruebes recuperar contraseña

#### ✅ Mensajes BUENOS (todo está bien):
```
✅ SMTP Configurado correctamente
   Host: smtp.gmail.com
   Port: 587
   User: pepsicomanager@gmail.com
📧 Iniciando envío de correo de recuperación a: [email]
✅ Correo enviado exitosamente a: [email]
📧 Message ID: [id]
```

#### ❌ Mensajes MALOS (hay problemas):

**Problema 1: SMTP no configurado**
```
❌ SMTP NO CONFIGURADO
   SMTP_USER: NO CONFIGURADO
   SMTP_PASS: NO CONFIGURADO
```
**Solución**: Agregar las variables en Railway (PASO 1)

**Problema 2: Error de autenticación**
```
❌ Error al enviar correo de restablecimiento:
   Mensaje: Error de autenticación SMTP
   Código: EAUTH
   SMTP User: pepsicomanager@gmail.com
   SMTP Pass: ***configurado***
```
**Solución**: 
- Genera una NUEVA contraseña de aplicación
- Actualiza `SMTP_PASS` en Railway con la nueva contraseña
- Haz redeploy

**Problema 3: Error de conexión**
```
❌ Error al enviar correo de restablecimiento:
   Mensaje: Error de conexión SMTP
   Código: ECONNECTION o ETIMEDOUT
```
**Solución**: 
- Verifica tu conexión a internet
- Verifica que el puerto 587 no esté bloqueado
- Revisa si Railway tiene restricciones de red

---

### ✅ PASO 3: Verificar el Correo

1. Abre **Gmail** con la cuenta: `pepsicomanager@gmail.com`
2. Revisa:
   - ✅ **Bandeja de entrada**
   - ✅ **Spam / Correo no deseado**
   - ✅ **Todas las pestañas** (si tienes configuración avanzada)
3. **Busca correos con asunto**: "Instrucciones para restablecer contraseña"

**Si el correo NO está:**
- Verifica los logs (PASO 2) para ver si hay errores
- Espera 2-3 minutos (a veces Gmail tiene demoras)
- Revisa si Gmail está bloqueando correos entrantes

---

### ✅ PASO 4: Probar Manualmente

1. En Railway, ve a **Deployments** → Logs en tiempo real
2. En tu aplicación, intenta recuperar contraseña
3. Observa los logs inmediatamente

**Lo que deberías ver:**
```
📧 Iniciando envío de correo de recuperación a: [email del usuario]
📧 SMTP configurado - Host: smtp.gmail.com, User: configurado
✅ Correo enviado exitosamente a: [email]
📧 Message ID: [id]
```

**Si ves errores:**
- Copia el mensaje de error completo
- Revisa qué problema específico indica (EAUTH, ECONNECTION, etc.)
- Sigue las soluciones del PASO 2

---

## 🔧 Soluciones Comunes

### Problema: Variables no están en Railway

**Solución:**
1. Ve a Railway → Variables
2. Agrega cada variable faltante
3. Haz clic en "Redeploy" o espera a que se redeployee automáticamente

### Problema: Contraseña de aplicación incorrecta

**Solución:**
1. Ve a: https://myaccount.google.com/apppasswords
2. Genera una NUEVA contraseña de aplicación
3. Actualiza `SMTP_PASS` en Railway
4. Haz redeploy

### Problema: Gmail bloqueando correos

**Solución:**
1. Ve a: https://myaccount.google.com/security
2. Verifica que "Acceso de aplicaciones menos seguras" esté habilitado
3. Revisa actividad reciente en tu cuenta
4. Si ves alertas, marca como "Fue yo"

### Problema: Correo llega a Spam

**Solución:**
- Esto es normal, revisa la carpeta Spam
- Marca como "No es spam" cuando llegue
- Los siguientes correos deberían llegar a la bandeja principal

---

## 🧪 Test Manual de SMTP

Puedes probar la conexión SMTP directamente desde Railway:

1. Ve a Railway → Deployments
2. Haz clic en el último deployment
3. Abre una terminal/shell si Railway lo permite
4. O revisa los logs cuando inicie el servidor

**Deberías ver al iniciar:**
```
✅ SMTP Configurado correctamente
   Host: smtp.gmail.com
   Port: 587
   User: pepsicomanager@gmail.com
```

Si NO ves esto, las variables no están configuradas.

---

## 📞 Siguiente Paso

Si después de seguir estos pasos el correo aún no llega:

1. **Revisa los logs en Railway** y copia los mensajes de error completos
2. **Verifica** que todas las variables estén correctamente configuradas
3. **Genera una nueva contraseña de aplicación** y actualiza `SMTP_PASS`
4. **Haz redeploy** después de cada cambio

---

## ✅ Verificación Final

Una vez que todo esté configurado:

1. ✅ Variables configuradas en Railway
2. ✅ Logs muestran "SMTP Configurado correctamente"
3. ✅ Al intentar recuperar contraseña, logs muestran "✅ Correo enviado exitosamente"
4. ✅ Correo llega a `pepsicomanager@gmail.com` (o Spam)

**Si todos estos puntos están ✅, el sistema está funcionando correctamente.**

