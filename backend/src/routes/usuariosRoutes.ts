import { Router } from 'express';
import { getUsuarios, updateUsuarioPermisos, getCatalogoPermisos } from '../controllers/usuariosController.js';
import { verifyJwt } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/catalogo-permisos', verifyJwt, getCatalogoPermisos);
router.get('/', verifyJwt, getUsuarios);
router.put('/:id/permisos', verifyJwt, updateUsuarioPermisos);

export default router;

