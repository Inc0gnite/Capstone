# 📧 Guía Paso a Paso: Configurar Gmail para Recuperación de Contraseña

## 🎯 Objetivo
Configurar el correo `pepsicomanager@gmail.com` para que el sistema pueda enviar correos de recuperación de contraseña.

---

## 📋 PASO 1: Activar Verificación en Dos Pasos (Si no está activada)

### 1.1. Ir a la cuenta de Google
1. Abre tu navegador y ve a: **https://myaccount.google.com/**
2. Inicia sesión con: `pepsicomanager@gmail.com`

### 1.2. Activar verificación en dos pasos
1. En el menú lateral izquierdo, haz clic en **"Seguridad"**
2. Busca la sección **"Cómo iniciar sesión en Google"**
3. Busca **"Verificación en dos pasos"**
4. Si dice "Activada" ✅, continúa al PASO 2
5. Si dice "No activada" o un botón "Activar", haz clic y sigue las instrucciones para activarla
   - Puede pedirte verificar con tu teléfono
   - Sigue las instrucciones en pantalla

---

## 🔑 PASO 2: Generar Contraseña de Aplicación

### 2.1. Ir a Contraseñas de Aplicaciones
1. Mientras estás en la página de **Seguridad** de Google
2. Busca la sección **"Verificación en dos pasos"** (la que acabaste de activar)
3. Haz clic en **"Verificación en dos pasos"**
4. Desplázate hacia abajo hasta encontrar **"Contraseñas de aplicaciones"**
5. Haz clic en **"Contraseñas de aplicaciones"**

   **O también puedes ir directamente a:**
   - https://myaccount.google.com/apppasswords

### 2.2. Crear la Contraseña de Aplicación
1. Verás una pantalla que dice **"Generar contraseña de aplicación"**

2. En el campo **"Seleccionar aplicación"**:
   - Elige: **"Correo"**

3. En el campo **"Seleccionar dispositivo"**:
   - Elige: **"Otro (nombre personalizado)"**
   - En el campo de texto que aparece, escribe: **"PepsiCo Flota Sistema"**

4. Haz clic en el botón **"Generar"**

5. **IMPORTANTE**: Google te mostrará una contraseña de 16 caracteres como esta:
   ```
   xxxx xxxx xxxx xxxx
   ```
   - **Copia esta contraseña completa** (los 16 caracteres)
   - Se mostrará **SOLO UNA VEZ**, guárdala de forma segura
   - Puedes copiarla sin espacios o con espacios, ambos funcionan

---

## ⚙️ PASO 3: Configurar el Archivo .env

### 3.1. Ubicar el archivo .env
1. Abre la carpeta del proyecto
2. Ve a la carpeta `backend`
3. Busca el archivo `.env` 
   - Si **NO existe**, créalo (es un archivo nuevo)
   - Si **existe**, ábrelo con un editor de texto (Notepad, VS Code, etc.)

### 3.2. Agregar o Actualizar la Configuración
Abre el archivo `.env` y busca la sección de Email. Debe verse así:

```env
# Email (Nodemailer) - Configuración para Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=pepsicomanager@gmail.com
SMTP_PASS=aquí_pega_tu_contraseña_de_aplicación
```

### 3.3. Completar los Valores
1. **SMTP_USER**: Ya debe estar como `pepsicomanager@gmail.com`
   - Si no está, cámbialo a: `pepsicomanager@gmail.com`

2. **SMTP_PASS**: Aquí pega la contraseña de aplicación de 16 caracteres que copiaste en el PASO 2
   - Reemplaza `aquí_pega_tu_contraseña_de_aplicación` con la contraseña real
   - Ejemplo:
   ```env
   SMTP_PASS=abcd efgh ijkl mnop
   ```
   O sin espacios:
   ```env
   SMTP_PASS=abcdefghijklmnop
   ```

### 3.4. Guardar el Archivo
1. Guarda el archivo `.env`
2. Asegúrate de que el archivo esté en la carpeta `backend/`

---

## 🚀 PASO 4: Reiniciar el Servidor Backend

