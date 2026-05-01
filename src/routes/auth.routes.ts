import { Router } from 'express';
import { login, me } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.get('/me', verifyToken, me);

export default router;
