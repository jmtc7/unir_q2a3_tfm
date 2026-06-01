# Módulo de Validación del JSON

> **Autor**: Efrel Armando López Cáceres
> **Estado**: Diseño (pendiente de implementación en n8n)
> **Posición en el workflow**: Entre la **Ingesta Documental** (salida del agente extractor) y el **Análisis Documental** (entrada del agente que consulta el manual).

---

## 1. Propósito

El módulo de **Validación del JSON** actúa como un *gate* de calidad entre el agente de Ingesta (que extrae datos desde PDFs, formularios o fotos manuscritas) y el agente de Análisis Documental (que consulta el manual para proponer acciones). Su objetivo es **rechazar o sanear** datos que no cumplan el contrato esperado, evitando que el LLM analice información inválida y genere recomendaciones erróneas.

Sin validación: *garbage in → garbage out*. El agente de Análisis podría recomendar acciones sobre valores irreales (presiones negativas, fechas malformadas, señales eléctricas con valores fuera de `{0, 1}`).

---

## 2. Contrato esperado

### 2.1. JSON Schema (Draft-07)

Schema formal derivado de `datos/ejemplo_incidencia.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ReporteIncidenciaMetroPT3",
  "type": "object",
  "required": ["fecha", "maquina", "operario", "descripcion", "variables"],
  "additionalProperties": false,
  "properties": {
    "fecha": {
      "type": "string",
      "format": "date",
      "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
      "description": "Fecha del reporte en formato AAAA-MM-DD."
    },
    "maquina": {
      "type": "string",
      "minLength": 1,
      "description": "Nombre o identificador de la máquina (ej: MetroPT3)."
    },
    "operario": {
      "type": "string",
      "minLength": 1,
      "description": "Nombre completo del operario que reporta la incidencia."
    },
    "descripcion": {
      "type": "string",
      "minLength": 1,
      "description": "Descripción libre del problema observado."
    },
    "variables": {
      "type": "object",
      "required": ["presiones", "senales_electricas", "corriente_motor", "temperatura_aceite"],
      "additionalProperties": false,
      "properties": {
        "presiones": {
          "type": "object",
          "required": ["tp2", "tp3", "h1", "dv", "r"],
          "additionalProperties": false,
          "properties": {
            "tp2": { "type": "number", "minimum": -1, "maximum": 20 },
            "tp3": { "type": "number", "minimum": -1, "maximum": 20 },
            "h1":  { "type": "number", "minimum": -1, "maximum": 20 },
            "dv":  { "type": "number", "minimum": -1, "maximum": 20 },
            "r":   { "type": "number", "minimum": -1, "maximum": 20 }
          }
        },
        "senales_electricas": {
          "type": "object",
          "required": ["comp", "dv_electric", "towers", "mpg", "lps", "pressure_switch", "oil_level"],
          "additionalProperties": false,
          "properties": {
            "comp":            { "type": "integer", "enum": [0, 1] },
            "dv_electric":     { "type": "integer", "enum": [0, 1] },
            "towers":          { "type": "integer", "enum": [0, 1] },
            "mpg":             { "type": "integer", "enum": [0, 1] },
            "lps":             { "type": "integer", "enum": [0, 1] },
            "pressure_switch": { "type": "integer", "enum": [0, 1] },
            "oil_level":       { "type": "integer", "enum": [0, 1] }
          }
        },
        "corriente_motor": { "type": "number", "minimum": -1, "maximum": 20 },
        "temperatura_aceite": { "type": "number", "minimum": -1, "maximum": 150 }
      }
    }
  }
}
```

### 2.2. Convención de valores faltantes

Heredada del prompt del agente extractor (ver nodo *Generar JSON a partir del texto* en `OpsInsight.json`):

| Tipo de campo | Valor cuando falta |
| --- | --- |
| Cadenas de texto | `""` (cadena vacía) |
| Números (presiones, corriente, temperatura) | `-1` |
| Señales eléctricas (booleanos como int) | `false` ó `0` |

