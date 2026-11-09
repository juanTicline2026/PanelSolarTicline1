import { Router } from 'express';
import { getCotizaciones, createCotizacion } from '../controllers/cotizacionesController.ts';
import { verifyJwt } from '../middlewares/authMiddleware.ts';

const router = Router();

router.get('/', verifyJwt, getCotizaciones);
router.post('/', verifyJwt, createCotizacion);

export default router;

