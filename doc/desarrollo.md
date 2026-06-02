# Notas sobre el Desarrollo

## Componentes del Sistema

### Ingesta Documental
Para **familiarizarme con n8n**, seguí su [tutorial de iniciación](https://docs.n8n.io/try-it-out/tutorial-first-workflow/), que muestra cómo crear un *workflow* que, cada semana, recupere datos de la NASA sobre erupciones solares y genere un informe u otro en función de su categoría. También hice su [curso para principiantes](https://www.youtube.com/watch?v=4BVTkqbn_tY&list=PLlET0GsrLUL59YbxstZE71WszP3pVnZfI) (2h) y su [curso avanzado](https://www.youtube.com/watch?v=TFTLMQLozCI&list=PLlET0GsrLUL5bxmx5c1H1Ms_OtOPYZIEG) (1h 30min).
- En el **curso para principantes** se presentan los conceptos y funcionalidades básicos, los tipos de nodos y los nodos más comunes. También se muestra cómo acceder al ***log*** de ejecuciones de *workflows* y nodos, **gestionar errores** con los *error workflows* (desde *settings* y utilizando los nodos *error trigger* y *stop and error*), **debuggear** (con el log de ejecuciones y el editor), crear **versiones**, obtener [**templates**](https://n8n.io/workflows/) de la comunidad, configurar **usuarios y roles** (owner, admins y members) y **colaborar** con otras personas.
- En el **curso avanzado** se muestra cómo trabajar con datos complejos, se introducen algunos nodos avanzados, se profundiza en los datos de salida, los *subworkflows* y los *error workflows*, se construye un ejemplo completo y se muestra cómo gestionar ficheros.

Me baso en [una plantilla](https://n8n.io/workflows/8460-extract-invoice-data-from-pdfs-to-json-with-gemini-ai-and-xml-transformation/) para extraer datos de un PDF digital extrayendo todo su texto, generando una plantilla y pidiéndole a un LLM que la rellene.
- Como **LLM**, utilizo [**Ollama**](https://github.com/ollama/ollama/blob/main/README.md#quickstart) en local porque es gratuito. Sigo la [guía de n8n](https://docs.n8n.io/integrations/builtin/credentials/ollama/) para configurar las credenciales, utilizando `http://ollama:11434` como credencial, ya que si usase `http://localhost:11434`, se utilizaría la IP del contenedor n8n, no del de Ollama.

Con respecto a los **modelos** disponibles con **Ollama**, **Qwen2.5** es extremadamente bueno siguiendo formatos JSON estrictos, es  menos *creativo* (positivo para nuestro *usecase*), tiene mejor consistencia estructural, menos errores de parsingy es muy sólido en extracción de datos. Por otro lado, **Llama3.1** ofrece mejor razonamiento general, mejor lenguaje natural y da explicaciones más *inteligentes*. Sin embargo, es más propenso a añadir texto fuera de los formatos especificados e *interpretar* en vez de extraer. Por ello, **Qwen** es mejor para generar los JSONs de incidentes pero **Llama** puede ser mejor para proponer soluciones en base al manual.
- Otras opciones son **Qwen3.6**, que es más nuevo y potente en razonamiento general, pero está menos probado en *tooling* real, por lo que hay más riesgo de que *interprete* en vez de extraer. Por su parte, **Gemma4** es muy bueno en razonamiento general y en lenguaje natural, pero es peor respetando estructuras rígidas y extracción determinista.
- Para **obtener QWen2.5**, se puede ejecutar `docker exec -it ollama ollama pull qwen2.5`.
  - QWen2.5 es un gran modelo que necesita de 4.5 GB de RAM. Docker limita la RAM de los contenedores a 4GB, por lo que puedes o aumentar este límite añadiendo SWAP (desde Linux, con `sudo fallocate -l 8G /swapfile \ sudo chmod 600 /swapfile \ sudo mkswap /swapfile \ sudo swapon /swapfile`), u **obtener QWen2.5:3b**, que es más ligero. Se hace ejecutando `docker exec -it ollama ollama pull qwen2.5:3b`.
    - `qwen2.5:7b` necesita ~4.5 GB, `llama3.1:8b` necesita ~5 GB y `qwen2.5:3b` necesita ~2.5 GB, pero ofrece un rendimiento superior a Llama 3.1.
    - Otras **alternativas aún más ligeras** (aunque con peor rendimiento) son `qwen2.5:1.5b` y, especialmente, `gemma:2b`.
  - Puedes verificar **qué LLMs hay disponibles** ejecutando `docker exec -it ollama ollama list`.

Para ingerir **formularios rellenados a mano**, utilizo otro contenedor Docker, `ocr`, basado en Python 3.10 y en el que instalo varios algoritmos OCR (Tesseract, Paddle, etc.). Abro una FastAPI en él disponible en [`localhost:8001/ocr`](http://localhost:8001/ocr) (visible desde [`localhost:8001/docs`](http://localhost:8001/docs) desde el navegador). Desde n8n, puedo utilizarlo utilizando un **nodo *HTTP Request*** con una petición `POST` hacia [`ocr:8000/ocr`](http://ocr:8000/ocr) (NO a `localhost`, ya que dentro de n8n, `localhost` es el contenedor `n8n`, no mi ordenador). En la *request*, se añade un cuerpo `Form-Data (Multipart)` que mande *n8n Binary File* con clave `file` y como valor todo el archivo binario que contiene la imagen.
- Puedes verificar si la API está funcionando visualizando el Swagger UI desde [`localhost:8001/docs/`](http://localhost:8001/docs#/).
- Se puede **testear el servicio `ocr`** desde consola ejecutando `curl -X POST http://localhost:8001/ocr -F "file=@datos/ejemplo_incidencia.jpg"`.
- En la carpeta `ocr/` del repositorio están todas las opciones OCR. Para utilizar una u otra se debe modificar el `docker-compose.yaml` para que utilice el `Dockerfile` y el `app.py` de la carpeta deseada.
  - Para Paddle OCR, fue importante especificar las buenas versiones en el `Dockerfile`: `paddleocr==2.7.3` y `paddlepaddle==2.6.2`. También tuve que añadir varios flags para desactivar el backend moderno de Paddle porque usa usa oneDNN/PIR, incompatible con CPU Docker.
  - **NOTA**: Tras modificar el `docker-file.yam`, es necesario reconstruir las imágenes con:
    ```bash
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    ```


### Validación del JSON

Entre la Ingesta y el Análisis se intercala un módulo de **validación en dos capas** que actúa como *gate* de calidad. Ver [`doc/validacion.md`](validacion.md) para la especificación completa.

**Capa 1 — Estructural (bloqueante)**: verifica que el JSON tiene todos los campos requeridos, los tipos correctos y rangos físicamente posibles. Si falla, el ítem se desvía al nodo *Reporte inválido* y se registra en la BD con `validacion_ok=0` sin pasar al agente.

**Capa 2 — Semántica (informativa)**: detecta inconsistencias de coherencia entre variables según las *Condiciones de Operación Normales* del `manual_MetroPT3.md`. Las inconsistencias se almacenan en la columna `alertas_validacion` y aparecen en Grafana. Las cinco reglas implementadas son:

| Código | Descripción |
| :--- | :--- |
| `COMP_DV_ELECTRIC` | COMP y DV_Electric no pueden estar activas simultáneamente |
| `DV_BAJO_CARGA` | Bajo carga (DV_Electric=1), la presión DV debe ser ~0 bar |
| `R_LEJOS_TP3` | La presión del depósito R debe ser cercana a TP3 |
| `LPS_INCOHERENTE` | LPS=1 ↔ R < 7 bar |
| `CORRIENTE_FUERA_RANGO` | Corriente del motor cerca de los valores nominales {0,4,7,9} A |

La lógica vive en `src/validacion/validador.js` (función pura, 19 tests con `node:test`) y se inyecta en un nodo *Code* de n8n mediante el script `src/validacion/build-n8n.js`. Esto garantiza que el código testeado y el del *workflow* nunca divergen.

### Análisis Documental

El análisis lo realiza un **AI Agent** de n8n conectado a un LLM local (llama3.2:3b vía Ollama) y equipado con un *tool* de búsqueda vectorial (*buscador_manual*) que consulta el `manual_MetroPT3.md` indexado con embeddings `nomic-embed-text`.

- El manual se carga al arrancar el *workflow* (nodo *Read/Write Files from Disk* → *Simple Vector Store* → *Recursive Character Text Splitter* → *Embeddings Ollama*), creando un índice vectorial en memoria.
- El JSON de incidencia se convierte en una consulta de lenguaje natural (*Code in JavaScript*) y se pasa al agente.
- El agente busca en el manual el fallo que mejor encaja, determina la **criticidad** (Alta/Media/Baja según el Índice OE7 del manual), el **tiempo estimado** de intervención y el **coste estimado** aplicando los costes estándar del manual.
- La salida obligatoria del agente incluye tres líneas al final: `Clasificación: [X]`, `Tiempo Estimado: [X] horas`, `Coste Estimado: [X] €`. El nodo *Prepare register* las extrae con regex.
- **Modelo elegido**: se optó por `llama3.2:3b` para el AI Agent (mejor razonamiento y lenguaje natural) y `qwen2.5:3b` para la extracción de JSON en la ingesta (mejor respeto de formatos estrictos). Ver sección *Ingesta Documental* para la comparativa de modelos.

### Registro de Incidencias

Las incidencias se persisten en dos lugares:

1. **MySQL** (`opsinsight_db.registro_incidencias`): tabla principal con todos los campos del diagnóstico más las columnas de validación. Schema en [`db/schema.sql`](../db/schema.sql). Credenciales: `admin/1234`, host `mysql_db` (nombre del servicio en la red Docker).

2. **CSV** (`/home/node/.n8n-files/historico_incidencias.csv`): copia en texto plano para consulta rápida, generada por el nodo *Convert to File* → *Read/Write Files from Disk1*.

Todos los registros — tanto los válidos como los rechazados por el validador — quedan en la BD. Los rechazados tienen `validacion_ok=0` y `criticidad='ERROR'`. Los fallos de infraestructura (nodo caído, LLM sin respuesta) los captura el workflow `OpsInsight_ErrorHandler` (nodo *Error Trigger*) y los registra con `criticidad='SISTEMA_ERROR'`. Esto da **visibilidad completa** del pipeline en el dashboard.

### Dashboard

El dashboard de monitorización se implementa con **Grafana 11.4** conectado al MySQL del stack. Se aprovisiona automáticamente al arrancar el contenedor `grafana` (sin configuración manual) gracias a los ficheros en `grafana/provisioning/`.

Paneles implementados:

| Panel | Tipo | Query |
| :--- | :--- | :--- |
| Errores de Sistema | Stat (rojo si > 0) | `COUNT(*) WHERE criticidad='SISTEMA_ERROR'` |
| Total Incidencias | Stat | `COUNT(*)` |
| Reportes con Validación OK | Stat (%) | `AVG(validacion_ok)*100` |
| Coste Total Estimado | Stat (€) | `SUM(coste_estimado)` |
| Tiempo Medio Reparación (MTTR) | Stat (h) | `AVG(tiempo_estimado)` |
| Distribución por Criticidad | Bar chart | `GROUP BY criticidad` |
| Estado de Validación | Donut | `GROUP BY validacion_ok` |
| Alertas Semánticas Detectadas | Bar chart horizontal | `JSON_TABLE` sobre `alertas_validacion` |
| Registro de Incidencias | Table | Últimas 50, criticidad y validación coloreadas |

El dashboard se refresca automáticamente cada 30 segundos. Accesible en `localhost:3000` (credenciales: `admin/admin`).

---

## Trabajo Futuro

El **agente de ingesta** podría mejorarse de las siguientes maneras:
- Cargar el JSON de ejemplo desde local utilizando un volumen Docker en `.datos/` y el bloque n8n *Read/Write Files from Disk*.
- El PDF se sube a través de un **formulario online**. Podría ser un webhook que espere un mensaje de una web en local desde la que el usuario podría subir una foto, un PDF o rellenar la encuesta.
  - También podría proporcionársele desde carpetas monitorizadas (con *local file trigger*) o almacenamiento en la nube como Google Drive, OneDrive o Amazon S3.

La **validación** podría extenderse con:
- Validación de la fecha (no puede ser futura, debe ser parseable).
- Más reglas de correlación del manual (relación Presión-Carga, Temperatura-Aceite).
- Notificación activa (Slack, email) cuando se detecta una inconsistencia de severidad alta.

El **dashboard** podría incorporar:
- Evolución temporal de incidencias (serie temporal con el campo `fecha`).
- KPI de coste por operario o por tipo de fallo.
- Alertas de Grafana configuradas sobre umbrales (ej: alerta si tasa de validación cae del 80%).