### 4.1. Detener el Servidor (Si está corriendo)
1. Ve a la terminal donde está corriendo el servidor backend
2. Presiona `Ctrl + C` para detenerlo

### 4.2. Iniciar el Servidor Nuevamente
1. Asegúrate de estar en la carpeta `backend`:
   ```bash
   cd backend
   ```

2. Inicia el servidor:
   ```bash
   npm run dev
   ```
   
   O si usas otro comando:
   ```bash
   npm start
   ```

3. Observa los mensajes en la terminal:
   - ✅ Si ves: `✅ Correo enviado exitosamente` → Todo está bien
   - ⚠️ Si ves: `⚠️ SMTP no configurado` → Revisa el PASO 3
   - ❌ Si ves errores de autenticación → Revisa que la contraseña de aplicación sea correcta

---

## ✅ PASO 5: Probar que Funciona

### 5.1. Iniciar el Sistema de Recuperación
1. Abre tu aplicación en el navegador
2. Ve a la página de **Login**
3. Haz clic en **"¿Olvidaste tu contraseña?"** o **"Recuperar contraseña"**

### 5.2. Solicitar Recuperación
1. Ingresa un email de un usuario que esté registrado en el sistema
2. Haz clic en **"Enviar"** o **"Recuperar"**

### 5.3. Verificar el Correo
1. Abre tu correo: `pepsicomanager@gmail.com`
2. Ve a la **Bandeja de entrada**
3. Busca un correo con el asunto: **"Instrucciones para restablecer contraseña"**
4. Si no lo ves, revisa la carpeta **"Spam"** o **"Correo no deseado"**

### 5.4. Verificar los Logs del Servidor
En la terminal del backend, deberías ver:
```
✅ Correo enviado exitosamente a: [email del usuario]
```

Si ves esto, ¡todo está funcionando correctamente! 🎉

---

## 🔧 Solución de Problemas

### ❌ Error: "SMTP no configurado"
**Problema**: Las variables de entorno no están configuradas  
**Solución**: 
- Verifica que el archivo `.env` esté en la carpeta `backend/`
- Verifica que tenga las líneas `SMTP_USER` y `SMTP_PASS`
- Reinicia el servidor después de hacer cambios

### ❌ Error: "Error de autenticación SMTP"
**Problema**: La contraseña de aplicación es incorrecta  
**Solución**:
- Genera una nueva contraseña de aplicación (PASO 2)
- Actualiza `SMTP_PASS` en el archivo `.env`
- Reinicia el servidor

### ❌ Error: "Connection timeout"
**Problema**: Problemas de conexión a internet o firewall  
**Solución**:
- Verifica tu conexión a internet
- Verifica que el puerto 587 no esté bloqueado
- Intenta desde otra red si es posible

### 📧 No recibo el correo
**Solución**:
- Revisa la carpeta de **Spam**
- Verifica que el email del usuario esté correctamente escrito
- Verifica en los logs del servidor si hubo algún error
- Espera unos minutos (a veces Gmail tiene demoras)

---

## 📝 Resumen Rápido

1. ✅ Activar verificación en 2 pasos en Google
2. ✅ Generar contraseña de aplicación (16 caracteres)
3. ✅ Configurar `.env` con `SMTP_USER` y `SMTP_PASS`
4. ✅ Reiniciar servidor backend
5. ✅ Probar recuperación de contraseña

---

## 💡 Recordatorios Importantes

- ⚠️ **NO uses tu contraseña normal de Gmail**, solo contraseñas de aplicación
- ⚠️ La contraseña de aplicación se muestra **solo una vez**, guárdala bien
- ⚠️ El archivo `.env` **NO debe subirse a GitHub** (debe estar en `.gitignore`)
- ✅ Si pierdes la contraseña de aplicación, simplemente genera una nueva y actualiza el `.env`

---

## 🆘 ¿Necesitas Más Ayuda?

Si sigues teniendo problemas después de seguir estos pasos:

1. Revisa los logs del servidor backend para ver errores específicos
2. Verifica que todas las variables estén escritas correctamente en el `.env`
3. Asegúrate de haber guardado el archivo `.env` después de hacer cambios
4. Verifica que hayas reiniciado el servidor después de cambiar el `.env`

