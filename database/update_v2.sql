-- Script de actualización v2 para MiniCallCenter

-- 1. Crear tabla de historial de cargas
CREATE TABLE IF NOT EXISTS cargas_archivos (
    id SERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cantidad_registros INTEGER
);

-- 2. Añadir columna a tabla clientes
ALTER TABLE clientes ADD COLUMN carga_id INTEGER REFERENCES cargas_archivos(id) ON DELETE SET NULL;
