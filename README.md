# Trabajo de Final de Máster (TFM)

## Detalles sobre las Entregas
Las **fechas importantes** son las siguientes:
- **Entrega 1 - Borrador inicial**: Para el **15 de abril**. Debe incluir la estructura de **capítulos**, el **planteamiento** y la justificación del problema (contexto), la **metodología** del trabajo (métodos, técnicas y herramientas que se utilizarán), el **estado del arte** y los **objetivos**. El **estado del arte** debería de estar **totalmente acabado**.
- **Entrega 2 - Borrador intermedio**: Para el **13 de mayo**. Debe incluir las **recomendaciones** del tutor, **terminar objetivos y metodología** e incluir los **avances** realizados, así como borradores de la **introducción, resultados y conclusiones**.
- **Entrega 3 - Borrador final**: Para el **17 de junio**. Debe incluir las **recomendaciones del tutor** y haber **terminado introducción, desarrollo, resultados y conclusiones** y haber añadido un **resumen**.
  - En función de su madurez, el tutor nos dirá si podemos entregar en convocatoria ordinaria o si deberemos esperar a la extraordinaria.
  - Puede que recibamos algún comentario menor, pero debe de ser prácticamente lo que vayamos a entregar en el predepósito.
- **Predepósito** (convocatoria ordinaria): Para el **15 de julio**. Tras el predepósito NO deberían de haber cambios más allá de pequeñas correcciones de erratas. El contenido debería de ser lo mismo que se deposite.
- **Predepósito** (convocatoria extraordinaria): Para el **9 de septiembre**.


## Consideraciones a Tener en Cuenta
- Mi **tutor** de TFM será Rafael Martínez Ranera.
- Deberíamos intentar cumplir el ***plannnig* semanal** sugerido.
  - El **tutor** NO hará seguimiento semanal, él dará **comentarios** escritos **y una sesión en vivo** con cada grupo **tras cada entrega**. Las sesiones quedarán grabadas.
- En la pestaña *Fases TFE* del campus virtual encontraremos archivos con las **reglas a seguir**, incluyendo una [plantilla grupal](material/plantilla_grupal.docx) con una **guía de estilo**.
- Para los **TFMs en grupo**, **todos** los miembros **deben de estar al tanto de todo** el proyecto, NO basta con dividirlo en varios bloques y que cada uno se encargue de una parte e ignore las otras.
- Respecto a la **evaluación**:
  - La **memoria** es un **70%** de la nota y la **presentación** es un **30%**.
  - Con **2 entregas NO aptas, se suspende** el TFM. Por eso, el profesor NO las dará como no aptas para evitar esta situación.
- Existen ciertos **requisitos**:
  - La extensión mínima en un TFE grupal es de 90 páginas.
  - Deben incluirse al menos **20 citas** y seguir el estándar **APA7**.
  - El TFM debe de tener **menos de un 20% de plagio** en TurnItIn para poder ser entregado.


## Propuesta Escogida - Desarrollo de un Cuadro de Mando Conectado a Sistemas OCR Automatizados con Agentes
Haré un TFM en modalidad **RedProyectum**, es decir, se desarrollará en el contexto de un proyecto empresarial, en concreto, de **Sopra Steria**.

Mi propuesta es la **propuesta 19**, cuyo **título** es: **Diseño y desarrollo de una plataforma inteligente de monitorización operativa mediante cuadros de mando conectados a sistemas OCR, análisis visual y automatización con agentes**.

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

