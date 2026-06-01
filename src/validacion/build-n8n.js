// ===========================================================================
// build-n8n.js — genera el snippet para el nodo Code de n8n a partir de
// validador.js, de modo que el código testeado y el del workflow NUNCA diverjan.
//
// Uso:  node build-n8n.js
// Salida: nodo_n8n_validacion.js  (copiar/pegar en un nodo "Code" de n8n,
//         modo "Run Once for Each Item").
// ===========================================================================
import { readFileSync, writeFileSync } from "node:fs";

const ORIGEN = "validador.js";
const DESTINO = "nodo_n8n_validacion.js";

// 1. Tomamos el código fuente y le quitamos las palabras clave de módulo ES,
//    que el sandbox del nodo Code de n8n no admite.
const fuente = readFileSync(new URL(ORIGEN, import.meta.url), "utf8")
  .replace(/^export\s+/gm, "");

// 2. Wrapper de n8n: recibe el reporte en $json, lo valida y lo devuelve
//    enriquecido con el resultado bajo la clave `_validacion`.
const wrapper = `
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
`;

const cabecera = `// ============================================================================
// AUTOGENERADO por build-n8n.js — NO editar a mano.
// Fuente de verdad: src/validacion/validador.js (cubierto por validador.test.js)
// Pegar este contenido en un nodo "Code" de n8n (Run Once for Each Item).
// ============================================================================
`;

writeFileSync(new URL(DESTINO, import.meta.url), cabecera + fuente + wrapper);
console.log(`OK -> ${DESTINO} generado desde ${ORIGEN}`);
