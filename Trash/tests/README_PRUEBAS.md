# Guía de Uso - Plan de Pruebas Excel/CSV

## Sistema de Gestión de Flota PepsiCo Chile

---

## Contenido

Esta carpeta contiene los siguientes archivos CSV para realizar el seguimiento de todas las pruebas del sistema:

1. **Plan_Pruebas_Funcionales.csv** - 57 casos de prueba funcionales (E2E)
2. **Plan_Pruebas_Unitarias.csv** - 30 casos de prueba unitarias
3. **Plan_Pruebas_Integracion.csv** - 20 casos de prueba de integración
4. **Plan_Pruebas_Seguridad.csv** - 25 casos de prueba de seguridad
5. **Plan_Pruebas_Rendimiento.csv** - 15 casos de prueba de rendimiento
6. **Plan_Pruebas_Usabilidad.csv** - 10 tareas de usabilidad con usuarios

**Total: 157 casos de prueba**

---

## Cómo Abrir en Excel

### Opción 1: Abrir Directamente

1. Haz doble clic en cualquier archivo `.csv`
2. Se abrirá automáticamente en Excel
3. Si se ve mal (todo en una columna):
   - Ve a la pestaña "Datos"
   - Selecciona "Texto en columnas"
   - Elige "Delimitado" → Siguiente
   - Marca "Coma" como delimitador → Finalizar

### Opción 2: Importar en Excel

1. Abre Excel
2. Ve a `Archivo` → `Abrir`
3. Selecciona el archivo `.csv`
4. Confirma la importación

### Opción 3: Google Sheets

1. Abre Google Sheets
2. `Archivo` → `Importar`
3. Selecciona el archivo CSV
4. Elige "Coma" como separador
5. Haz clic en "Importar datos"

---

## Estructura de Cada Archivo

### 1. Plan_Pruebas_Funcionales.csv

**Columnas:**
- **ID**: Identificador único (FT-001, FT-002, etc.)
- **Módulo**: Módulo funcional (Autenticación, Gestión de Ingresos, etc.)
- **Caso de Uso**: Referencia al caso de uso del sistema
- **Escenario de Prueba**: Descripción del escenario
- **Prioridad**: Crítica / Alta / Media / Baja
- **Precondiciones**: Estado requerido antes de la prueba
- **Pasos de Ejecución**: Pasos detallados para ejecutar la prueba
- **Resultado Esperado**: Lo que debe ocurrir si funciona correctamente
- **Resultado Obtenido**: Anotar el resultado real al ejecutar
- **Estado**: Pendiente / En Progreso / Pasó / Falló / Bloqueado
- **Evidencias**: Links a capturas de pantalla o videos
- **Comentarios**: Notas adicionales o issues encontrados
- **Tester**: Nombre de quien ejecutó la prueba
- **Fecha Ejecución**: Fecha en que se realizó la prueba

**Total de casos:** 57

### 2. Plan_Pruebas_Unitarias.csv

**Columnas:**
- **ID**: UT-001, UT-002, etc.
- **Componente**: Servicio o clase bajo prueba
- **Método/Función**: Función específica que se prueba
- **Caso de Prueba**: Descripción
- **Input**: Parámetros de entrada
- **Resultado Esperado**: Output esperado
- **Resultado Obtenido**: Output real
- **Estado**: Pendiente / Pasó / Falló
- **Cobertura %**: Porcentaje de cobertura del componente
- **Tester**: Desarrollador responsable
- **Fecha**: Fecha de ejecución

**Total de casos:** 30

### 3. Plan_Pruebas_Integracion.csv

**Columnas:**
- **ID**: IT-001, IT-002, etc.
- **Integración**: Componentes que se integran
- **Caso de Prueba**: Descripción
- **Endpoint/Flujo**: API endpoint o flujo específico
- **Resultado Esperado**: Comportamiento esperado
- **Resultado Obtenido**: Resultado real
- **Estado**: Pendiente / Pasó / Falló
- **Tiempo Respuesta**: Tiempo medido (objetivo vs real)
- **Tester**: Responsable
- **Fecha**: Fecha de ejecución

