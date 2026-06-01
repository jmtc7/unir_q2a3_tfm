import { test } from "node:test";
import assert from "node:assert/strict";
import { validarIncidencia } from "./validador.js";

// ---------------------------------------------------------------------------
// Helper: reporte base VÁLIDO y COHERENTE (equivale a datos/ejemplo_incidencia.json)
// Cada test parte de este objeto y muta solo lo que quiere probar.
// ---------------------------------------------------------------------------
function reporteBase() {
  return {
    fecha: "2026-05-18",
    maquina: "MetroPT3",
    operario: "José Miguel Torres Cámara",
    descripcion: "La máquina funciona bajo carga sin problema, pero hace un ruido extraño.",
    variables: {
      presiones: { tp2: 12.4, tp3: 10.9, h1: 3.6, dv: 0.0, r: 11.1 },
      senales_electricas: {
        comp: 0,
        dv_electric: 1,
        towers: 1,
        mpg: 0,
        lps: 0,
        pressure_switch: 0,
        oil_level: 0,
      },
      corriente_motor: 6.8,
      temperatura_aceite: 63,
    },
  };
}

// ===========================================================================
// CAPA 1 — VALIDACIÓN ESTRUCTURAL
// ===========================================================================

test("estructural: el reporte base es válido y sin errores", () => {
  const r = validarIncidencia(reporteBase());
  assert.equal(r.valido, true);
  assert.deepEqual(r.errores, []);
});

test("estructural: falta un campo de nivel superior (maquina)", () => {
  const json = reporteBase();
  delete json.maquina;
  const r = validarIncidencia(json);
  assert.equal(r.valido, false);
  assert.ok(r.errores.some((e) => e.campo === "maquina"));
});

test("estructural: falta el bloque variables.presiones", () => {
  const json = reporteBase();
  delete json.variables.presiones;
  const r = validarIncidencia(json);
  assert.equal(r.valido, false);
  assert.ok(r.errores.some((e) => e.campo === "variables.presiones"));
});

test("estructural: falta una presión concreta (tp2)", () => {
  const json = reporteBase();
  delete json.variables.presiones.tp2;
  const r = validarIncidencia(json);
  assert.equal(r.valido, false);
  assert.ok(r.errores.some((e) => e.campo === "variables.presiones.tp2"));
});

test("estructural: falta una señal eléctrica concreta (lps)", () => {
  const json = reporteBase();
  delete json.variables.senales_electricas.lps;
  const r = validarIncidencia(json);
  assert.equal(r.valido, false);
  assert.ok(r.errores.some((e) => e.campo === "variables.senales_electricas.lps"));
});

test("estructural: una presión no es numérica (string)", () => {
  const json = reporteBase();
  json.variables.presiones.tp3 = "diez";
  const r = validarIncidencia(json);
  assert.equal(r.valido, false);
  assert.ok(r.errores.some((e) => e.campo === "variables.presiones.tp3"));
});

test("estructural: una señal eléctrica no es binaria (valor 2)", () => {
  const json = reporteBase();
  json.variables.senales_electricas.comp = 2;
  const r = validarIncidencia(json);
  assert.equal(r.valido, false);
  assert.ok(r.errores.some((e) => e.campo === "variables.senales_electricas.comp"));
});

test("estructural: una presión es negativa (físicamente imposible)", () => {
  const json = reporteBase();
  json.variables.presiones.r = -3.2;
  const r = validarIncidencia(json);
  assert.equal(r.valido, false);
  assert.ok(r.errores.some((e) => e.campo === "variables.presiones.r"));
});

test("estructural: la corriente del motor es negativa", () => {
  const json = reporteBase();
  json.variables.corriente_motor = -1;
  const r = validarIncidencia(json);
  assert.equal(r.valido, false);
  assert.ok(r.errores.some((e) => e.campo === "variables.corriente_motor"));
});

test("estructural: entrada nula o no objeto produce error sin lanzar excepción", () => {
  const r = validarIncidencia(null);
  assert.equal(r.valido, false);
  assert.ok(r.errores.length > 0);
});

test("estructural: un JSON con error NO produce inconsistencias semánticas (no se evalúan)", () => {
  const json = reporteBase();
  delete json.variables.presiones;
  const r = validarIncidencia(json);
  assert.equal(r.valido, false);
  assert.deepEqual(r.inconsistencias, []);
});

// ===========================================================================
// CAPA 2 — VALIDACIÓN SEMÁNTICA (reglas derivadas del manual MetroPT-3)
// ===========================================================================

test("semántica: reporte base coherente no genera inconsistencias", () => {
  const r = validarIncidencia(reporteBase());
  assert.deepEqual(r.inconsistencias, []);
});

test("semántica: COMP y DV_Electric ambas activas se contradicen", () => {
  const json = reporteBase();
  json.variables.senales_electricas.comp = 1;
  json.variables.senales_electricas.dv_electric = 1;
  const r = validarIncidencia(json);
  assert.equal(r.valido, true); // sigue siendo estructuralmente válido
  assert.ok(r.inconsistencias.some((i) => i.codigo === "COMP_DV_ELECTRIC"));
});

test("semántica: bajo carga (dv_electric=1) la presión DV debe ser ~0", () => {
  const json = reporteBase();
  json.variables.senales_electricas.dv_electric = 1;
  json.variables.presiones.dv = 4.5;
  const r = validarIncidencia(json);
  assert.ok(r.inconsistencias.some((i) => i.codigo === "DV_BAJO_CARGA"));
});

test("semántica: R debe ser cercana a TP3", () => {
  const json = reporteBase();
  json.variables.presiones.tp3 = 10.9;
  json.variables.presiones.r = 4.0; // muy por debajo de TP3
  const r = validarIncidencia(json);
  assert.ok(r.inconsistencias.some((i) => i.codigo === "R_LEJOS_TP3"));
});

test("semántica: LPS encendida exige presión < 7 bar", () => {
  const json = reporteBase();
  json.variables.senales_electricas.lps = 1;
  json.variables.presiones.r = 11.1; // presión alta, LPS no debería estar encendida
  const r = validarIncidencia(json);
  assert.ok(r.inconsistencias.some((i) => i.codigo === "LPS_INCOHERENTE"));
});

test("semántica: presión < 7 bar exige LPS encendida", () => {
  const json = reporteBase();
  json.variables.senales_electricas.lps = 0;
  json.variables.presiones.r = 5.0; // presión baja pero LPS apagada
  // R cercana a TP3 para aislar la regla de LPS: bajamos también TP3
  json.variables.presiones.tp3 = 5.2;
  const r = validarIncidencia(json);
  assert.ok(r.inconsistencias.some((i) => i.codigo === "LPS_INCOHERENTE"));
});

test("semántica: corriente del motor muy alejada de los valores nominales", () => {
  const json = reporteBase();
  json.variables.corriente_motor = 15; // lejos de {0,4,7,9}
  const r = validarIncidencia(json);
  assert.ok(r.inconsistencias.some((i) => i.codigo === "CORRIENTE_FUERA_RANGO"));
});

test("semántica: cada inconsistencia incluye codigo, mensaje y severidad", () => {
  const json = reporteBase();
  json.variables.senales_electricas.comp = 1;
  json.variables.senales_electricas.dv_electric = 1;
  const r = validarIncidencia(json);
  const inc = r.inconsistencias.find((i) => i.codigo === "COMP_DV_ELECTRIC");
  assert.ok(inc);
  assert.equal(typeof inc.mensaje, "string");
  assert.ok(["alta", "media", "baja"].includes(inc.severidad));
});
