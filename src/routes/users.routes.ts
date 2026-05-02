import { Router } from 'express';
import { getUsers, createUser, updateUserStatus } from '../controllers/users.controller';
import { verifyToken, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas de usuarios requieren ser Admin
router.use(verifyToken, requireRole('admin'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id/status', updateUserStatus);

export default router;