Por eso los rangos de las presiones y corriente arrancan en `-1` y no en `0`: `-1` es el valor centinela que indica "no extraído del documento", no un valor físico real.

---

## 3. Reglas de validación

Las dividimos en tres niveles, de menor a mayor complejidad. Cada nivel se aplica solo si el anterior pasa.

### 3.1. Validación estructural (Nivel 1 — bloqueante)

Comprueba que el JSON cumple el schema de la sección 2.1:

- Todos los campos requeridos están presentes.
- Los tipos son correctos (`number`, `integer`, `string`).
- Las señales eléctricas están en `{0, 1}`.
- La fecha matchea el patrón `AAAA-MM-DD`.
- No hay propiedades extra (`additionalProperties: false`).

**Si falla**: el JSON se rechaza y se devuelve un error con la lista de violaciones. **No pasa al agente de Análisis.**

### 3.2. Validación semántica/física (Nivel 2 — bloqueante)

Comprueba que los valores numéricos están en rangos físicamente posibles para esta máquina, según el `manual_MetroPT3.md`:

| Variable | Rango razonable | Justificación (del manual) |
| --- | --- | --- |
| `tp2`, `tp3`, `h1`, `dv`, `r` | `0 ≤ x ≤ 20` bar (excepto `-1` centinela) | Presiones de aire industrial; el manual menciona umbrales en 7 bar (LPS) y 8.2 bar (MPG/APU). |
| `corriente_motor` | `0 ≤ x ≤ 15` A (excepto `-1` centinela) | Valores normales: 0 (apagado), 4 (sin carga), 7 (bajo carga), 9 (arranque). Margen de seguridad hasta 15A. |
| `temperatura_aceite` | `-10 ≤ x ≤ 120` °C (excepto `-1` centinela) | Rango típico de aceite hidráulico/compresor; el manual no fija límites pero por encima de 120°C indicaría falla térmica grave. |
| `fecha` | Fecha válida (calendario real) y `≤ hoy` | No tiene sentido un reporte futuro. |

**Si falla**: rechazar con código `OUT_OF_RANGE` y campo culpable. Mismo destino que Nivel 1.

### 3.3. Validación de consistencia cruzada (Nivel 3 — advertencia, no bloqueante)

Comprueba relaciones entre campos según las **Condiciones de Operación Normales** del manual. Estas no rechazan el JSON, pero **generan warnings que se propagan al agente de Análisis** para que las considere en su diagnóstico.

| Regla | Origen en el manual |
| --- | --- |
| Si `dv_electric == 1` (bajo carga) entonces `dv ≈ 0` esperado | "DV debe ser 0 bar cuando el compresor opera bajo carga" |
| Si `dv_electric == 1` entonces `corriente_motor` esperada entre 6 y 8 A | "7 amperios cuando opera bajo carga" |
| Si `dv_electric == 0` y `corriente_motor > 0` entonces esperada entre 3 y 5 A | "4 amperios sin carga" |
| `r` debe ser cercana a `tp3` (diferencia esperada `< 2 bar`) | "R debe de ser cercana a la TP3" |
| Si `tp3 < 7` entonces `lps == 1` esperado | "LPS se enciende si la presión es inferior a 7 bar" |
| Si `tp3 < 8.2` entonces `mpg == 1` esperado | "MPG: cuando presión < 8.2 bar, activa COMP" |
| Si `oil_level == 1` siempre warning de mantenimiento | "Se enciende si el nivel de aceite está por debajo del esperado" |

**Salida del nivel 3**: añadir un campo `warnings: string[]` al JSON antes de pasarlo al agente. Ejemplo:

```json
{
  "...": "...",
  "warnings": [
    "tp3=10.9 está por debajo de 8.2 bar pero MPG=0 (esperado 1).",
    "oil_level=1: nivel de aceite bajo, considerar mantenimiento preventivo."
  ]
}
```

---

## 4. Comportamiento ante fallo

