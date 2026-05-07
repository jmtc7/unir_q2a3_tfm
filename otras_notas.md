# Comparativa de Herramientas
**Agentes**: n8n es más potente y flexible que ActivePieces, pero este último es más sencillo de utilizar, ya que está enfocado a perfiles menos técnicos. Dada la experiencia de los integrantes del equipo, se escoje utilizar n8n por la potencia y flexibilidad que ofrece.

**LLMs**: **Llama** permite ejecutarlo en local, otorgando privacidad total para datos críticos, no necesitar pagar una API ni conexión a Internet para utilizarlo. Además, también está muy optimizado y es fácil de integrar con otros *scripts* ejecutándose localmente.

**Codificadores de visión**: **CLIP** permite relacionar imágenes con texto. Por ejemplo, para buscar todas las imágenes en las que aparezca cierta cadena de texto. **SigLIP** es una mejora de Google sobre CLIP que incrementa su precisión gracias a un entrenamiento basado en sigmoides en lugar de en *softmax*, mejorando la fiabilidad. Cabe destacar que CLIP suele ser la elección estándar dada su estabilidad, consistencia y gran compatibilidad. Esto hace que existan muchos ejemplos y tutoriales en línea. Por su parte, SigLIP permite ir un paso más allá con respecto al rendimiento y utilizar *batches* más grandes, aumentando la eficiencia de los entrenos.

**Visualización**: **Streamlit** permite avanzar rápido y facilita la conectividad con módulos de IA y/o OCR. También permite mostrar imágenes, PDFs, chats, logs, etc., lo que facilitaría mostrar los informes generados y las evidencias visuales asociadas a los indicadores. **Dash**, por su parte, permite más control visual, robustez, *callbacks* complejos, múltiples usuarios y escalabilidad. Ambos son gratuitos y de código abierto.


---

# TODO
- Añadir BBDD (SQL o NoSQL) a tecnologías?
- Añadir cómo se pretenden analizar los resultados de cada fase?
- Añadir tipología de trabajo - metodología ágil o tradicional, como Scrum, XP, Proceso Unificado, Métrica v.3, RUP, MSF, Kanban, Scrumban, SAFe o Lean?
- Añadir modelo de desarrollo de software, como espiral, iterativo e incremental o CBSE?
- Añadir si se seguirá una metodología de desarrollo CRISP-DM (común para proyectos de análisis de datos)?
- **Actualizar tecnologías** :
  - **OCR**: Docling, Surya o EasyOCR
  - **LLM locales (vía Ollama)**: Qwen3 7B, Mistral Small 3, Phi-4-mini
  - **Entorno de ejecución**: Local + Ollama, Google Colab gratuito (T4 GPU), Colab Pro

---

# Fuentes de Datos Propuestas
  - Para datos tabulares de mantenimiento y fallos, una fuente muy útil es el AI4I 2020 Predictive Maintenance Dataset del UCI Machine Learning Repository, disponible en https://archive.ics.uci.edu/dataset/601/ai4i+2020+predictive+maintenance+dataset. Esta fuente es apropiada porque ofrece un punto de partida estructurado para analizar comportamiento de fallo, criticidad y variables de proceso.
  - Otra opción interesante es el MetroPT-3 Dataset, también en UCI, accesible en https://archive.ics.uci.edu/dataset/791/metropt+3+dataset, adecuado para trabajar series temporales y comportamiento de fallos en contexto industrial.
  - Para un contexto más orientado a degradación y prognóstico, puede utilizarse el repositorio de la NASA para datos de fallo y mantenimiento predictivo, especialmente el Prognostics Data Repository, accesible en https://ti.arc.nasa.gov/tech/dash/groups/pcoe/prognostic-data-repository/ y complementado por el portal general de datos de NASA en https://data.nasa.gov/. Estas fuentes son valiosas porque permiten construir un bloque analítico más rico y conectarlo con tendencias de degradación o fallo.
    - No será https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pcoe/pcoe-data-set-repository/?
    - No será https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://data.nasa.gov/&ved=2ahUKEwiF9p7FzO-TAxVAgP0HHa6YLxYQFnoECA0QAQ&usg=AOvVaw0-HqKpfyV9zqTGgpqYgrGP ?
  - Buscadores de manuales:
    - Para la parte documental, una fuente abierta muy conocida es ManualsLib, en https://www.manualslib.com/, que proporciona manuales técnicos de numerosos equipos y fabricantes.
    - También puede utilizarse la colección de manuales de Internet Archive, accesible en https://archive.org/details/manuals.
    - Como fuentes adicionales de documentación pública, el equipo puede revisar portales de fabricantes como Siemens Industry Support, disponible en https://support.industry.siemens.com/, Schneider Electric Download Center, en https://www.se.com/ww/en/download/, o ABB Library, en https://library.abb.com/.


---

# Acrónimos
DL - Deep Learning o aprendizaje profundo
IA - Inteligencia Artificial
OCR - Optical Character Recognition o reconocimiento óptico de caracteres
CNN - Convolutional Neural Network o red neuronal convolucional
LLM - Large Language Model o gran modelo de lenguaje. Modelos de IA que procesan y/o generan texto, como GPT-4, LLaMA o BERT.
VLM - Vision Language Model o modelo de lenguaje visual. Combina modelos de IA de visión artificial con modelos LLM.
