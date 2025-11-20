# 📧 Actualizar Gmail en Railway - Guía Paso a Paso

## 🎯 Objetivo
Actualizar la configuración de Gmail (`pepsicomanager@gmail.com`) en Railway para que el sistema pueda enviar correos de recuperación de contraseña.

---

## 📋 PASO 1: Generar Contraseña de Aplicación de Gmail

### 1.1. Activar Verificación en Dos Pasos (Si no está activada)
1. Ve a: **https://myaccount.google.com/**
2. Inicia sesión con: `pepsicomanager@gmail.com`
3. Ve a **"Seguridad"** → **"Verificación en dos pasos"**
4. Si no está activa, actívala siguiendo las instrucciones

### 1.2. Generar Contraseña de Aplicación
1. Ve a: **https://myaccount.google.com/apppasswords**
2. Selecciona:
   - **Aplicación**: "Correo"
   - **Dispositivo**: "Otro (nombre personalizado)"
   - **Nombre**: "PepsiCo Flota Sistema"
3. Haz clic en **"Generar"**
4. **Copia la contraseña de 16 caracteres** (se muestra solo una vez)
   - Ejemplo: `abcd efgh ijkl mnop`
   - Puedes copiarla con o sin espacios, ambos funcionan

---

## 🚂 PASO 2: Actualizar Variables en Railway

### 2.1. Acceder a Railway Dashboard
1. Ve a: **https://railway.app/**
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (donde está desplegado el backend)

### 2.2. Ir a Variables de Entorno
1. En el dashboard de Railway, haz clic en el servicio **"backend"**
2. Ve a la pestaña **"Variables"** (en el menú lateral)
3. Verás una lista de todas las variables de entorno actuales

### 2.3. Actualizar Variables de Gmail
Busca estas variables y actualízalas:

#### Variable 1: `SMTP_USER`
- **Nombre**: `SMTP_USER`
- **Valor actual**: Probablemente `imsuicideboys@gmail.com`
- **Valor nuevo**: `pepsicomanager@gmail.com`
- **Acción**: 
  - Si existe → Haz clic en el ✏️ (lápiz) para editarla
  - Si no existe → Haz clic en **"+ New Variable"**

#### Variable 2: `SMTP_PASS`
- **Nombre**: `SMTP_PASS`
- **Valor actual**: La contraseña de aplicación antigua
- **Valor nuevo**: La contraseña de aplicación de 16 caracteres que copiaste en el PASO 1
- **Acción**: 
  - Haz clic en el ✏️ (lápiz) para editarla
  - Pega la nueva contraseña de aplicación

#### Variables Adicionales (Verificar que existan)
Asegúrate de que estas variables también estén configuradas:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

Si no existen, créalas con los valores mostrados arriba.

### 2.4. Guardar Cambios
1. Después de actualizar cada variable, haz clic en **"Save" o "✓"**
2. Las variables se guardan automáticamente en Railway

---

## 🔄 PASO 3: Redeploy del Servicio

### Opción A: Redeploy Automático (Recomendado)
1. Railway detecta los cambios en variables automáticamente
2. Verifica en la pestaña **"Deployments"**
3. Deberías ver un nuevo deployment iniciándose automáticamente
4. Espera a que termine (puede tomar 2-5 minutos)

### Opción B: Redeploy Manual
Si no se redeployea automáticamente:
1. Ve a la pestaña **"Deployments"**
2. Haz clic en el menú de tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine el deployment

---

## ✅ PASO 4: Verificar que Funciona

### 4.1. Verificar Logs
1. En Railway, ve a la pestaña **"Deployments"**
2. Haz clic en el deployment más reciente
3. Ve a la pestaña **"Logs"**
4. Busca mensajes como:
   - ✅ `✅ Correo enviado exitosamente` (cuando funcione)
   - ⚠️ `⚠️ SMTP no configurado` (si falta algo)
   - ❌ `❌ Error de autenticación SMTP` (si las credenciales son incorrectas)

### 4.2. Probar Recuperación de Contraseña
1. Ve a tu frontend: **https://capstone-frontend-wine.vercel.app**
2. Ve a la página de **Login**
3. Haz clic en **"¿Olvidaste tu contraseña?"**
4. Ingresa un email de usuario registrado (ej: `admin@pepsico.cl`)
5. Haz clic en **"Enviar"**

### 4.3. Verificar el Correo
1. Abre: `pepsicomanager@gmail.com`
2. Revisa la **Bandeja de entrada**
3. Busca un correo con asunto: **"Instrucciones para restablecer contraseña"**
4. Si no lo ves, revisa la carpeta **"Spam"**

---

## 🔧 Resumen de Variables a Actualizar en Railway

```
SMTP_HOST=smtp.gmail.com          (Verificar que existe)
SMTP_PORT=587                      (Verificar que existe)
SMTP_USER=pepsicomanager@gmail.com  (ACTUALIZAR este valor)
SMTP_PASS=[tu_contraseña_de_app]   (ACTUALIZAR este valor)
```

---

## 🐛 Solución de Problemas

### ❌ Error: "SMTP no configurado" en los logs
**Solución**:
- Verifica que `SMTP_USER` y `SMTP_PASS` estén en Railway
- Verifica que los valores no tengan espacios al inicio o final
- Haz un redeploy después de actualizar

### ❌ Error: "Error de autenticación SMTP"
**Solución**:
- Verifica que `SMTP_USER` sea exactamente: `pepsicomanager@gmail.com` (sin espacios)
- Verifica que `SMTP_PASS` sea la contraseña de aplicación de 16 caracteres
- Genera una nueva contraseña de aplicación si es necesario
- Haz un redeploy

### 📧 No recibo el correo
**Solución**:
- Revisa la carpeta **Spam** en `pepsicomanager@gmail.com`
- Verifica los logs de Railway para ver si hubo errores
- Espera unos minutos (a veces hay demoras)
- Verifica que el email del usuario esté correctamente escrito

### 🔄 El redeploy no se inicia automáticamente
**Solución**:
1. Ve a Deployments
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine

---

## 📝 Checklist Final

- [ ] Generé la contraseña de aplicación de Gmail (16 caracteres)
- [ ] Actualicé `SMTP_USER` en Railway a: `pepsicomanager@gmail.com`
- [ ] Actualicé `SMTP_PASS` en Railway con la nueva contraseña de aplicación
- [ ] Verifiqué que `SMTP_HOST=smtp.gmail.com` existe
- [ ] Verifiqué que `SMTP_PORT=587` existe
- [ ] Hice redeploy del servicio backend en Railway
- [ ] Esperé a que termine el deployment
- [ ] Probé la recuperación de contraseña
- [ ] Revisé el correo `pepsicomanager@gmail.com` (y Spam)

---

## 🔗 Enlaces Útiles

- **Railway Dashboard**: https://railway.app/
- **Gmail Contraseñas de Aplicación**: https://myaccount.google.com/apppasswords
- **Tu Backend**: https://backend-production-2561.up.railway.app
- **Tu Frontend**: https://capstone-frontend-wine.vercel.app

---

## ⚠️ Recordatorios Importantes

- ✅ **NO uses tu contraseña normal de Gmail**, solo contraseñas de aplicación
- ✅ La contraseña de aplicación se muestra **solo UNA vez**, guárdala bien
- ✅ Las variables en Railway son **seguras** y no se muestran en los logs
- ✅ Después de actualizar variables, siempre haz **redeploy**

---

**¡Después de seguir estos pasos, el sistema de recuperación de contraseña debería funcionar con el nuevo correo!** 🎉

