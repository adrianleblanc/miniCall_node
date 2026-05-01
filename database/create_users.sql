-- Script para crear la tabla de usuarios en MiniCallCenter

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'agente',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuario de prueba: admin@minicallcenter.com / Admin1234
-- Contraseña hasheada con bcrypt (10 salt rounds)
INSERT INTO usuarios (nombre, email, password_hash, rol)
VALUES (
    'Administrador',
    'admin@minicallcenter.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin'
) ON CONFLICT (email) DO NOTHING;
