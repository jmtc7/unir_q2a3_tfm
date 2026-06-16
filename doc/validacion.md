# Módulo de Validación del JSON

> **Autor**: Efrel Armando López Cáceres
> **Estado**: Implementado y probado en producción
> **Rama**: `efli9/validacion-monitorizacion`
> **Posición en el workflow**: Entre la **Ingesta Documental** y el **Análisis Documental**, actúa como *gate* de calidad antes del AI Agent.

---

## 1. Propósito

El módulo de **Validación del JSON** garantiza que el reporte de incidencia extraído por el agente de ingesta (desde PDF, formulario online o foto manuscrita) sea estructuralmente correcto y semánticamente coherente **antes** de pasarlo al agente de Análisis Documental (RAG + LLM).

Sin validación: *garbage in → garbage out*. El LLM analizaría datos inválidos y generaría recomendaciones sin sentido.

Con validación: los errores se detectan y registran con trazabilidad en la BD, permitiendo analítica sobre la calidad del proceso de ingesta.

---

## 2. Arquitectura

```
[Ingesta → JSON]
      ↓
[Validar incidencia]  ← Code node (src/validacion/nodo_n8n_validacion.js)
      ↓
[¿Reporte válido?]   ← IF node ($json._validacion.valido)
      ↓ true                          ↓ false
[Análisis Documental]     [Reporte inválido] → [Registrar error validacion]
(AI Agent + RAG)                                       ↓
                                               MySQL (validacion_ok=0)
                                                       ↓
                                               Grafana (visible en dashboard)
```

Los tres nodos están en la zona **"Validación del JSON"** del workflow `OpsInsight.json`.

---

## 3. Dos capas de validación

### 3.1. Capa 1 — Estructural (bloqueante)

Verifica que el JSON sea utilizable. Si falla, `valido: false` y el flujo **no continúa al agente**.

| Comprobación | Detalle |
| :--- | :--- |
| Campos obligatorios | `fecha`, `maquina`, `operario`, `descripcion` no vacíos |
| Bloque `variables` completo | `presiones`, `senales_electricas`, `corriente_motor`, `temperatura_aceite` |
| Presiones | `tp2`, `tp3`, `h1`, `dv`, `r` — numéricas y ≥ 0 |
| Señales eléctricas | `comp`, `dv_electric`, `towers`, `mpg`, `lps`, `pressure_switch`, `oil_level` — binarias (0 o 1) |
| Corriente | Numérica y ≥ 0 |
| Temperatura | Numérica |

### 3.2. Capa 2 — Semántica (informativa, no bloqueante)

Detecta **inconsistencias de coherencia** derivadas del `manual_MetroPT3.md`. El reporte pasa igualmente al agente, pero las alertas se almacenan en la BD y aparecen en Grafana.

| Código | Regla | Base en el manual | Severidad |
| :--- | :--- | :--- | :--- |
| `COMP_DV_ELECTRIC` | `COMP` (sin carga) y `DV_Electric` (bajo carga) no pueden estar ambas activas | "Son estados mutuamente excluyentes" | media |
| `DV_BAJO_CARGA` | Si `dv_electric=1`, la presión `DV` debe ser ~0 bar | "DV debe ser 0 bar cuando opera bajo carga" | media |
| `R_LEJOS_TP3` | La presión del depósito `R` debe ser cercana a `TP3` | "R debe ser cercana a la TP3" | **alta** |
| `LPS_INCOHERENTE` | `LPS=1` ⟺ `R < 7 bar` | "LPS se enciende si la presión es inferior a 7 bar" | media |
| `CORRIENTE_FUERA_RANGO` | Corriente del motor cerca de valores nominales {0, 4, 7, 9} A | Valores normales de operación del manual | baja |

---

## 4. Resultado devuelto

```jsonc
{
  "valido": true,              // false si hay errores estructurales
  "errores": [                 // solo si valido=false
    { "campo": "variables.presiones.tp2", "mensaje": "..." }
  ],
  "inconsistencias": [         // siempre, vacío si no hay alertas
    { "codigo": "R_LEJOS_TP3", "mensaje": "...", "severidad": "alta" }
  ]
}
```

---

## 5. Implementación

### Código fuente

| Archivo | Descripción |
| :--- | :--- |
| `src/validacion/validador.js` | Función pura `validarIncidencia(json)` — fuente de verdad |
| `src/validacion/validador.test.js` | 19 tests con `node:test` (cero dependencias externas) |
| `src/validacion/nodo_n8n_validacion.js` | Snippet autogenerado para el nodo Code de n8n |
| `src/validacion/build-n8n.js` | Genera el snippet desde `validador.js` (fuente única de verdad) |

### Ejecutar los tests

```bash
cd src/validacion
node --test
# ✔ 19 tests passed
```

### Regenerar el nodo de n8n tras cambiar reglas

```bash
cd src/validacion
node build-n8n.js   # regenera nodo_n8n_validacion.js
```

---

## 6. Persistencia en base de datos

Las columnas de validación se añadieron a la tabla `registro_incidencias` (ver `db/schema.sql`):

| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `validacion_ok` | `TINYINT(1) DEFAULT 1` | 1 = válido estructuralmente, 0 = inválido |
| `alertas_validacion` | `TEXT DEFAULT NULL` | JSON con las inconsistencias semánticas detectadas |

Los reportes con **errores estructurales** se registran igualmente con `validacion_ok=0` y `criticidad='ERROR'`, para que el dashboard refleje la tasa de fallos de ingesta.

---

## 7. Dashboard de monitorización

El dashboard Grafana en `localhost:3000` (credenciales: `admin/admin`) incluye:

| Panel | Muestra |
| :--- | :--- |
| Reportes con Validación OK | % de reportes que pasaron la validación estructural |
| Alertas Semánticas Detectadas | Frecuencia de cada código de inconsistencia |
| Registro de Incidencias | Columna `validacion` coloreada: ✓ OK (verde) / ✗ Error (rojo) |

Auto-provisionado: arranca sin configuración manual al ejecutar `docker compose up -d grafana`.

---

## 8. Umbrales configurables

Todos los umbrales semánticos están centralizados en `UMBRALES` dentro de `src/validacion/validador.js`:

```javascript
export const UMBRALES = {
  DV_MAX_BAJO_CARGA: 0.5,      // bar máximo permitido en DV bajo carga
  R_TP3_TOLERANCIA: 1.5,       // diferencia máxima |R - TP3| en bar
  PRESION_UMBRAL_LPS: 7,       // bar — umbral de activación de LPS
  CORRIENTE_NOMINALES: [0, 4, 7, 9],  // A — valores nominales del motor
  CORRIENTE_TOLERANCIA: 1.5,   // A — tolerancia para "cercano a nominal"
};
```
