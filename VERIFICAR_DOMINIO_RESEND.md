# 🌐 Guía: Verificar Dominio en Resend

## 🎯 Objetivo
Verificar tu dominio en Resend para poder enviar correos a **cualquier destinatario**, no solo a tu email de registro.

---

## 📋 PRE-REQUISITOS

Antes de empezar, necesitas:

1. ✅ Cuenta en Resend (ya la tienes)
2. ✅ Un dominio propio (ejemplo: `pepsico.cl`, `midominio.com`, etc.)
3. ✅ Acceso al panel de DNS de tu dominio (donde compraste el dominio)

**⚠️ IMPORTANTE**: No puedes verificar `gmail.com`, `yahoo.com`, etc. porque no son tus dominios. Necesitas un dominio que TÚ controles.

---

## 📋 PASO 1: Acceder a Resend Domains

1. Ve a: **https://resend.com/domains**
2. O desde el Dashboard → **"Domains"** en el menú lateral
3. Haz clic en **"Add Domain"** o **"Add"**

---

## 📋 PASO 2: Agregar tu Dominio

1. En el campo de texto, ingresa tu dominio (sin `www` ni `http://`)
   - ✅ Correcto: `pepsico.cl`
   - ✅ Correcto: `miempresa.com`
   - ❌ Incorrecto: `www.pepsico.cl`
   - ❌ Incorrecto: `https://pepsico.cl`

2. Haz clic en **"Add"** o **"Continue"**

3. Resend te mostrará una página con **registros DNS** que necesitas agregar

---

## 📋 PASO 3: Obtener Registros DNS

Resend te mostrará algo como esto:

```
Registros DNS a agregar:

Tipo: SPF
Nombre: @ (o tu dominio)
Valor: v=spf1 include:resend.com ~all

Tipo: DKIM
Nombre: resend._domainkey
Valor: [una cadena larga de caracteres]

Tipo: DMARC (opcional pero recomendado)
Nombre: _dmarc
Valor: v=DMARC1; p=none;
```

**⚠️ IMPORTANTE**: Copia TODOS estos valores. Los necesitarás en el siguiente paso.

---

## 📋 PASO 4: Agregar Registros DNS en tu Proveedor

Este paso depende de dónde compraste/hospedaste tu dominio. Los proveedores comunes son:

### Si tu dominio está en:
- **Cloudflare**
- **GoDaddy**
- **Namecheap**
- **Google Domains**
- **Cualquier otro proveedor de DNS**

### Pasos Generales:

1. **Accede al panel de DNS de tu dominio**
   - Ve al sitio donde compraste tu dominio
   - Busca la sección de **"DNS"**, **"DNS Records"**, o **"Zona DNS"**

2. **Agrega cada registro uno por uno**

#### Registro 1: SPF
- **Tipo**: `TXT` (o `SPF` si está disponible)
- **Nombre/Host**: `@` o `.` (depende del proveedor, algunos usan el dominio completo)
- **Valor**: El valor SPF que Resend te dio (ejemplo: `v=spf1 include:resend.com ~all`)
- **TTL**: `3600` (o el valor por defecto)
- Haz clic en **"Save"** o **"Add Record"**

#### Registro 2: DKIM
- **Tipo**: `TXT`
- **Nombre/Host**: `resend._domainkey` (algunos proveedores requieren el dominio completo: `resend._domainkey.tudominio.com`)
- **Valor**: La cadena larga de DKIM que Resend te dio
- **TTL**: `3600`
- Haz clic en **"Save"**

#### Registro 3: DMARC (Opcional pero recomendado)
- **Tipo**: `TXT`
- **Nombre/Host**: `_dmarc`
- **Valor**: `v=DMARC1; p=none;`
- **TTL**: `3600`
- Haz clic en **"Save"**

---

## 📋 PASO 5: Esperar Propagación DNS

Después de agregar los registros:

1. **Puede tomar de 5 minutos a 48 horas** para que los registros DNS se propaguen
2. Resend verificará automáticamente cuando estén listos
3. Puedes verificar el estado en: **https://resend.com/domains**

**Estado en Resend:**
- 🔴 **Pending** = Esperando verificación
- 🟡 **Verifying** = Verificando
- 🟢 **Verified** = ✅ Verificado y listo para usar

---

## 📋 PASO 6: Verificar Estado

