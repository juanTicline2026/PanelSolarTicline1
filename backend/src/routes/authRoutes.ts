import { Router } from 'express';
import { login, getMe } from '../controllers/authController.ts';
import { verifyJwt } from '../middlewares/authMiddleware.ts';

const router = Router();

router.post('/login', login);
router.get('/me', verifyJwt, getMe);

export default router;

