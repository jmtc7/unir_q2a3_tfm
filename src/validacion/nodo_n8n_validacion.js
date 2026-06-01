// ============================================================================
// AUTOGENERADO por build-n8n.js — NO editar a mano.
// Fuente de verdad: src/validacion/validador.js (cubierto por validador.test.js)
// Pegar este contenido en un nodo "Code" de n8n (Run Once for Each Item).
// ============================================================================
// ===========================================================================
// Validador de reportes de incidencia MetroPT-3 (OpsInsight)
// ---------------------------------------------------------------------------
// Función PURA, sin dependencias de n8n: recibe el JSON del reporte y devuelve
// el resultado de la validación. El nodo Code de n8n solo la envuelve.
//
// Resultado:
//   {
//     valido: boolean,                 // false si hay errores estructurales
//     errores: [{ campo, mensaje }],   // capa 1 - estructura/tipos/rangos
//     inconsistencias: [               // capa 2 - coherencia con el manual
//       { codigo, mensaje, severidad } // severidad: 'alta' | 'media' | 'baja'
//     ]
//   }
//
// Regla de diseño: si la validación ESTRUCTURAL falla, NO se evalúa la capa
// semántica (no tiene sentido analizar la coherencia de datos malformados).
// ===========================================================================

// --- Umbrales configurables (justificados por el manual MetroPT-3) ---------
const UMBRALES = {
  // Bajo carga (dv_electric=1), la presión DV debe ser ~0 bar.
  DV_MAX_BAJO_CARGA: 0.5,
  // R debe ser "cercana" a TP3. Tolerancia absoluta en bar.
  R_TP3_TOLERANCIA: 1.5,
  // LPS se enciende si la presión del depósito (R) cae por debajo de este valor.
  PRESION_UMBRAL_LPS: 7,
  // Corriente del motor: valores nominales y tolerancia para considerarla "cercana".
  CORRIENTE_NOMINALES: [0, 4, 7, 9],
  CORRIENTE_TOLERANCIA: 1.5,
};

// --- Esquema esperado del reporte ------------------------------------------
const PRESIONES = ["tp2", "tp3", "h1", "dv", "r"];
const SENALES = [
  "comp",
  "dv_electric",
  "towers",
  "mpg",
  "lps",
  "pressure_switch",
  "oil_level",
];

const esNumero = (v) => typeof v === "number" && Number.isFinite(v);
const esBinario = (v) => v === 0 || v === 1;

// ---------------------------------------------------------------------------
// CAPA 1 — Validación estructural
// ---------------------------------------------------------------------------
function validarEstructura(json) {
  const errores = [];

  if (json === null || typeof json !== "object" || Array.isArray(json)) {
    errores.push({ campo: "(raíz)", mensaje: "El reporte no es un objeto JSON válido." });
    return errores;
  }

  // Campos de texto obligatorios
  for (const campo of ["fecha", "maquina", "operario", "descripcion"]) {
    if (typeof json[campo] !== "string" || json[campo].trim() === "") {
      errores.push({ campo, mensaje: `El campo '${campo}' es obligatorio y debe ser texto no vacío.` });
    }
  }

  // Bloque variables
  const variables = json.variables;
  if (variables === null || typeof variables !== "object" || Array.isArray(variables)) {
    errores.push({ campo: "variables", mensaje: "Falta el bloque 'variables' o no es un objeto." });
    return errores; // sin variables no podemos validar lo de dentro
  }

  // Presiones
  const presiones = variables.presiones;
  if (presiones === null || typeof presiones !== "object" || Array.isArray(presiones)) {
    errores.push({ campo: "variables.presiones", mensaje: "Falta el bloque 'presiones' o no es un objeto." });
  } else {
    for (const p of PRESIONES) {
      const v = presiones[p];
      if (v === undefined) {
        errores.push({ campo: `variables.presiones.${p}`, mensaje: `Falta la presión '${p}'.` });
      } else if (!esNumero(v)) {
        errores.push({ campo: `variables.presiones.${p}`, mensaje: `La presión '${p}' debe ser numérica.` });
      } else if (v < 0) {
        errores.push({ campo: `variables.presiones.${p}`, mensaje: `La presión '${p}' no puede ser negativa.` });
      }
    }
  }

  // Señales eléctricas
  const senales = variables.senales_electricas;
  if (senales === null || typeof senales !== "object" || Array.isArray(senales)) {
    errores.push({ campo: "variables.senales_electricas", mensaje: "Falta el bloque 'senales_electricas' o no es un objeto." });
  } else {
    for (const s of SENALES) {
      const v = senales[s];
      if (v === undefined) {
        errores.push({ campo: `variables.senales_electricas.${s}`, mensaje: `Falta la señal '${s}'.` });
      } else if (!esBinario(v)) {
        errores.push({ campo: `variables.senales_electricas.${s}`, mensaje: `La señal '${s}' debe ser binaria (0 o 1).` });
      }
    }
  }

  // Corriente del motor
  if (!esNumero(variables.corriente_motor)) {
    errores.push({ campo: "variables.corriente_motor", mensaje: "La corriente del motor debe ser numérica." });
  } else if (variables.corriente_motor < 0) {
    errores.push({ campo: "variables.corriente_motor", mensaje: "La corriente del motor no puede ser negativa." });
  }

  // Temperatura del aceite
  if (!esNumero(variables.temperatura_aceite)) {
    errores.push({ campo: "variables.temperatura_aceite", mensaje: "La temperatura del aceite debe ser numérica." });
  }

  return errores;
}

