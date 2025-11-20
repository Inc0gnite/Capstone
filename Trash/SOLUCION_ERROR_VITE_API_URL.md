# 🔧 Solución: Error de URL en VITE_API_URL

## 🚨 Problema Detectado

La URL de la petición está mal concatenada:
```
❌ https://capstone-frontend-wine.vercel.app/backend-production-2561.up.railway.app/api/auth/login
```

En lugar de:
```
✅ https://backend-production-2561.up.railway.app/api/auth/login
```

## 🔍 Causa

La variable de entorno `VITE_API_URL` en Vercel está configurada incorrectamente. Probablemente tiene un valor como:
```
https://capstone-frontend-wine.vercel.app/backend-production-2561.up.railway.app/api
```

Cuando debería ser solo:
```
https://backend-production-2561.up.railway.app/api
```

## ✅ Solución

### Paso 1: Ir a Vercel Dashboard

1. Ve a **https://vercel.com/dashboard**
2. Selecciona tu proyecto: **capstone-frontend-wine** (o el nombre que tenga)

### Paso 2: Actualizar Variable de Entorno

1. Ve a **Settings** → **Environment Variables**
2. Busca la variable `VITE_API_URL`
3. Edítala o elimínala y créala de nuevo
4. Configura el valor correcto:

```
Name: VITE_API_URL
Value: https://backend-production-2561.up.railway.app/api
```

**⚠️ IMPORTANTE:**
- ✅ Incluye `https://` al inicio
- ✅ NO incluyas el dominio del frontend
- ✅ Incluye `/api` al final
- ✅ Sin trailing slash (`/`) después de `/api`

### Paso 3: Verificar Todos los Ambientes

Asegúrate de marcar:
- ✅ **Production**
- ✅ **Preview**
- ✅ **Development**

### Paso 4: Eliminar Variable Incorrecta (Si Existe)

Si tienes múltiples variables `VITE_API_URL`:
1. Elimina TODAS las versiones incorrectas
2. Deja solo UNA con el valor correcto

### Paso 5: Redeploy

1. Ve a **Deployments**
2. Click en **...** (tres puntos) del último deployment
3. Selecciona **"Redeploy"**
4. Espera 1-2 minutos

---

## 🧪 Verificar Corrección

Después del redeploy, abre la consola del navegador (F12) al hacer login. Deberías ver:

```
✅ POST https://backend-production-2561.up.railway.app/api/auth/login
```

En lugar de:
```
❌ POST https://capstone-frontend-wine.vercel.app/backend-production-2561.up.railway.app/api/auth/login
```

---

## 📝 Valores Correctos por Ambientes

### Production (Vercel)
```
VITE_API_URL=https://backend-production-2561.up.railway.app/api
```

### Development (Local)
```
VITE_API_URL=http://localhost:3000/api
```

### Preview (Pull Requests)
```
VITE_API_URL=https://backend-production-2561.up.railway.app/api
```

---

## ✅ Verificación Final

1. **Backend funcional:** `https://backend-production-2561.up.railway.app/health`
2. **Frontend conectado:** Login exitoso sin errores
3. **URLs correctas:** No hay concatenaciones raras

---

**Después de corregir esta variable y hacer redeploy, debería funcionar perfectamente!** ✅



