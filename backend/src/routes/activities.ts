import { Router } from 'express';
import { listActivities, getActivity, getActivityFilters } from '../controllers/activitiesController';

const router = Router();

router.get('/filters', getActivityFilters);
router.get('/', listActivities);
router.get('/:id', getActivity);

export default router;
