import { Request, Response } from 'express';
import pool from '../config/db';

export const getReportsSummary = async (req: Request, res: Response) => {
  try {
    // 1. KPIs Generales
    const kpiQuery = `
      SELECT 
        COUNT(*) as total_clientes,
        COUNT(CASE WHEN estado_gestion = 'Gestionado' THEN 1 END) as total_gestionados,
        COUNT(CASE WHEN estado_gestion = 'Sin gestión' THEN 1 END) as total_pendientes
      FROM clientes
    `;
    const kpiResult = await pool.query(kpiQuery);

    // 2. Gestiones por Usuario (Productividad)
    const productivityQuery = `
      SELECT 
        u.nombre,
        COUNT(h.id) as cantidad_gestiones
      FROM usuarios u
      LEFT JOIN historial_gestiones h ON u.id = h.usuario_id
      GROUP BY u.id, u.nombre
      ORDER BY cantidad_gestiones DESC
    `;
    const productivityResult = await pool.query(productivityQuery);

    // 3. Gestiones de HOY
    const todayQuery = `
      SELECT COUNT(*) as gestiones_hoy
      FROM historial_gestiones
      WHERE fecha_gestion >= CURRENT_DATE
    `;
    const todayResult = await pool.query(todayQuery);

    // 4. Últimas 10 gestiones
    const latestQuery = `
      SELECT 
        h.fecha_gestion,
        h.estado_nuevo,
        u.nombre as usuario_nombre,
        c.nombre as cliente_nombre,
        c.apellidos as cliente_apellidos
      FROM historial_gestiones h
      JOIN usuarios u ON h.usuario_id = u.id
      JOIN clientes c ON h.cliente_id = c.id
      ORDER BY h.fecha_gestion DESC
      LIMIT 10
    `;
    const latestResult = await pool.query(latestQuery);

    res.json({
      kpis: kpiResult.rows[0],
      productividad: productivityResult.rows,
      hoy: todayResult.rows[0].gestiones_hoy,
      ultimasGestiones: latestResult.rows
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
