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

### Instalación de n8n
Para los agentes de IA, utilizamos [n8n](https://docs.n8n.io/hosting/installation/docker/). Comenzamos por crear un **contenedor Docker** a partir de la [imagen oficial](https://hub.docker.com/r/n8nio/n8n) con:

```bash
# Crear volumen de datos persistente
docker volume create n8n_data

# Crear contenedor docker a partir de la imagen n8nio/n8n
docker run -it \
 --name n8n \
 -p 5678:5678 \
 -e GENERIC_TIMEZONE="Europe/Madrid" \
 -e TZ="Europe/Madrid" \
 -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
 -e N8N_RUNNERS_ENABLED=true \
 -v n8n_data:/home/node/.n8n \
 docker.n8n.io/n8nio/n8n
```

Una vez lanzado el contenedor, se monta el volumen `n8n_data` en `/home/node/.n8n/` (donde se guardarán los datos) y podremos crear un usuario maestro desde [http://localhost:5678/setup](http://localhost:5678/setup) y utilizar n8n desde [http://localhost:5678/home/workflows](http://localhost:5678/home/workflows). Para lanzar y parar el contenedor, puedes utilizar `docker start n8n` y `docker stop n8n`, respectivamente, o hacerlo desde Docker Desktop.

### Instalación de Ollama
También necesitarás **instalar Ollama**, el LLM utilizado por los agentes. Para ello, tal y como se indica en su [guía de inicio rápido](https://github.com/ollama/ollama/blob/main/README.md#quickstart), descarga y crea un contenedor Docker con:

```bash
docker run -d \
  --name ollama \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  ollama/ollama
```
