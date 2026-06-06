import { Router } from 'express';
import { listPlans, createPlan, getPlan, updatePlan } from '../controllers/plansController';

const router = Router();

router.get('/', listPlans);
router.post('/', createPlan);
router.get('/:id', getPlan);
router.patch('/:id', updatePlan);

export default router;
