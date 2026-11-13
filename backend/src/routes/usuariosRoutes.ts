import { Router } from 'express';
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  updateUsuarioPermisos,
  getCatalogoPermisos,
} from '../controllers/usuariosController.js';
import { verifyJwt } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/catalogo-permisos', verifyJwt, getCatalogoPermisos);
router.get('/', verifyJwt, getUsuarios);
router.post('/', verifyJwt, createUsuario);
router.put('/:id', verifyJwt, updateUsuario);
router.delete('/:id', verifyJwt, deleteUsuario);
router.put('/:id/permisos', verifyJwt, updateUsuarioPermisos);

export default router;

