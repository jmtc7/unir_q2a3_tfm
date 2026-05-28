# Manual de la Máquina MetroPT-3

## Descripción de las Variables Monitorizadas
El panel de control de la máquina informa a los operarios del valor de múltiples variables. Las unidades de las presiones son bares (bar), la de la corriente eléctrica son amperios (A) y la de la temperatura son grados centígrados (ºC). Las variables monitorizadas se identifican con las siguientes abreviaciones:
- **Presiones**:
  - `TP2`: Presión del compresor.
  - `TP3`: Presión generada en el panel neumático.
  - `H1`: Presión generada por la caída de presión que ocurre al descargar el filtro del separador ciclónico.
  - `DV`: Caída de presión generada cuando las torres descargan los secadores de aire.
  - `R`: Presión del depósito de aire, alimentado por la Unidad de Producción de Aire (APU).
- **Señales eléctricas**:
  - `COMP`: Señal de la válvula de toma de aire del compresor.
  - `DV Electric`: Señal de la salida del compresor. 
  - `TOWERS`: Señal que indica la torre responsable de secar el aire.
  - `MPG`: Señal que lanza el compresor bajo carga activando la válvula de toma de aire.
  - `LPS`: Señal que detecta presión inferior a 7 bares.
  - `Pressure Switch`: Señal que detecta descargas de las torres de secado.
  - `Oil Level`: Señal que indica un nivel de aceite inferior al esperado.
- **Corriente del motor**: Corriente de una de las fases del motor trifásico. 
- **Temperatura del aceite** en el compresor.


---

## Condiciones de Operación Normales
A continuación se enumeran los valores que se espera tener en las variables monitorizadas cuando no hay ningún problema:
- Presiones:
  - `DV` debe de ser 0 bares cuando el compresor está operando bajo carga.
  - `R` debe de ser cercana a la TP3 (la presión del panel neumático).
- Señales eléctricas:
  - `COMP` se activa cuando NO se recibe aire, indicando que el compresor está apagado u operando sin carga.
  - `DV Electric` se activa cuando el compresor está funcionando bajo carga. Se desactiva cuando el compresor está apagado u operando sin carga.
  - `TOWERS`: Cuando está apagada, la torre 1 está funcionando. Cuando está encendida, la torre 2 está funcionando.
  - `MPG`: Cuando la presión en la Unidad de Producción de Aire (APU) cae bajo 8.2 bares, activa el sensor COMP, que asume el mismo funcionamiento que el sensor MPG.
  - `LPS`: Se enciende si la presión es inferior a 7 bares.
  - `Pressure switch:` Se enciende si está ocurriendo una descarga en las torres de secado.
  - `Oil level`: Se enciende si el nivel de aceite está por debajo del nivel esperado.
- La **corriente del motor** debe de tener valores cercanos a los siguientes:
  - 0 amperios cuando se apaga.
  - 4 amperios cuando está operando sin carga.
  - 7 amperios cuando está operando bajo carga.
  - 9 amperios cuando empieza a operar.

#### Matriz de Tiempos y Recursos de Reparación (Cálculo de MTTR)
Para la gestión del mantenimiento y el cálculo del Tiempo Medio de Reparación (MTTR), se establecen los siguientes tiempos estándar:
| Tipo de Intervención | Tiempo Estimado (Horas) | Personal Requerido |
| :--- | :--- | :--- |
| Calibración de sensores (LPS, TP2, TP3) | 0.5 - 1.0 h | 1 Técnico |
| Rellenado de aceite y limpieza de filtros | 2.0 h | 1 Técnico |
| Sustitución de válvulas (DV Electric, COMP) | 4.0 h | 2 Técnicos |
| Intervención en Motor Trifásico o Compresor | 8.0 - 12.0 h | Especialista |
---

#### Guía de Resolución de Problemas (Troubleshooting) y Fallos
A continuación se detallan los escenarios de fallo detectados para la MetroPT-3:

##### 1. Caída de Presión Crítica (Fuga Masiva)
*   **Síntomas:** Señal **LPS** encendida (presión < 7 bar) y Presión **R** significativamente inferior a **TP3**.
*   **Causa probable:** Fuga en el depósito de aire o fallo total en la válvula de descarga.
*   **Criticidad:** **Alta**.
*   **Procedimiento:** Parada de emergencia inmediata. Localizar fuga en depósito R y revisar estanqueidad de DV.
*   **Tiempo estimado:** 4.0 h.

