import { Router } from 'express';
import {
  getCotizaciones,
  getCotizacionById,
  createCotizacion,
  updateCotizacion,
  deleteCotizacion,
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

// Rutas protegidas con JWT: CRUD completo de cotizaciones
router.get('/', verifyJwt, getCotizaciones);
router.get('/:id', verifyJwt, getCotizacionById);
router.post('/', verifyJwt, createCotizacion);
router.put('/:id', verifyJwt, updateCotizacion);
router.delete('/:id', verifyJwt, deleteCotizacion);

export default router;
