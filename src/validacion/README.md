# Validación de Reportes de Incidencia

Módulo de **validación** de los reportes de incidencia de la máquina MetroPT-3, parte del componente de **validación y monitorización** de OpsInsight. Valida el JSON generado por el agente de ingesta **antes** de registrarlo en la base de datos y proponer una acción.

La lógica vive en una **función JavaScript pura y testeada** ([`validador.js`](validador.js)) que se inyecta en un **nodo `Code` de n8n** mediante un script de _build_, de modo que el código probado y el del _workflow_ nunca diverjan.

## Las dos capas de validación

### Capa 1 — Estructural (bloqueante)
Comprueba que el reporte sea utilizable. Si falla, `valido = false` y **el flujo no debe continuar** (no tiene sentido analizar datos malformados).

- Campos de texto obligatorios y no vacíos: `fecha`, `maquina`, `operario`, `descripcion`.
- Bloque `variables` con `presiones`, `senales_electricas`, `corriente_motor`, `temperatura_aceite`.
- **Presiones** (`tp2`, `tp3`, `h1`, `dv`, `r`): numéricas y ≥ 0.
- **Señales eléctricas** (`comp`, `dv_electric`, `towers`, `mpg`, `lps`, `pressure_switch`, `oil_level`): binarias (0 o 1).
- **Corriente del motor**: numérica y ≥ 0. **Temperatura del aceite**: numérica.

### Capa 2 — Semántica (informativa)
Detecta **inconsistencias** de coherencia derivadas del [manual MetroPT-3](../../datos/manual_MetroPT3.md). No bloquean el flujo: se registran como **alertas** (útiles para el dashboard). Cada una lleva `codigo`, `mensaje` y `severidad` (`alta` | `media` | `baja`).

| Código | Regla (justificación en el manual) | Severidad |
| :--- | :--- | :--- |
| `COMP_DV_ELECTRIC` | `COMP` (sin carga) y `DV_Electric` (bajo carga) no pueden estar ambas activas. | media |
| `DV_BAJO_CARGA` | Bajo carga (`dv_electric=1`), la presión `DV` debe ser ~0 bar. | media |
| `R_LEJOS_TP3` | La presión del depósito `R` debe ser cercana a `TP3`; si difiere mucho → posible fuga/lectura errónea. | alta |
| `LPS_INCOHERENTE` | `LPS` se enciende **si y solo si** la presión `R` < 7 bar. | media |
| `CORRIENTE_FUERA_RANGO` | La corriente del motor debe estar cerca de los valores nominales {0, 4, 7, 9} A. | baja |

Los umbrales (tolerancias) están centralizados y son ajustables en `UMBRALES`, dentro de [`validador.js`](validador.js).

## Resultado devuelto

```jsonc
{
  "valido": true,            // false si hay errores estructurales
  "errores": [               // capa 1 (vacío si valido=true)
    { "campo": "variables.presiones.tp2", "mensaje": "..." }
  ],
  "inconsistencias": [       // capa 2
    { "codigo": "R_LEJOS_TP3", "mensaje": "...", "severidad": "alta" }
  ]
}
```

## Desarrollo (TDD)

```bash
cd src/validacion
node --test          # ejecuta validador.test.js (sin dependencias externas)
```

## Generar el nodo de n8n

```bash
node build-n8n.js    # genera nodo_n8n_validacion.js desde validador.js
```

Copiar el contenido de `nodo_n8n_validacion.js` en un nodo **`Code`** de n8n en modo **_Run Once for Each Item_**. El nodo recibe el reporte en `$json` y lo devuelve intacto añadiendo el resultado en `_validacion`.

> ⚠️ `nodo_n8n_validacion.js` es **autogenerado**: no editarlo a mano. La fuente de verdad es `validador.js`.

## Integración en el workflow

Ya integrado en [`../Workflow_RAG.json`](../Workflow_RAG.json) mediante el script idempotente
[`integrar_en_workflow.js`](integrar_en_workflow.js). Inserta tres nodos entre **Edit Fields** y
**Code in JavaScript** (donde el JSON del reporte aún conserva su estructura completa):

```
Edit Fields → [Validar incidencia] → [¿Reporte válido?] ─ true ─→ Code in JavaScript → AI Agent → … → MySQL
                                                         └ false ─→ [Reporte inválido]  (Stop and Error)
```

- **Validar incidencia** (`Code`): ejecuta `validarIncidencia($json)` y añade `_validacion` al item.
- **¿Reporte válido?** (`IF`): ramifica según `{{ $json._validacion.valido }}`.
- **Reporte inválido** (`Stop and Error`): detiene la ejecución mostrando los errores estructurales.

Para regenerar la integración tras un cambio en las reglas:

```bash
node build-n8n.js && node integrar_en_workflow.js
```

> El original está versionado en git; para revertir la integración: `git checkout src/Workflow_RAG.json`.

### Pendiente (parte de monitorización)
Tras **Code in JavaScript** y el **AI Agent**, el item se reemplaza por `query_texto` y luego por la salida
del agente, de modo que `_validacion.inconsistencias` **no llega** a `Prepare register`. Para registrar las
inconsistencias como **alertas** en el dashboard hay que referenciarlas en `Prepare register` con
`{{ $('Validar incidencia').item.json._validacion.inconsistencias }}` y añadir su columna en MySQL
(coordinar el esquema con el resto del equipo).
