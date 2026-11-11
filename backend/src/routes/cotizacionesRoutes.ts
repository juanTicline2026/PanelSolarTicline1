import { Router } from 'express';
import {
  getCotizaciones,
  getCotizacionById,
  createCotizacion,
  getFormulas,
  calcularCotizacion,
  getTrm,
  getRadiacion,
} from '../controllers/cotizacionesController.js';
import { verifyJwt } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/trm', getTrm);
router.get('/radiacion', getRadiacion);
router.get('/formulas', getFormulas);
router.post('/calcular', calcularCotizacion);

// Rutas protegidas con JWT: guardar y consultar cotizaciones
router.get('/', verifyJwt, getCotizaciones);
router.get('/:id', verifyJwt, getCotizacionById);
router.post('/', verifyJwt, createCotizacion);

export default router;
