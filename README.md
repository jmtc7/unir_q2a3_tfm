# Trabajo de Final de Máster (TFM)
Este repositorio continene información, datos y documentos desarrollados para mi TFM del máster en Big Data y Visual Analytics de la UNIR. Los archivos se estructuran de la siguiente forma:
- [`datos/`](datos/): Carpeta con los **datos** utilizados para desarrollar y testear la solución. Algunos de los archivos clave son:
  - [`plantilla_reporte_incidencia.odt`](datos/plantilla_reporte_incidencia.odt): Plantilla que los usuarios utilizarán para reportar incidencias. Puede rellenarse virtualmente y generar un PDF a partir de ella o imprimirse para rellenarse a mano y darle al sistema una foto del formulario rellenado a mano.
  - [`ejemplo_incidencia.pdf`](datos/ejemplo_incidencia.pdf): Ejemplo de un reporte de incidencia digital en PDF que deberá ser tratado por el agente de ingesta documental para generar un JSON con la información clave.
  - [`ejemplo_incidencia.json`](datos/ejemplo_incidencia.json): Ejemplo de JSON que deberá generar el agente de ingesta y que debe recibir el agente de análisis documental.
  - [`manual_MetroPT3.md`](datos/manual_MetroPT3.md): Manual en MarkDown de una supuesta máquina MetroPT3. Se basa en los datos del [dataset MetroPT3](https://archive.ics.uci.edu/dataset/791/metropt+3+dataset), que contiene datos reales de la Unidad de Producción de Aire (APU) de un metro.
- [`doc/`](doc/): Carpeta con **documentación** detallada sobre:
  - [`propuesta.md`](doc/propuesta.md): La **propuesta de TFM escogida**, incluyendo sus objetivos, metodología y entregables.
  - [`entregas.md`](doc/entregas.md): El **contenido** esperado en cada una **de las entregas intermedias** a realizar.
  - [`desarrollo.md`](doc/desarrollo.md): Detalles técnicos sobre el desarrollo del trabajo.

El trabajo consiste en un sistema que ayude a los operarios de una planta industrial a reaccionar ante incidencias con máquinas complejas. Además, este sistema, registra dichas incidencias y facilita su inspeción y análisis a través de un *dashboard*.


## Arquitectura 
La arquitectura se basa en un **agente IA que ingiera PDFs** con reportes de incidencias y **genere JSONs** con la información clave, que luego se le pasan a **otro** agente que **consulta los manuales para proponer una acción** al operario. Las incidencias se **registran en un CSV y en una base de datos** relacional SQL. En base a esta, se ofrece un ***dashboard*** con el **registro** de incidencias así como varios **KPIs y gráficas** y facilitan su análisis. Esto se representa en el siguiente esquema:

<p align="center">
  <img src="imgs/arquitectura/arquitectura.drawio.png" height="200">
</p>


## Guía de Instalación y Uso
### Prerrequisitos
Como **prerrequisitos**, se asume que ya se dispone de una **instalación funcional de [Docker Desktop](https://www.docker.com/products/docker-desktop/)**.

### Instalación (con Docker)
El *workflow* está automatizado con [n8n](https://n8n.io), desde donde se utilizan LLMs ejecutados en local con [Ollama](https://ollama.com/). Para utilizar este *stack*, se utilizan **contenedores [Docker](https://www.docker.com/)**. Gran parte de la instalación está automatizada el archivo [`docker-compose.yaml`](docker-compose.yaml), que realiza lo siguiente:
- Crea un **contenedor `ollama`** que abrirá un **servicio** en [ollama:11434](http://ollama:11434). Este se basa en la **imagen** [ollama/ollama](https://hub.docker.com/r/ollama/ollama). También se crea un **volumen de datos** persistente llamado `ollama` que se aloja en `/root/.ollama`.
- Crea un **contenedor `n8n`**, con **servicio** en [localhost:5678](http://localhost:5678), basado en la **imagen** [n8nio/n8n](https://hub.docker.com/r/n8nio/n8n) y que usa el **volumen** `n8n_data` (alojado en `/home/node/.n8n`). También se configuran varias **variables de entorno**, incluyendo el uso de la zona horaria `Europe/Madrid`. Finalmente, se le declara como **dependiente** del contenedor `ollama` para que puedan comunicarse.

> **Instalación alternativa**: La instalación con Docker Compose es fuertemente recomendada por su simplicidad, reproducibilidad y manejo automático de redes Docker y volúmenes de datos. Sin embargo, si por cualquier motivo NO quieres utilizar Docker Compose, puedes seguir el [tutorial de instalación alternativo](doc/instalacion_alternativa.md).

Para **crear estos contenedores** y ejecutarlos, debes utilizar `docker compose up -d` (`-d` es para que los contenedores se ejecuten en segundo plano). Una vez creados, podrás detenerlos y volverlos a lanzar con `docker stop [contenedor]` y `docker start [contenedor]`.

Una vez creados, es necesario **descargar el LLM** a utilizar. Por defecto, el *workflow* utiliza QWen2.5:3b, que se descarga ejecutando `docker exec -it ollama ollama pull qwen2.5:3b`. Puedes ver la lista de modelos instalados en el contenedor `ollama` ejecutando `docker exec -it ollama ollama list`.
