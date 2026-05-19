# Manual de la Máquina MetroPT-3

## Descripción de las Variables Monitorizadas
El panel de control de la máquina informa a los operarios del valor de múltiples variables. Las unidades de las presiones son bares (bar), la de la corriente eléctrica son amperios (A) y la de la temperatura son grados centígrados (ºC). Las variables monitorizadas se identifican con las siguientes abreviaciones:
- Presiones:
  - TP2: Presión del compresor.
  - TP3: Presión generada en el panel neumático.
  - H1: Presión generada por la caída de presión que ocurre al descargar el filtro del separador ciclónico.
  - DV: Caída de presión generada cuando las torres descargan los secadores de aire.
  - R: Presión del depósito de aire, alimentado por la Unidad de Producción de Aire (APU).
- Señales eléctricas:
  - COMP: Señal de la válvula de toma de aire del compresor.
  - DV electric: Señal de la salida del compresor. 
  - TOWERS: Señal que indica la torre responsable de secar el aire.
  - MPG: Señal que lanza el compresor bajo carga activando la válvula de toma de aire.
  - LPS: Señal que detecta presión inferior a 7 bares.
  - Pressure Switch: Señal que detecta descargas de las torres de secado.
  - Oil Level: Señal que indica un nivel de aceite inferior al esperado.
- Corriente del motor: Corriente de una de las fases del motor trifásico. 
- Temperatura del aceite en el compresor.


---

## Condiciones de Operación Normales
A continuación se enumeran los valores que se espera tener en las variables monitorizadas cuando no hay ningún problema:
- Presiones:
  - DV debe de ser 0 bares cuando el compresor está operando bajo carga.
  - R debe de ser cercana a la TP3 (la presión del panel neumático).
- Señales eléctricas:
  - COMP se activa cuando NO se recibe aire, indicando que el compresor está apagado u operando sin carga.
  - DV electric se activa cuando el compresor está funcionando bajo carga. Se desactiva cuando el compresor está apagado u operando sin carga.
  - TOWERS: Cuando está apagada, la torre 1 está funcionando. Cuando está encendida, la torre 2 está funcionando.
  - MPG: Cuando la presión en la Unidad de Producción de Aire (APU) cae bajo 8.2 bares, activa el sensor COMP, que asume el mismo funcionamiento que el sensor MPG.
  - LPS: Se enciende si la presión es inferior a 7 bares.
  - Pressure switch: Se enciende si está ocurriendo una descarga en las torres de secado.
  - Oil level: Se enciende si el nivel de aceite está por debajo del nivel esperado.
- Corriente I del motor. Debe tener valores cercanos a los siguientes:
  - 0 amperios cuando se apaga.
  - 4 amperios cuando está operando sin carga.
  - 7 amperios cuando está operando bajo carga.
  - 9 amperios cuando empieza a operar.


---

## Ejemplos de Fallo
TODO
