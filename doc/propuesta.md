# Desarrollo de un Cuadro de Mando Conectado a Sistemas OCR Automatizados con Agentes
Este TFM es en modalidad **RedProyectum**, es decir, se desarrollará en el contexto de un proyecto empresarial, en concreto, de **Sopra Steria**.

La propuesta escogida es la **propuesta 19**, cuyo **título** es: **Diseño y desarrollo de una plataforma inteligente de monitorización operativa mediante cuadros de mando conectados a sistemas OCR, análisis visual y automatización con agentes**.

El **objetivo general** es construir un sistema completo de **monitorización del estado de tareas** diarias en una organización industrial o de servicios, **integrando** fuentes de datos heterogéneas como **bases de datos** internas, capturas **OCR** de formularios en papel y análisis de **imágenes**, y presentando toda la información en un **cuadro de mando** centralizado.

Los **objetivos específicos** son: 
- Deﬁnir y estructurar el **alcance de las tareas que se monitorizarán**, identiﬁcando qué **procesos** diarios generan datos, qué **indicadores** representan su estado y qué **fuentes** son ﬁables.
- Diseñar una **arquitectura modular basada en agentes** que analicen documentos, imágenes u otros soportes para validar el estado real de las tareas.
- **Implementar** ﬂujos de **automatización** mediante plataformas como **n8n o Activepieces** que extraigan datos, invoquen modelos OCR o servicios de análisis visual y actualicen registros en bases de datos.
- Construir un **cuadro de mando interactivo** capaz de mostrar métricas clave, incidencias, estado de ejecución de procesos y evidencias asociadas.
- Integrar **modelos LLM** locales o desplegados en CPU para interpretar documentos, comprobar coherencia entre reportes y detectar desviaciones.
- **Evaluar el sistema** en un caso representativo de entorno real como logística, mantenimiento, retail, inspección técnica o servicios de campo.

Los **elementos y actividades clave** del proyecto son:
- **Análisis de procesos reales**: identiﬁcación de las tareas diarias que deben monitorizarse, puntos de captura de datos, actores involucrados y posibles ineﬁciencias en el ﬂujo actual.
- **Diseño de pipelines de captura**: digitalización de checklist en papel mediante OCR, ingestión de imágenes provenientes de aplicaciones móviles internas y consultas a bases de datos operativas.
- **Integración con n8n o Activepieces** para automatizar ﬂujos de captura, limpieza y validación de información.
- **Desarrollo de agentes basados en LLM** locales capaces de analizar la documentación capturada y veriﬁcar si el estado reportado coincide con el estado esperado. Los agentes deberán operar bajo reglas deﬁnidas por el equipo del proyecto.
- **Diseño de un cuadro de mando interactivo** usando tecnologías web y frameworks como Dash, Streamlit o superset empresarial.
- **Implementación de mecanismos de alerta** basados en reglas y en razonamiento del agente (por ejemplo, detección de inconsistencias entre checklist OCR y registros de base de datos).
- **Evaluación** mediante escenarios simulados o datos anonimizados, midiendo precisión del OCR, ﬁabilidad de las detecciones visuales y utilidad del cuadro de mando.
- **Recopilación de un conjunto mínimo de datos** reales o simulados que permita evaluar el funcionamiento completo de la plataforma.

La **metodología** a seguir será:
- Fase de **descubrimiento**: análisis de requisitos reales, identiﬁcación de fuentes de datos y deﬁnición de indicadores de control. El estudiante deberá acotar el alcance y seleccionar un subconjunto de tareas operativas para monitorizar.
- Fase de **arquitectura**: diseño de un sistema compuesto por módulosindependientes que incluyan captura OCR, análisis visual, agente de veriﬁcación documental, base de datos índice y cuadro de mando.
- Fase de **integración**: desarrollo de pipelines en n8n o Activepieces con conectores a OCR, a servicios de análisis visual y a modelos LLM.
- Construcción de un **esquema de datos** que permita registrar eventos, incidencias y estados parciales.
- Fase de **desarrollo del agente**: conﬁguración de un modelo de lenguaje capaz de analizar documentos OCR y describir el estado de cada tarea, marcar inconsistencias y sugerir acciones correctoras.
- Fase de **construcción del *dashboard***: implementación de vistas que muestren estado global, incidencias abiertas, informes generados y evidencias visuales asociadas.
- Fase de **evaluación**: análisis de precisión, latencia, exhaustividad y detección temprana de fallos. Comparación entre estados esperados y estados detectados por el sistema.

Se recomienda el uso de las siguientes **tecnologías**: Python, Tesseract OCR o PaddleOCR, LLM locales con llama.cpp, CLIP o SigLIP para análisis visual, n8n o Activepieces, bases de datos SQL o NoSQL, Dash o Streamlit para visualización.

Deberán **entregarse**:
- **Arquitectura** completa documentada.
- ***Pipelines* de captación y automatización** en n8n o Activepieces.
- **Agente de análisis** documental y visual.
- **Cuadro de mando** funcional conectado a las fuentes.
- **Informe** técnico con análisis, evaluaciones y discusión crítica.

Los **aspectos evaluables** son:
- Grado de **integración de fuentes** heterogéneas.
- Correcta **deﬁnición del alcance** y claridad en el modelado del **ﬂujo operativo**.
- Rigor del agente para **detectar inconsistencias**.
- Calidad del **cuadro de mando** y utilidad de los **indicadores**.
- **Robustez** técnica y **reproducibilidad**.

También **debe considerarse** que el proyecto es adecuado para contextos reales como logística, mantenimiento industrial, operaciones en retail, salud ocupacional o inspecciones de campo. El estudiante deberá demostrar capacidad para acotar el problema, deﬁnir requisitos reales y proponer una arquitectura moderna basada en IA Generativa y agentes.