# Solución: Error de package-lock.json desincronizado

## Problema
Railway/Railpack está ejecutando `npm ci` que requiere un `package-lock.json` sincronizado con `package.json`. El error indica que faltan dependencias de `xlsx` en el lock file.

## Solución Temporal
Si el build falla en Railway, necesitas regenerar el `package-lock.json` localmente:

```bash
# En la raíz del proyecto
npm install

# Esto regenerará el package-lock.json con todas las dependencias
# Luego hacer commit y push:
git add package-lock.json
git commit -m "fix: Regenerar package-lock.json con todas las dependencias"
git push
```

## Solución Permanente
Para evitar este problema en el futuro:

1. **Siempre ejecutar `npm install` después de agregar dependencias:**
   ```bash
   npm install
   git add package.json package-lock.json
   git commit -m "feat: Agregar nueva dependencia"
   git push
   ```

2. **No editar manualmente `package-lock.json`** - siempre dejar que npm lo regenere.

3. **Verificar sincronización antes de commit:**
   ```bash
   npm install --dry-run
   ```

## Nota sobre Railpack
Railpack ejecuta `npm ci` automáticamente y no respeta `railway.json`. Por lo tanto, es **crítico** tener un `package-lock.json` válido y sincronizado.

