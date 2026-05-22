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

Para ingerir **formularios rellenados a mano**, utilizo otro contenedor Docker, `ocr`, basado en Python 3.10 y en el que instalo Tesseract OCR. Abro una FastAPI en él disponible en [`localhost:8001/ocr`](http://localhost:8001/ocr) (visible desde [`localhost:8001/docs`](http://localhost:8001/docs) desde el navegador). Desde n8n, puedo utilizarlo utilizando un **nodo *HTTP Request*** con una petición `POST` hacia [`ocr:8000/ocr`](http://ocr:8000/ocr) (NO a `localhost`, ya que dentro de n8n, `localhost` es el contenedor `n8n`, no mi ordenador). En la *request*, se añade un cuerpo `Form-Data (Multipart)` que mande *n8n Binary File* con clave `file` y como valor todo el archivo binario que contiene la imagen.
- Se puede **testear el servicio `ocr`** desde consola ejecutando `curl -X POST http://localhost:8001/ocr -F "file=@ejemplo_incidencia.jpg"`.


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