| Resultado | HTTP / n8n equivalente | Destino del item |
| --- | --- | --- |
| **OK sin warnings** | success | Pasa al agente de Análisis. |
| **OK con warnings** (Nivel 3) | success | Pasa al agente de Análisis con campo `warnings` agregado. |
| **Error estructural** (Nivel 1) | error 400 | Se desvía a un nodo de "JSON rechazado" + log a CSV/tabla `incidencias_invalidas`. NO pasa al agente. |
| **Error físico** (Nivel 2) | error 422 | Igual que Nivel 1 pero con código distinto. |

Esto permite que el equipo después haga analítica sobre la **calidad de la extracción** del agente de Ingesta (qué % de JSONs son válidos, en qué campos falla más).

---

## 5. Implementación en n8n

### 5.1. Nodos propuestos

```
[Ingesta → JSON crudo]
        ↓
[1. Validate Schema]  ← Code node con ajv
        ↓ ok
[2. Validate Ranges]  ← Code node con reglas físicas
        ↓ ok
[3. Cross-Check]      ← Code node que añade warnings
        ↓
[→ Análisis Documental]

        ↓ fallo en 1 o 2
[Log Rejected]        ← Code node + Insert a tabla incidencias_invalidas (MySQL)
```

### 5.2. Librería para Schema

n8n soporta `npm` packages en Code nodes con la variable de entorno `NODE_FUNCTION_ALLOW_EXTERNAL=ajv` (o `*` para permitir todos). **Hay que pedirle al equipo agregar esta env var al `docker-compose.yaml` cuando Victor suba la nueva versión**:

```yaml
n8n:
  environment:
    - NODE_FUNCTION_ALLOW_EXTERNAL=ajv,ajv-formats
```

Alternativa sin dependencias externas: validación manual con `if/typeof/Object.keys` dentro del Code node. Más verboso pero zero-deps.

### 5.3. Salida del módulo (contrato hacia el siguiente nodo)

```json
{
  "valid": true,
  "level1_pass": true,
  "level2_pass": true,
  "warnings": ["..."],
  "data": { /* JSON original o saneado */ }
}
```

Si `valid: false`, agregar:

```json
{
  "valid": false,
  "errors": [
    { "field": "variables.presiones.tp2", "code": "OUT_OF_RANGE", "message": "..." }
  ]
}
```

---

## 6. Test cases mínimos

Antes de marcar este módulo como completado, debe pasar estos casos (idealmente como JSONs de fixture en `datos/test/validacion/`):

| Caso | Input | Resultado esperado |
| --- | --- | --- |
| `caso_ok.json` | `ejemplo_incidencia.json` literal | `valid: true`, sin warnings |
| `caso_falta_campo.json` | igual que ok pero sin `operario` | `valid: false`, error en `operario` |
| `caso_tipo_malo.json` | `tp2: "12.4"` (string en vez de number) | `valid: false`, error de tipo |
| `caso_rango_malo.json` | `tp2: 999` | `valid: false`, Nivel 2 falla |
| `caso_fecha_futura.json` | `fecha: "2099-12-31"` | `valid: false`, Nivel 2 falla |
| `caso_inconsistente.json` | `dv_electric: 1` y `dv: 5.0` | `valid: true` con warning de inconsistencia |
| `caso_oil_low.json` | `oil_level: 1` | `valid: true` con warning de mantenimiento |

---

## 7. Pendiente / dudas para el equipo

- [ ] Confirmar si `criticidad` (campo nuevo agregado por Victor en el módulo de Análisis) debe estar también validado. **Mi propuesta**: NO, porque ese campo lo genera el agente *después* de la validación, no viene del JSON crudo de Ingesta.
- [ ] Decidir si los warnings se loguean también en MySQL (tabla `incidencias_warnings`) o solo se propagan al agente.
- [ ] Definir el `additionalProperties: false` estricto vs permitir campos extra. Estricto = más limpio pero rompe ante cualquier cambio futuro de schema.
- [ ] Confirmar nombre de tabla para JSONs rechazados (`incidencias_invalidas` es propuesta mía).
