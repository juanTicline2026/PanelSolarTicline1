import { Router } from 'express';
import {
  getCotizaciones,
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
router.get('/', verifyJwt, getCotizaciones);
router.post('/', verifyJwt, createCotizacion);

export default router;
