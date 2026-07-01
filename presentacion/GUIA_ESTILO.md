# Guía de estilo — Defensa TFM · OpsInsight Analytics

Sistema de diseño de la presentación de defensa. **Objetivo: coherencia total** entre las
secciones de los tres integrantes. Si añadís o editás diapositivas, respetá estas reglas.

El deck se genera de forma reproducible con [`build_pptx.py`](build_pptx.py) → `OpsInsight_Analytics_Defensa_TFM.pptx`.

---

## 1. Paleta de color

| Rol | Nombre | HEX | Uso |
| :-- | :-- | :-- | :-- |
| Fondo oscuro | Navy industrial | `#0E1B2A` | Portada, divisores, cajas de énfasis |
| Panel oscuro | Panel | `#12253A` | Chips sobre fondo oscuro |
| **Acento principal** | **Teal** | `#16B8A6` | Kickers, reglas de acento, flechas, KPIs |
| Acento oscuro | Teal oscuro | `#0E8C7F` | Texto de acento sobre fondo claro |
| Alerta | Ámbar | `#F5A623` | Criticidad, validación semántica, "parcial" |
| Error | Rojo | `#E5484D` | Fallos, capa bloqueante, "rechazado" |
| OK | Verde | `#2FB574` | Estados válidos, objetivos completos |
| Fondo claro | Gris azulado | `#F4F7FA` | Fondo de slides de contenido |
| Tarjeta | Blanco | `#FFFFFF` | Cards |
| Texto | Tinta | `#1A2A3A` | Texto principal |
| Texto sec. | Muted | `#5B6B7B` | Descripciones, pies |
| Línea | Hairline | `#DCE4EC` | Separadores finos |

**Regla semántica del color** (mantener SIEMPRE): teal = flujo/general · ámbar = alerta/criticidad ·
rojo = error/bloqueo · verde = OK/completo. No usar el color por estética; usarlo por significado.

## 2. Tipografía

Fuentes **Windows-safe** (no se rompen al presentar desde cualquier equipo):

- **Títulos y destacados:** `Segoe UI Semibold`
- **Cuerpo:** `Segoe UI`
- **Título grande de portada / subtítulos:** `Segoe UI Light`
- **Código, nombres técnicos, identificadores:** `Consolas`

Escala aproximada: título de slide 27 pt · kicker 11 pt · cuerpo 12–13 pt · pies 8.5 pt ·
número de divisor 200 pt · título de portada 54 pt.

> Si se quiere un look más distintivo, se pueden instalar **Montserrat** (títulos) + **Inter** (cuerpo)
> en los tres equipos y cambiar `F_HEAD`/`F_BODY` en `build_pptx.py`. Sin instalarlas, NO usarlas
> (PowerPoint las sustituiría y rompería la coherencia).

## 3. Layout (16:9 — 13.333 × 7.5")

- **Márgenes:** 0.7" izquierda/derecha.
- **Slide de contenido:** kicker (cuadrado teal + texto MAYÚSCULAS) → título → regla de acento teal →
  cuerpo → footer con línea fina, marca a la izquierda y `Sección · NN` a la derecha.
- **Divisores de bloque:** fondo navy, número gigante, franja teal a la izquierda.
- **Cards:** rectángulo redondeado blanco, opcional barra de acento superior de 0.07".
- **Imágenes:** siempre dentro de una card blanca y ajustadas **sin deformar** (`pic_fit`).

## 4. Estructura del deck (21 diapositivas · ~20 min · 3 ponentes)

| # | Slide | Bloque | Ponente sugerido |
| :-- | :-- | :-- | :-- |
| 1 | Portada | — | Efrel (apertura) |
| 2 | Agenda | — | Efrel |
| 3 | Divisor 01 | Contexto y objetivos | Efrel |
| 4 | Contexto y problema | 01 | Efrel |
| 5 | Objetivos (general + OE1–OE9) | 01 | Efrel |
| 6 | Metodología CRISP-DM + reparto | 01 | Efrel |
| 7 | Divisor 02 | Arquitectura | Víctor |
| 8 | Arquitectura: 5 capas + diagrama | 02 | Víctor |
| 9 | Stack tecnológico (100% local) | 02 | Víctor |
| 10 | Workflow n8n integrado | 02 | Víctor |
| 11 | Divisor 03 | Módulos | José Miguel |
| 12 | Ingesta omnicanal + OCR | 03 | José Miguel |
| 13 | Validación en dos capas | 03 | José Miguel |
| 14 | Agente de análisis (RAG) | 03 | Víctor |
| 15 | Registro + optimizaciones | 03 | José Miguel |
| 16 | Dashboard Grafana | 03 | Efrel |
| 17 | Divisor 04 | Resultados | Efrel |
| 18 | Resultados y cumplimiento | 04 | Efrel |
| 19 | Limitaciones y trabajo futuro | 04 | Víctor |
| 20 | Conclusiones | 04 | Efrel |
| 21 | Cierre / preguntas | — | los tres |

El reparto de ponentes está también en las **notas del orador** de cada slide, con guion y timing.
Es una sugerencia alineada con el reparto de responsabilidades de la memoria (Tabla 2); ajustable.

## 5. Reglas de coherencia (importante)

1. **Grafana, no Streamlit.** El proyecto migró a Grafana. Cualquier figura, logo o texto que
   mencione Streamlit está desactualizado. ⚠️ Revisar también el diagrama de arquitectura en la
   **memoria (.docx)** — el `imgs/arquitectura/arquitectura.drawio.png` original aún dice Streamlit.
2. **Nombre del producto:** *OpsInsight Analytics* (consistente en todo el deck y la memoria).
3. **Título oficial:** el de la portada de la memoria (sin "análisis visual" — se eliminó esa tecnología).
4. **Cifras y hechos** deben coincidir con la memoria: 9 objetivos (7 completos, OE6/OE7 parciales),
   5 reglas semánticas, modelos `qwen2.5:3b` (extracción) y `llama3.2:3b` (agente RAG).

## 6. Regenerar el `.pptx`

```bash
python -m pip install python-pptx pillow
python presentacion/build_pptx.py
```

Para exportar a PNG/PDF y revisar (requiere PowerPoint instalado + `pywin32`), o abrir el `.pptx`
directamente en PowerPoint. El generador es la **fuente de verdad**: editá el script, no el `.pptx`,
para mantener la coherencia reproducible.