##### 2. Fallo de Lubricación y Sobrecalentamiento
*   **Síntomas:** Señal **Oil Level** encendida y **Temperatura del aceite** > 90ºC.
*   **Causa probable:** Fuga de lubricante o fallo en el sistema de refrigeración del compresor.
*   **Criticidad:** **Alta**.
*   **Procedimiento:** Detener el equipo. Verificar niveles de aceite y buscar obstrucciones en el circuito de refrigeración.
*   **Tiempo estimado:** 2.0 h.

##### 3. Fallo Eléctrico en Válvula de Carga
*   **Síntomas:** La señal **COMP** permanece encendida mientras el motor está a 7A (bajo carga).
*   **Causa probable:** Fallo eléctrico en el solenoide de la válvula de toma de aire.
*   **Criticidad:** **Media**.
*   **Procedimiento:** Revisar conexiones eléctricas de la válvula COMP y MPG. Sustituir solenoide si es necesario.
*   **Tiempo estimado:** 1.0 h.

##### 4. Desgaste Mecánico Preventivo
*   **Síntomas:** Reporte de "ruido extraño" o vibración, pero la **Corriente del motor** y las **Presiones** están en rangos nominales [2].
*   **Causa probable:** Desgaste inicial en correas o rodamientos.
*   **Criticidad:** **Baja**.
*   **Procedimiento:** Programar inspección visual en la siguiente ventana de mantenimiento. No requiere parada inmediata.
*   **Tiempo estimado:** 0.5 h.

---

#### Definición del Índice de Criticidad (OE7)
Para la priorización en el Dashboard, cada incidencia se clasificará según este índice:

1.  **ALTA (Puntuación: 3):** Fallos que comprometen la seguridad, implican parada total del sistema de aire del metro o riesgo de rotura del motor (ej. LPS persistente o Oil Level).
2.  **MEDIA (Puntuación: 2):** Fallos que degradan el rendimiento pero permiten la operación temporal (ej. fallos en la alternancia de TOWERS).
3.  **BAJA (Puntuación: 1):** Avisos preventivos, ruidos o desviaciones menores que no afectan a las variables críticas de presión.

---

#### Estimación de Costes de Intervención (KPI Económico)
Para el cálculo del impacto económico de las incidencias, se aplicarán los siguientes costes estándar:

| Concepto | Coste Unitario | Notas |
| :--- | :--- | :--- |
| Mano de Obra Técnica | 45 €/hora | Aplicable a técnicos internos. |
| Especialista Externo | 90 €/hora | Requerido para fallos en motor o APU. |
| Kit de Filtros y Aceite | 120 € | Material fungible básico. |
| Solenoide/Válvula Repuesto | 350 € | Coste medio de componentes neumáticos. |
| Parada de Línea No Programada | 500 €/hora | Coste de oportunidad por indisponibilidad. |


---

#### Protocolos de Seguridad y Parada de Emergencia
En caso de fallos clasificados como **ALTA** criticidad, el operario debe seguir el protocolo LOTO (Lockout/Tagout):

1.  **Desactivación:** Accionar la seta de emergencia y cortar el suministro eléctrico del motor.
2.  **Purgado:** Vaciar el depósito **R** manualmente si la presión **TP3** es inestable para evitar explosiones.
3.  **Bloqueo:** Colocar candado de seguridad en el interruptor principal antes de cualquier inspección física en el compresor.

---

#### Lógica de Correlación de Variables (Diagnóstico Avanzado)
*   **Relación Presión-Carga:** Si la corriente del motor sube a **9A** pero la presión **TP2** no aumenta, existe una obstrucción mecánica o fallo en la transmisión.
*   **Relación Temperatura-Aceite:** Un incremento rápido de temperatura (>5ºC en 10 min) sin cambio en la carga indica degradación crítica del aceite o fallo del ventilador.
*   **Relación LPS-Depósito:** Si **LPS** se activa pero el motor está a **7A**, el fallo es de estanqueidad (fuga masiva) y no de potencia eléctrica.


