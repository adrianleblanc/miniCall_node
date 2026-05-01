import { Request, Response } from 'express';
import pool from '../config/db';

export const getClients = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const bulkInsertClients = async (req: Request, res: Response) => {
  try {
    const clients = req.body;
    
    if (!Array.isArray(clients) || clients.length === 0) {
      return res.status(400).json({ error: 'Datos inválidos o vacíos' });
    }

    // Usaremos transacciones para el bulk insert
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const insertQuery = `
        INSERT INTO clientes (rut, nombre, apellidos, telefono, estado_gestion)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const insertedClients = [];
      
      for (const c of clients) {
        const rut = c.rut || c['r.u.t'] || c['r.u.t.'] || null;
        const nombre = c.nombre || c.nombres || c.name || null;
        const apellidos = c.apellidos || c.apellido || null;
        const telefono = c.teléfono || c.telefono || c.tel || null;
        const estado_gestion = c.estado_gestion || 'Sin gestión';
        
        const result = await client.query(insertQuery, [rut, nombre, apellidos, telefono, estado_gestion]);
        insertedClients.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      res.status(201).json({ message: 'Clientes insertados correctamente', count: insertedClients.length });
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

export const updateClientStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { estado_gestion } = req.body;

    if (!estado_gestion) {
      return res.status(400).json({ error: 'El estado de gestión es requerido' });
    }

    const ultima_gestion = new Date().toISOString();

    const updateQuery = `
      UPDATE clientes 
      SET estado_gestion = $1, ultima_gestion = $2
      WHERE id = $3
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [estado_gestion, ultima_gestion, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating client status:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
