// ===========================================================================
// integrar_en_workflow.js — inserta el nodo de validación en Workflow_RAG.json.
//
// Inserta entre "Edit Fields" y "Code in JavaScript":
//   Edit Fields → [Validar incidencia] → [¿Reporte válido?] ─true─→ Code in JavaScript
//                                                            └false─→ [Reporte inválido] (stopAndError)
//
// - El jsCode se escapa automáticamente vía JSON.stringify (nada a mano).
// - IDEMPOTENTE: si ya existe "Validar incidencia", no hace nada.
// - El original está versionado en git: para revertir, `git checkout`.
//
// Uso:  node build-n8n.js && node integrar_en_workflow.js
// ===========================================================================
import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const RUTA_WF = new URL("../Workflow_RAG.json", import.meta.url);
const RUTA_SNIPPET = new URL("./nodo_n8n_validacion.js", import.meta.url);

const wf = JSON.parse(readFileSync(RUTA_WF, "utf8"));

// --- Idempotencia ----------------------------------------------------------
if (wf.nodes.some((n) => n.name === "Validar incidencia")) {
  console.log("El workflow ya contiene 'Validar incidencia'. Nada que hacer.");
  process.exit(0);
}

// --- Código de validación (snippet autogenerado, fuente única de verdad) ----
const jsCode = readFileSync(RUTA_SNIPPET, "utf8");

// --- Abrir espacio: desplazar el bloque del agente a la derecha -------------
const DESPLAZAMIENTO_X = 320;
const A_DESPLAZAR = new Set([
  "Code in JavaScript",
  "AI Agent",
  "Ollama Chat Model",
  "buscador_manual",
  "Simple Vector Store2",
]);
for (const n of wf.nodes) {
  if (A_DESPLAZAR.has(n.name)) n.position[0] += DESPLAZAMIENTO_X;
}

// --- Nodos nuevos -----------------------------------------------------------
wf.nodes.push({
  parameters: { mode: "runOnceForEachItem", jsCode },
  type: "n8n-nodes-base.code",
  typeVersion: 2,
  position: [-1008, 144],
  id: randomUUID(),
  name: "Validar incidencia",
});

wf.nodes.push({
  parameters: {
    conditions: {
      options: {
        caseSensitive: true,
        leftValue: "",
        typeValidation: "strict",
        version: 2,
      },
      conditions: [
        {
          id: randomUUID(),
          leftValue: "={{ $json._validacion.valido }}",
          rightValue: "",
          operator: { type: "boolean", operation: "true", singleValue: true },
        },
      ],
      combinator: "and",
    },
    options: {},
  },
  type: "n8n-nodes-base.if",
  typeVersion: 2.2,
  position: [-848, 144],
  id: randomUUID(),
  name: "¿Reporte válido?",
});

wf.nodes.push({
  parameters: {
    errorMessage:
      "=Reporte de incidencia inválido — {{ $json._validacion.errores.map(e => e.campo + ': ' + e.mensaje).join(' | ') }}",
  },
  type: "n8n-nodes-base.stopAndError",
  typeVersion: 1,
  position: [-848, -32],
  id: randomUUID(),
  name: "Reporte inválido",
});

// --- Reconexión -------------------------------------------------------------
// Edit Fields ya no va directo a Code in JavaScript, sino a la validación.
wf.connections["Edit Fields"] = {
  main: [[{ node: "Validar incidencia", type: "main", index: 0 }]],
};
wf.connections["Validar incidencia"] = {
  main: [[{ node: "¿Reporte válido?", type: "main", index: 0 }]],
};
wf.connections["¿Reporte válido?"] = {
  main: [
    [{ node: "Code in JavaScript", type: "main", index: 0 }], // salida 0 = true
    [{ node: "Reporte inválido", type: "main", index: 0 }], // salida 1 = false
  ],
};
// "Code in JavaScript" → "AI Agent" se mantiene intacta.

writeFileSync(RUTA_WF, JSON.stringify(wf, null, 2) + "\n");
console.log("OK -> Workflow_RAG.json integrado con la validación.");
