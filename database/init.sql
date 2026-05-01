-- Script para inicializar la base de datos de MiniCallCenter

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    rut VARCHAR(20),
    nombre VARCHAR(100),
    apellidos VARCHAR(100),
    telefono VARCHAR(50),
    estado_gestion VARCHAR(50) DEFAULT 'Sin gestión',
    ultima_gestion TIMESTAMP
);
