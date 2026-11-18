import { Router } from 'express';
import { login, getMe } from '../controllers/authController.js';
import { verifyJwt } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/me', verifyJwt, getMe);

export default router;