**Total de casos:** 20

### 4. Plan_Pruebas_Seguridad.csv

**Columnas:**
- **ID**: ST-001, ST-002, etc.
- **Categoría**: Tipo de vulnerabilidad (Autenticación, XSS, SQL Injection, etc.)
- **Caso de Prueba**: Descripción del test
- **Método de Ataque**: Técnica utilizada para probar
- **Resultado Esperado**: Cómo debe protegerse el sistema
- **Resultado Obtenido**: Resultado real
- **Severidad**: Crítica / Alta / Media / Baja
- **Estado**: Pendiente / Pasó / Falló / Requiere Fix
- **Tester**: Security tester responsable
- **Fecha**: Fecha de la prueba

**Total de casos:** 25

### 5. Plan_Pruebas_Rendimiento.csv

**Columnas:**
- **ID**: PT-001, PT-002, etc.
- **Escenario**: Tipo de prueba (Carga Normal, Pico, Estrés, etc.)
- **Endpoint/Flujo**: Endpoint o flujo bajo prueba
- **Usuarios Concurrentes**: Cantidad de usuarios simulados
- **Duración**: Tiempo de la prueba
- **Requests Totales**: Total de peticiones generadas
- **Objetivo Tiempo**: Tiempo de respuesta objetivo
- **Tiempo Obtenido**: Tiempo real medido
- **Tasa Error %**: Porcentaje de errores
- **Estado**: Pendiente / Pasó / Falló
- **Tester**: Responsable
- **Fecha**: Fecha de ejecución

**Total de casos:** 15

### 6. Plan_Pruebas_Usabilidad.csv

**Columnas:**
- **ID**: UST-001, UST-002, etc.
- **Tarea**: Tarea que debe completar el usuario
- **Actor/Participante**: Rol del usuario real
- **Tiempo Objetivo**: Tiempo esperado
- **Tiempo Real**: Tiempo real medido
- **Pasos Completados**: Número de pasos completados
- **Errores**: Cantidad de errores cometidos
- **Éxito (Sí/No)**: Si completó la tarea
- **Satisfacción (1-5)**: Puntuación de satisfacción
- **Comentarios**: Feedback del usuario
- **Fecha**: Fecha de la sesión

**Total de casos:** 10

---

## Cómo Usar los Archivos

### Para Testers

1. **Selecciona el archivo** según el tipo de prueba que vas a realizar
2. **Filtra por estado** "Pendiente" para ver qué falta
3. **Durante la prueba:**
   - Lee las precondiciones y pasos de ejecución
   - Ejecuta la prueba paso a paso
   - Anota el resultado obtenido
   - Cambia el estado a "Pasó", "Falló" o "Bloqueado"
   - Agrega capturas de pantalla/videos en la columna Evidencias
   - Escribe comentarios si hay issues
4. **Reporta defectos:**
   - Si falla, crea un issue en GitHub
   - Referencia el ID de la prueba (ej: FT-030)
   - Enlaza el issue en la columna Comentarios

### Para QA Lead

1. **Monitorea el progreso** con filtros de estado
2. **Genera reportes:**
   - Cuenta total de casos por estado
   - Calcula porcentaje de éxito: (Pasó / Total) × 100
   - Identifica módulos con más fallos
3. **Usa Tablas Dinámicas** para análisis:
   - Estado por Módulo
   - Estado por Tester
   - Estado por Prioridad
4. **Actualiza el dashboard** del proyecto

### Para Product Owner

1. **Revisa casos críticos primero** (filtro por Prioridad = "Crítica")
2. **Valida criterios de aceptación** en Resultado Esperado
3. **Aprueba funcionalidades** cuando todos los casos críticos pasan

---

## Estados Disponibles

| Estado | Significado |
|--------|-------------|
| **Pendiente** | No se ha ejecutado aún |
| **En Progreso** | Se está ejecutando actualmente |
| **Pasó** | Prueba exitosa, resultado esperado obtenido |
| **Falló** | Prueba falló, resultado diferente al esperado |
| **Bloqueado** | No se puede ejecutar (depende de otra funcionalidad) |
| **N/A** | No aplica en este contexto |

