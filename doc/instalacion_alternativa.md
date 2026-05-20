# Instalación Alternativa
En el caso de no querer utilizar `docker-compose` (aunque está fuertemente recomendado), se puede seguir este tutorial alternativo de instalación, que también utiliza [Docker](https://www.docker.com/).

Primero, se **crea una red Docker** ejecutando `docker network create ai-stack`. Esta red se utilizará desde todos los contenedores para que puedan comunciarse entre ellos.

A continuación, se **instala [n8n](https://docs.n8n.io/hosting/installation/docker/)** creando un contenedor a partir de la [imagen oficial](https://hub.docker.com/r/n8nio/n8n), configurándolo para utilizar un volumen de datos persistente y la red Docker creada con:

```bash
# Crear volumen de datos persistente
docker volume create n8n_data

# Crear y lanzar contenedor n8n
docker run -it \
    --name n8n \
    --network ai-stack \
    -p 5678:5678 \
    -e GENERIC_TIMEZONE="Europe/Madrid" \
    -e TZ="Europe/Madrid" \
    -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true \
    -e N8N_RUNNERS_ENABLED=true \
    -v n8n_data:/home/node/.n8n \
    docker.n8n.io/n8nio/n8n
```

Después, necesitarás **instalar Ollama** en otro contenedor para ejecutar los LLMs utilizados por los agentes. Para ello, tal y como se indica en su [guía de inicio rápido](https://github.com/ollama/ollama/blob/main/README.md#quickstart), descarga y crea un contenedor Docker con:

```bash
# Crear y lanzar contenedor ollama
docker run -d \
    --name ollama \
    --network ai-stack \
    -p 11434:11434 \
    -v ollama:/root/.ollama \
    ollama/ollama
```

Finalmente, también necesitarás descargar los LLMs utilizados. Para QWen2.5:3b, ejecuta `docker exec -it ollama ollama pull qwen2.5:3b`.

Una vez hecho todo esto, n8n estará disponible en [localhost:5678](http://localhost:5678) Ollama en [ollama:11434](http://ollama:11434). Podrás detener los contenedores y volverlos a lanzar con `docker stop [contenedor]` y `docker start [contenedor]`.