// ---------------------------------------------------------------------------
// CAPA 2 — Validación semántica (coherencia con el manual)
// ---------------------------------------------------------------------------
function validarSemantica(json) {
  const inconsistencias = [];
  const { presiones, senales_electricas: s, corriente_motor } = json.variables;

  // R1 — COMP (sin carga) y DV_Electric (bajo carga) no pueden estar ambas activas.
  if (s.comp === 1 && s.dv_electric === 1) {
    inconsistencias.push({
      codigo: "COMP_DV_ELECTRIC",
      mensaje: "COMP (compresor sin carga/apagado) y DV_Electric (compresor bajo carga) están ambas activas; son estados mutuamente excluyentes.",
      severidad: "media",
    });
  }

  // R2 — Bajo carga (dv_electric=1), la presión DV debe ser ~0 bar.
  if (s.dv_electric === 1 && presiones.dv > UMBRALES.DV_MAX_BAJO_CARGA) {
    inconsistencias.push({
      codigo: "DV_BAJO_CARGA",
      mensaje: `El compresor opera bajo carga (DV_Electric=1) pero la presión DV es ${presiones.dv} bar (debería ser ~0).`,
      severidad: "media",
    });
  }

  // R3 — R debe ser cercana a TP3 (presión del panel neumático).
  if (Math.abs(presiones.r - presiones.tp3) > UMBRALES.R_TP3_TOLERANCIA) {
    inconsistencias.push({
      codigo: "R_LEJOS_TP3",
      mensaje: `La presión del depósito R (${presiones.r} bar) difiere de TP3 (${presiones.tp3} bar) más de lo esperado; posible fuga o lectura errónea.`,
      severidad: "alta",
    });
  }

  // R4 — LPS coherente con la presión del depósito: LPS=1 ⟺ R < 7 bar.
  const presionBaja = presiones.r < UMBRALES.PRESION_UMBRAL_LPS;
  if (s.lps === 1 && !presionBaja) {
    inconsistencias.push({
      codigo: "LPS_INCOHERENTE",
      mensaje: `LPS está encendida pero la presión R (${presiones.r} bar) no es inferior a ${UMBRALES.PRESION_UMBRAL_LPS} bar.`,
      severidad: "media",
    });
  } else if (s.lps === 0 && presionBaja) {
    inconsistencias.push({
      codigo: "LPS_INCOHERENTE",
      mensaje: `La presión R (${presiones.r} bar) es inferior a ${UMBRALES.PRESION_UMBRAL_LPS} bar pero LPS está apagada.`,
      severidad: "media",
    });
  }

  // R5 — Corriente del motor cercana a algún valor nominal {0,4,7,9}A.
  const distancia = Math.min(
    ...UMBRALES.CORRIENTE_NOMINALES.map((n) => Math.abs(corriente_motor - n))
  );
  if (distancia > UMBRALES.CORRIENTE_TOLERANCIA) {
    inconsistencias.push({
      codigo: "CORRIENTE_FUERA_RANGO",
      mensaje: `La corriente del motor (${corriente_motor} A) está lejos de los valores nominales (0/4/7/9 A).`,
      severidad: "baja",
    });
  }

  return inconsistencias;
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------
function validarIncidencia(json) {
  const errores = validarEstructura(json);
  if (errores.length > 0) {
    return { valido: false, errores, inconsistencias: [] };
  }
  const inconsistencias = validarSemantica(json);
  return { valido: true, errores: [], inconsistencias };
}

// ===========================================================================
// Wrapper n8n — modo "Run Once for Each Item".
// El reporte de incidencia llega en $json (igual que en el resto del workflow).
// Devuelve el reporte intacto + el resultado de la validación en _validacion,
// para que un nodo IF posterior pueda ramificar según _validacion.valido.
// ===========================================================================
const _resultado = validarIncidencia($json);
return {
  ...$json,
  _validacion: _resultado,
};
