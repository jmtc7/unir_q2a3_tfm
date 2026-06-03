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


### Análisis Documental
TODO


### Registro de Incidencias
TODO


### Dashboard
TODO


---

## Trabajo Futuro
El **agente de ingesta** podría mejorarse de las siguientes maneras:
- Añadir la opción de **ingerir fotos** de reportes de incidencias rellenados a mano.
- Cargar el JSON de ejemplo desde local utilizando un volumen Docker en `.datos/` y el bloque n8n *Read/Write Files from Disk*.
- **Verificar** que estén todos los campos y que sean de los tipos adecuados y, si no, lanzar un error.
- El PDF se sube a través de un **formulario online**. Podría ser un webhook que espere un mensaje de una web en local desde la que el usuario podría subir una foto, un PDF o rellenar la encuesta.
  - También podría proporcionársele desde carpetas monitorizadas (con *local file trigger*) o almacenamiento en la nube como Google Drive, OneDrive o Amazon S3.


---

## Estructura del Flujo de Trabajo Integrado
1. **Ingesta y Extracción:** Los formularios (PDF/Imagen) son procesados por el servicio OCR, estructurándolos en variables JSON nativas de la máquina (`tp2`, `tp3`, `corriente_motor`, `temperatura_aceite`, etc.).
2. **Filtrado y Limpieza (Nodo Limit & Code):** Se asegura la recepción de un único ítem estructurado para evitar ejecuciones duplicadas en Ollama.
3. **Agente IA Operativo:** El nodo `AI Agent` (conectado a Ollama) recibe el JSON formateado y consume el contexto del manual de la máquina para calcular automáticamente los KPIs económicos (costes por hora técnicos/externos, parada de línea) y tiempos estimados de reparación.
4. **Persistencia (MySQL):** Los resultados del diagnóstico se guardan automáticamente en la tabla `registro_incidencias` para alimentar el cuadro de mando.


---

## Evolución y Optimización de la Arquitectura (Mejoras sobre la Versión Base)
Tomando como punto de partida la versión inicial del flujo desarrollada por Jose Miguel, se detectaron ineficiencias críticas de diseño asíncrono y de concurrencia en entornos locales. El workflow original sufría del "Efecto Eco" (duplicidad de ejecuciones en la base de datos) y colapsaba el rendimiento del servidor. 

A través de un rediseño centrado en la linealidad y la gestión eficiente de la memoria de n8n, se han implementado las siguientes mejoras estructurales:

### 1. Desacoplamiento del Pipeline de Ingesta del RAG (Carga del Manual)
- **Problema en la versión base:** El nodo de lectura del manual (`Read/Write Files from Disk`) compartía disparadores y flujo lineal con la entrada de incidencias. Cada vez que un operario enviaba un formulario, el sistema se veía obligado a re-leer el PDF/MD completo, re-trocearlo y recalcular miles de vectores en bucle. Esto provocaba tiempos de espera inasumibles de hasta 30 minutos por incidencia.
- **Solución implementada:** Se ha aislado por completo la rama del RAG (Ingesta Documental). El manual de la máquina ahora se procesa e indexa de forma estática una única vez. La base de datos vectorial de n8n retiene la información de manera persistente en memoria, permitiendo que el `AI Agent` acceda al contexto en milisegundos de forma invisible, sin necesidad de cables físicos de ejecución que reinicien el flujo.

### 2. Eliminación de Ejecuciones Duplicadas y Datos Residuales ("Fantasmas")
- **Problema en la versión base:** Debido a la naturaleza iterativa del nodo `AI Agent` de LangChain (que realiza varias pasadas internas para evaluar herramientas) y a la lentitud de procesamiento de los LLMs locales (Ollama con Qwen), el nodo del agente emitía dos ítems de salida de manera asíncrona: uno con el diagnóstico real y otro residual con valores en vacío debido a las cláusulas de salvaguarda del código. Esto provocaba que toda la sección de registro (`Prepare register`, `Insert rows`, etc.) se ejecutara dos veces, inyectando filas duplicadas e inventadas en MySQL (ej. Operario No Identificado).
- **Solución implementada:** Se ha introducido un nodo de unificación de flujos mediante una lógica de embudo lineal. Se ha garantizado que el agente de IA solo propague un único ítem limpio hacia los nodos de persistencia. Con esto se ha erradicado por completo la duplicidad de registros, asegurando que cada envío de formulario genere única y estrictamente una fila real en la base de datos.

### 3. Modularidad en la Ingesta de Datos (Soporte Omnicanal Real)
- **Problema en la versión base:** El flujo de datos adolecía de cruces de cables que mezclaban las variables de los reportes digitales (PDF) y manuscritos (OCR) con los del formulario online, confundiendo al agente de IA al recibir esquemas de datos híbridos.
- **Solución implementada:** Se ha reorganizado el lienzo en zonas de responsabilidad independientes mediante notas adhesivas estructuradas (Formulario Online, PDF con reporte digital, Foto con reporte manuscrito). Cada canal extrae y normaliza los datos de manera aislada antes de confluir de forma limpia en el procesador JavaScript común. Esto dota al sistema de una arquitectura robusta, escalable y preparada para producción.