---

## Consejos y Buenas Prácticas

### Durante la Ejecución

1. **Documenta todo**: Captura de pantalla de cada paso crítico
2. **Sé específico en comentarios**: No escribas "No funciona", describe qué pasó exactamente
3. **Reproduce antes de reportar**: Ejecuta 2-3 veces si falla
4. **Verifica precondiciones**: Asegúrate de que el ambiente está correcto

### Organización

1. **Nombra evidencias consistentemente**: `FT-030_pantalla_crear_ot.png`
2. **Guarda evidencias en carpeta**: `tests/evidencias/`
3. **Usa control de versiones**: Guarda una copia del archivo cada viernes
4. **Sincroniza con el equipo**: Si varios testers trabajan, usa Google Sheets compartido

### Reportes

**Reporte Diario:**
```
Tests ejecutados hoy: X
Pasaron: Y
Fallaron: Z
Bloqueados: W
```

**Reporte Semanal:**
```
Total ejecutados: X/157 (XX%)
Tasa de éxito: XX%
Defectos críticos encontrados: X
Defectos resueltos: X
```

---

## Integración con Otras Herramientas

### GitHub Issues

Cuando un caso falla:
1. Crea issue con título: `[BUG] FT-030 - No se puede crear OT sin descripción`
2. Usa el template de bug
3. Referencia el caso de prueba
4. Agrega labels: `bug`, `critical` (según severidad), `testing`

### Excel/Sheets - Fórmulas Útiles

**Contar casos por estado:**
```excel
=COUNTIF(J:J, "Pasó")
=COUNTIF(J:J, "Falló")
=COUNTIF(J:J, "Pendiente")
```

**Calcular porcentaje de éxito:**
```excel
=COUNTIF(J:J, "Pasó") / COUNTA(J:J) * 100
```

**Casos críticos pendientes:**
```excel
=COUNTIFS(E:E, "Crítica", J:J, "Pendiente")
```

---

## Archivos Adicionales Recomendados

Puedes crear archivos complementarios:

1. **Matriz_Trazabilidad.xlsx**: Mapea cada caso de prueba con requerimientos
2. **Defectos_Encontrados.xlsx**: Lista consolidada de bugs
3. **Reporte_Cobertura.xlsx**: Analiza qué funcionalidades están cubiertas

---

## Cronograma Sugerido

### Sprint 1-2: Pruebas Unitarias
- Ejecutar todos los casos de `Plan_Pruebas_Unitarias.csv`
- Objetivo: 80% cobertura Backend, 70% Frontend

### Sprint 3-4: Pruebas de Integración
- Ejecutar `Plan_Pruebas_Integracion.csv`
- Validar todos los endpoints

### Sprint 5-6: Pruebas Funcionales
- Ejecutar `Plan_Pruebas_Funcionales.csv`
- Prioridad: Casos críticos primero

### Sprint 7: Rendimiento y Seguridad
- Ejecutar `Plan_Pruebas_Rendimiento.csv`
- Ejecutar `Plan_Pruebas_Seguridad.csv`

### Sprint 8: Regresión
- Re-ejecutar todos los casos que pasaron

### Sprint 9: UAT
- Ejecutar `Plan_Pruebas_Usabilidad.csv` con usuarios reales

---

## Criterios de Aceptación

El sistema será aceptado cuando:

- ✓ 100% de casos críticos: **Pasó**
- ✓ 95% de casos alta prioridad: **Pasó**
- ✓ 90% de casos media prioridad: **Pasó**
- ✓ Cero casos críticos en estado **Falló**
- ✓ Máximo 5 casos alta prioridad en **Falló** (con workaround)

---

## Soporte

Para dudas sobre el plan de pruebas:
- **QA Lead**: [Email]
- **Tech Lead**: [Email]
- **Documentación completa**: `Contexto proyecto/analisis-diseño/Plan_de_Pruebas_Detallado.md`

---

**Última actualización:** 15/10/2025  
**Versión:** 1.0  
**Responsables:** Joaquín Marín, Benjamin Vilches

