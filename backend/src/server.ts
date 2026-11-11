import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.ts';
import cotizacionesRoutes from './routes/cotizacionesRoutes.ts';
import { initDatabase, isPostgresConnected } from './config/db.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);

// Middleware CORS y JSON
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

// Rutas de la API
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'panelsolar-backend',
    postgresConnected: isPostgresConnected,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/cotizaciones', cotizacionesRoutes);

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Backend Panel Solar activo en http://localhost:${PORT}`);
  });
});