1. Ve a: **https://resend.com/domains**
2. Verás tu dominio con su estado
3. Si dice **"Verified"** ✅, ya puedes usarlo

**Si dice "Failed" o "Pending" por más de 24 horas:**
- Verifica que los registros DNS estén correctos
- Verifica que los valores sean exactos (sin espacios extra)
- Espera un poco más (a veces DNS tarda)

---

## 📋 PASO 7: Actualizar Variables en Railway

Una vez que tu dominio esté verificado:

1. Ve a **Railway Dashboard** → Tu proyecto → Backend → **Variables**

2. Actualiza o crea:

```
RESEND_API_KEY=re_YxmpJL4C_7LEARm1w6AGsdZo5cHjsQVCP
RESEND_FROM_EMAIL=noreply@tu-dominio-verificado.com
```

**Ejemplo:**
- Si verificaste `pepsico.cl`:
  ```
  RESEND_FROM_EMAIL=noreply@pepsico.cl
  ```
  O también puedes usar:
  ```
  RESEND_FROM_EMAIL=support@pepsico.cl
  RESEND_FROM_EMAIL=no-reply@pepsico.cl
  ```

3. Guarda los cambios

4. Railway redeployeará automáticamente

---

## 📋 PASO 8: Probar

1. Intenta recuperar contraseña desde tu aplicación
2. Revisa los logs en Railway
3. Deberías ver: `✅ Correo enviado exitosamente con Resend`
4. El correo llegará desde: `PepsiCo Flota <noreply@tu-dominio.com>`
5. Ahora puedes enviar a **cualquier destinatario** ✅

---

## 🆘 Problemas Comunes

### Problema: "DNS records not found"
**Solución:**
- Verifica que agregaste los registros correctamente
- Espera más tiempo (puede tardar hasta 48 horas)
- Verifica que los valores sean exactos (copiados correctamente)

### Problema: "Invalid DNS record format"
**Solución:**
- Verifica que el tipo de registro sea `TXT`
- Verifica que no haya espacios extra en los valores
- Algunos proveedores requieren que el nombre incluya el dominio completo

### Problema: Dominio sigue "Pending" después de 24 horas
**Solución:**
- Verifica los registros DNS usando herramientas online:
  - https://mxtoolbox.com/spf.aspx (para verificar SPF)
  - https://mxtoolbox.com/dkim.aspx (para verificar DKIM)
- Compara con lo que Resend espera
- Corrige cualquier error y espera de nuevo

---

## 📝 Ejemplo Práctico

### Si tu dominio es `pepsico.cl`:

**En tu proveedor DNS, agregarías:**

```
Registro 1:
Tipo: TXT
Nombre: @
Valor: v=spf1 include:resend.com ~all

Registro 2:
Tipo: TXT
Nombre: resend._domainkey
Valor: [la cadena que Resend te da]

Registro 3:
Tipo: TXT
Nombre: _dmarc
Valor: v=DMARC1; p=none;
```

**Luego en Railway:**
```
RESEND_FROM_EMAIL=noreply@pepsico.cl
```

---

## ✅ Checklist

- [ ] Tienes un dominio propio
- [ ] Acceso al panel DNS de tu dominio
- [ ] Agregaste el dominio en Resend
- [ ] Copiaste los registros DNS que Resend te dio
- [ ] Agregaste los registros SPF, DKIM y DMARC en tu proveedor DNS
- [ ] Esperaste la propagación DNS
- [ ] Verificaste que el dominio está "Verified" en Resend
- [ ] Actualizaste `RESEND_FROM_EMAIL` en Railway con tu dominio
- [ ] Hiciste redeploy en Railway
- [ ] Probaste enviar un correo

---

## 💡 ¿No Tienes Dominio?

Si no tienes un dominio, opciones:

1. **Comprar un dominio** (cuesta alrededor de $10-15/año):
   - Namecheap
   - GoDaddy
   - Google Domains
   - Cloudflare

2. **Usar SendGrid** (no requiere dominio):
   - Puedo ayudarte a implementarlo
   - Funciona inmediatamente

---

## 🎉 Resultado Final

Después de verificar tu dominio:
- ✅ Podrás enviar correos a **cualquier destinatario**
- ✅ El correo llegará desde tu dominio profesional
- ✅ Mejor deliverability (menos spam)
- ✅ Más confiable para usuarios

---

**¿Tienes un dominio que puedas verificar, o prefieres que implemente SendGrid que no requiere dominio?**

