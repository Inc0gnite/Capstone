# ⚡ Comandos Rápidos para Subir a GitHub

## 🔄 Si ya tienes Git inicializado

```bash
# Verificar estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "feat: preparar proyecto para deployment"

# Subir a GitHub
git push origin main
```

## 🆕 Si es la primera vez

### 1. Inicializar Git
```bash
git init
git branch -M main
```

### 2. Agregar remoto de GitHub
```bash
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/pepsico-fleet-management.git
```

### 3. Primera subida
```bash
git add .
git commit -m "Initial commit: Plataforma de Gestión de Flota PepsiCo"
git push -u origin main
```

## ✅ Verificar antes de subir

```bash
# Ver qué se va a subir (debe mostrar solo código, NO .env ni node_modules)
git status

# Ver archivos que se ignorarán (deben aparecer .env y node_modules)
git status --ignored
```

## 🚨 IMPORTANTE: Antes de hacer push

1. ✅ Verifica que NO haya archivos `.env` en `git status`
2. ✅ Verifica que NO haya `node_modules/` en `git status`
3. ✅ Verifica que NO haya `backend/prisma/dev.db` en `git status`

Si ves alguno de estos archivos, tu `.gitignore` no está funcionando. Revisa la guía completa en `GUIA_GITHUB_DEPLOYMENT.md`

