# Trabajo de Final de Máster (TFM)
Este repositorio continene información, datos y documentos desarrollados para mi TFM del máster en Big Data y Visual Analytics de la UNIR. Los archivos se estructuran de la siguiente forma:
- [`datos/`](datos/): Carpeta con los **datos** utilizados para desarrollar y testear la solución. Algunos de los archivos clave son:
  - [`plantilla_reporte_incidencia.odt`](datos/plantilla_reporte_incidencia.odt): Plantilla que los usuarios podrían utilizar para reportar incidencias. Puede rellenarse virtualmente y generar un PDF a partir de ella o imprimirse para rellenarse a mano y darle al sistema una foto del formulario rellenado a mano.
  - [`ejemplo_incidencia.json`](datos/ejemplo_incidencia.json): Ejemplo de JSON que deberá generar el agente de ingesta y que debe recibir el agente de análisis documental.
  - [`ejemplo_incidencia.pdf`](datos/ejemplo_incidencia.pdf): Ejemplo de un reporte de incidencia digital en PDF que puede recibir el agente de ingesta.
  - [`ejemplo_incidencia_manuscrito.jpg`](datos/ejemplo_incidencia_manuscrito.jpg): Ejemplo de una fotografía de un reporte de incidencia totalmente manuscrito que puede recibir el agente de ingesta.
  - [`manual_MetroPT3.md`](datos/manual_MetroPT3.md): Manual en MarkDown de una supuesta máquina MetroPT3. Se basa en los datos del [dataset MetroPT3](https://archive.ics.uci.edu/dataset/791/metropt+3+dataset), que contiene datos reales de la Unidad de Producción de Aire (APU) de un metro.
- [`doc/`](doc/): Carpeta con **documentación** detallada sobre:
  - [`propuesta.md`](doc/propuesta.md): La **propuesta de TFM escogida**, incluyendo sus objetivos, metodología y entregables.
  - [`entregas.md`](doc/entregas.md): El **contenido** esperado en cada una **de las entregas intermedias** a realizar.
  - [`desarrollo.md`](doc/desarrollo.md): Detalles técnicos sobre el desarrollo del trabajo.
- [`OpsInsight.json](OpsInsight.json): *Workflow* de n8n que automatiza la solución (ingesta, análisis y registro de incidencias).

El trabajo consiste en un sistema que ayude a los operarios de una planta industrial a reaccionar ante incidencias con máquinas complejas. Además, este sistema, registra dichas incidencias y facilita su inspeción y análisis a través de un *dashboard*.


---

## Arquitectura 
La arquitectura se basa en un **agente IA que ingiera reportes** de incidencias en forma de encuestas, PDFs o imágenes y **genere JSONs** con la información clave, que luego se le pasan a **otro** agente que **consulta los manuales para proponer una acción** al operario. Las incidencias se **registran en un CSV y en una base de datos** relacional SQL. En base a esta, se ofrece un ***dashboard*** con el **registro** de incidencias así como varios **KPIs y gráficas** y facilitan su análisis. Esto se representa en el siguiente esquema:

<p align="center">
  <img src="imgs/arquitectura/arquitectura.drawio.png" height="200">
</p>

Todo esto se implementa en un ***workflow* n8n** que, a alto nivel, utiliza los siguientes componentes. En la carpeta [`imgs/n8n/`](imgs/n8n/) hay vistas detalladas de cada componente.

<p align="center">
  <img src="imgs/n8n/0_global.png" height="350">
</p>


---

## Guía de Instalación y Uso
### Prerrequisitos
Como **prerrequisitos**, se asume que ya se dispone de una **instalación funcional de [Docker Desktop](https://www.docker.com/products/docker-desktop/)**.


### Instalación (con Docker)
El *workflow* está automatizado con [n8n](https://n8n.io), desde donde se utilizan LLMs ejecutados en local con [Ollama](https://ollama.com/). Para utilizar este *stack*, se utilizan **contenedores [Docker](https://www.docker.com/)**. Gran parte de la instalación está automatizada el archivo [`docker-compose.yaml`](docker-compose.yaml), que realiza lo siguiente:
- Crea un **contenedor `ollama`** que abrirá un **servicio** en [ollama:11434](http://ollama:11434). Este se basa en la **imagen** [ollama/ollama](https://hub.docker.com/r/ollama/ollama). También se crea un **volumen de datos** persistente llamado `ollama` que se aloja en `/root/.ollama`.
- Crea un **contenedor `n8n`**, con **servicio** en [localhost:5678](http://localhost:5678), basado en la **imagen** [n8nio/n8n](https://hub.docker.com/r/n8nio/n8n) y que usa el **volumen** `n8n_data` (alojado en `/home/node/.n8n`). También se configuran varias **variables de entorno**, incluyendo el uso de la zona horaria `Europe/Madrid`. Finalmente, se le declara como **dependiente** del contenedor `ollama` para que puedan comunicarse.

> **Instalación alternativa**: La instalación con Docker Compose es fuertemente recomendada por su simplicidad, reproducibilidad y manejo automático de redes Docker y volúmenes de datos. Sin embargo, si por cualquier motivo NO quieres utilizar Docker Compose, puedes seguir el [tutorial de instalación alternativo](doc/instalacion_alternativa.md).

Para **crear estos contenedores** y ejecutarlos, debes utilizar `docker compose up -d` (`-d` es para que los contenedores se ejecuten en segundo plano). Una vez creados, podrás detenerlos y volverlos a lanzar con `docker stop [contenedor]` y `docker start [contenedor]`.

Una vez creados, es necesario **descargar el LLM** a utilizar. Por defecto, el *workflow* utiliza QWen2.5:3b y nomic-embed-text, que se descargan ejecutando `docker exec -it ollama ollama pull qwen2.5:3b` y `docker exec -it ollama ollama pull nomic-embed-text:latest`, respectivamente. Puedes ver la lista de modelos instalados en el contenedor `ollama` ejecutando `docker exec -it ollama ollama list`.


### *Troubleshooting*
Si en algún momento algo falla, prueba a **reconstruir la imagen sin utilizar cache** con:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```
## Guía de Despliegue y Configuración Técnica (n8n + Base de Datos)

Hemos integrado con éxito la capa de **Ingesta Documental y OCR** con el **Agente Inteligente de Diagnóstico Técnico** utilizando n8n y Ollama de forma local.

### Configuración Obligatoria de Credenciales (Base de Datos)
Por motivos de seguridad, n8n no exporta las credenciales de conexión al exportar el flujo en formato JSON. Al importar el workflow en vuestro entorno local, se debe configurar manualmente el nodo de **MySQL** (`Insert rows in a table`) creando una nueva credencial con los siguientes parámetros del entorno:

* **Host:** `mysql_db` *(Es crucial usar el nombre del servicio del contenedor Docker, NO localhost)*
* **Database:** `opsinsight_db`
* **User:** `admin`
* **Password:** `1234`
* **Port:** `3306`

### Estructura del Flujo de Trabajo Integrado
1. **Ingesta y Extracción:** Los formularios (PDF/Imagen) son procesados por el servicio OCR, estructurándolos en variables JSON nativas de la máquina (`tp2`, `tp3`, `corriente_motor`, `temperatura_aceite`, etc.).
2. **Filtrado y Limpieza (Nodo Limit & Code):** Se asegura la recepción de un único ítem estructurado para evitar ejecuciones duplicadas en Ollama.
3. **Agente IA Operativo:** El nodo `AI Agent` (conectado a Ollama) recibe el JSON formateado y consume el contexto del manual de la máquina para calcular automáticamente los KPIs económicos (costes por hora técnicos/externos, parada de línea) y tiempos estimados de reparación.
4. **Persistencia (MySQL):** Los resultados del diagnóstico se guardan automáticamente en la tabla `incidencias` para alimentar el cuadro de mando.


## Evolución y Optimización de la Arquitectura (Mejoras sobre la Versión Base)

Tomando como punto de partida la versión inicial del flujo desarrollada por Jose Miguel, se detectaron ineficiencias críticas de diseño asíncrono y de concurrencia en entornos locales. El workflow original sufría del "Efecto Eco" (duplicidad de ejecuciones en la base de datos) y colapsaba el rendimiento del servidor. 

A través de un rediseño centrado en la linealidad y la gestión eficiente de la memoria de n8n, se han implementado las siguientes mejoras estructurales:

### 1. Desacoplamiento del Pipeline de Ingesta del RAG (Carga del Manual)
* **Problema en la versión base:** El nodo de lectura del manual (`Read/Write Files from Disk`) compartía disparadores y flujo lineal con la entrada de incidencias. Cada vez que un operario enviaba un formulario, el sistema se veía obligado a re-leer el PDF/MD completo, re-trocearlo y recalcular miles de vectores en bucle. Esto provocaba tiempos de espera inasumibles de hasta 30 minutos por incidencia.
* **Solución implementada:** Se ha aislado por completo la rama del RAG (Ingesta Documental). El manual de la máquina ahora se procesa e indexa de forma estática una única vez. La base de datos vectorial de n8n retiene la información de manera persistente en memoria, permitiendo que el `AI Agent` acceda al contexto en milisegundos de forma invisible, sin necesidad de cables físicos de ejecución que reinicien el flujo.

### 2. Eliminación de Ejecuciones Duplicadas y Datos Residuales ("Fantasmas")
* **Problema en la versión base:** Debido a la naturaleza iterativa del nodo `AI Agent` de LangChain (que realiza varias pasadas internas para evaluar herramientas) y a la lentitud de procesamiento de los LLMs locales (Ollama con Qwen), el nodo del agente emitía dos ítems de salida de manera asíncrona: uno con el diagnóstico real y otro residual con valores en vacío debido a las cláusulas de salvaguarda del código. Esto provocaba que toda la sección de registro (`Prepare register`, `Insert rows`, etc.) se ejecutara dos veces, inyectando filas duplicadas e inventadas en MySQL (ej. Operario No Identificado).
* **Solución implementada:** Se ha introducido un nodo de unificación de flujos mediante una lógica de embudo lineal. Se ha garantizado que el agente de IA solo propague un único ítem limpio hacia los nodos de persistencia. Con esto se ha erradicado por completo la duplicidad de registros, asegurando que cada envío de formulario genere única y estrictamente una fila real en la base de datos.

### 3. Modularidad en la Ingesta de Datos (Soporte Omnicanal Real)
* **Problema en la versión base:** El flujo de datos adolecía de cruces de cables que mezclaban las variables de los reportes digitales (PDF) y manuscritos (OCR) con los del formulario online, confundiendo al agente de IA al recibir esquemas de datos híbridos.
* **Solución implementada:** Se ha reorganizado el lienzo en zonas de responsabilidad independientes mediante notas adhesivas estructuradas (Formulario Online, PDF con reporte digital, Foto con reporte manuscrito). Cada canal extrae y normaliza los datos de manera aislada antes de confluir de forma limpia en el procesador JavaScript común. Esto dota al sistema de una arquitectura robusta, escalable y preparada para producción.