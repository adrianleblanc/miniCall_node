import { Router } from 'express';
import { getClients, bulkInsertClients, updateClientStatus } from '../controllers/client.controller';

const router = Router();

router.get('/', getClients);
router.post('/bulk', bulkInsertClients);
router.put('/:id/estado', updateClientStatus);

export default router;
