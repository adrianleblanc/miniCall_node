-- Script de actualización V3: Historial de Gestiones

-- 1. Añadir columna a clientes para saber quién hizo la última gestión
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS ultimo_usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL;

-- 2. Crear tabla de historial detallado
CREATE TABLE IF NOT EXISTS historial_gestiones (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    estado_anterior VARCHAR(50),
    estado_nuevo VARCHAR(50),
    fecha_gestion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observacion TEXT
);
