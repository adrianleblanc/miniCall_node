import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/client.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Para permitir payloads grandes de Excel

// Rutas
app.use('/api/clientes', clientRoutes);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor Backend corriendo en http://localhost:${port}`);
});
