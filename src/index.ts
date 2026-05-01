import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientRoutes from './routes/client.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
const allowedOrigins = [
  'http://localhost:5173',
  'https://mini-call-react.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origen (ej. curl, Postman) y los dominios configurados
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para origen: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' })); // Para permitir payloads grandes de Excel

// Rutas
app.use('/api/clientes', clientRoutes);

// Iniciar servidor localmente (Vercel ignora esto si se exporta la app)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${port}`);
  });
}

// Exportar la aplicación para Vercel Serverless Functions
export default app;
