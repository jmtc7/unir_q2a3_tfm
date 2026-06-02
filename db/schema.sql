-- Schema de la base de datos OpsInsight
-- Base de datos: opsinsight_db
-- Ejecutar: mysql -uadmin -p1234 opsinsight_db < db/schema.sql

CREATE TABLE IF NOT EXISTS registro_incidencias (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  fecha               VARCHAR(64),
  maquina             VARCHAR(128),
  operario            VARCHAR(255),
  descripcion         TEXT,
  solucion_propuesta  TEXT,
  presion_tp2         DECIMAL(8,2),
  presion_tp3         DECIMAL(8,2),
  nivel_h1            DECIMAL(8,2),
  criticidad          VARCHAR(32),
  tiempo_estimado     VARCHAR(32),
  coste_estimado      VARCHAR(32),
  -- Campos de validación (módulo efli9/validacion-monitorizacion)
  validacion_ok       TINYINT(1) DEFAULT 1    COMMENT '1=JSON válido estructuralmente, 0=inválido',
  alertas_validacion  TEXT       DEFAULT NULL  COMMENT 'JSON con inconsistencias semánticas detectadas contra el manual'
);
