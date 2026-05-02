import { Request, Response } from 'express';
import pool from '../config/db';

export const getClients = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT c.*, u.nombre as gestionado_por
      FROM clientes c
      LEFT JOIN usuarios u ON c.ultimo_usuario_id = u.id
      ORDER BY c.id ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const bulkInsertClients = async (req: Request, res: Response) => {
  try {
    const { clients, fileName } = req.body;
    
    if (!Array.isArray(clients) || clients.length === 0) {
      return res.status(400).json({ error: 'Datos inválidos o vacíos' });
    }

    const archivo_nombre = fileName || 'Carga manual / sin nombre';

    // Usaremos transacciones para el bulk insert
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // 1. Registrar la carga
      const insertCargaQuery = `
        INSERT INTO cargas_archivos (nombre_archivo, cantidad_registros)
        VALUES ($1, $2)
        RETURNING id
      `;
      const cargaResult = await client.query(insertCargaQuery, [archivo_nombre, clients.length]);
      const cargaId = cargaResult.rows[0].id;

      // 2. Insertar clientes
      const insertQuery = `
        INSERT INTO clientes (rut, nombre, apellidos, telefono, estado_gestion, carga_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const insertedClients = [];

      // Helper: normaliza el objeto del Excel para buscar keys sin importar mayusculas/minusculas
      const normalizeRow = (row: Record<string, unknown>): Record<string, unknown> => {
        const normalized: Record<string, unknown> = {};
        for (const key of Object.keys(row)) {
          // Eliminar espacios y acentos comunes, convertir a minusculas
          normalized[key.toLowerCase().trim()] = row[key];
        }
        return normalized;
      };
      
      for (const rawRow of clients) {
        const c = normalizeRow(rawRow as Record<string, unknown>);
        // Buscar variaciones comunes de cada columna
        const rut = c['rut'] || c['r.u.t'] || c['r.u.t.'] || c['rut.'] || null;
        const nombre = c['nombre'] || c['nombres'] || c['name'] || c['first name'] || null;
        const apellidos = c['apellidos'] || c['apellido'] || c['last name'] || c['surname'] || null;
        const telefono = c['teléfono'] || c['telefono'] || c['télefono'] || c['tel'] || c['phone'] || c['celular'] || c['móvil'] || c['movil'] || null;
        const estado_gestion = (c['estado_gestion'] as string) || 'Sin gestión';
        
        const result = await client.query(insertQuery, [rut, nombre, apellidos, telefono, estado_gestion, cargaId]);
        insertedClients.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      res.status(201).json({ 
        message: 'Clientes insertados correctamente', 
        carga_id: cargaId,
        count: insertedClients.length 
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in bulk insert:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const updateClientStatus = async (req: Request & { userId?: number }, res: Response) => {
  const { id } = req.params;
  const { estado_gestion, observacion } = req.body;
  const usuario_id = req.userId;

  if (!estado_gestion) {
    return res.status(400).json({ error: 'El estado de gestión es requerido' });
  }

  const dbClient = await pool.connect();
  try {
    await dbClient.query('BEGIN');

    // 1. Obtener estado anterior
    const currentResult = await dbClient.query('SELECT estado_gestion FROM clientes WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      await dbClient.query('ROLLBACK');
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    const estado_anterior = currentResult.rows[0].estado_gestion;

    // 2. Actualizar cliente
    const ultima_gestion = new Date();
    const updateQuery = `
      UPDATE clientes 
      SET estado_gestion = $1, ultima_gestion = $2, ultimo_usuario_id = $3
      WHERE id = $4
      RETURNING *
    `;
    const updateResult = await dbClient.query(updateQuery, [estado_gestion, ultima_gestion, usuario_id, id]);

    // 3. Registrar en historial
    const historyQuery = `
      INSERT INTO historial_gestiones (cliente_id, usuario_id, estado_anterior, estado_nuevo, observacion)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await dbClient.query(historyQuery, [id, usuario_id, estado_anterior, estado_gestion, observacion || null]);

    await dbClient.query('COMMIT');
    res.json(updateResult.rows[0]);
  } catch (error) {
    await dbClient.query('ROLLBACK');
    console.error('Error updating client status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    dbClient.release();
  }
};
