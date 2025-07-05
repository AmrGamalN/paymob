import { Router } from 'express';
import { CarController } from '../controllers/car.controller';
import { HandleError } from '@amrogamal/shared-code';
const controller = CarController.getInstance();
const { handleError } = HandleError.getInstance();
const router = Router();

router.get('/seacrh', handleError(controller.searchCar.bind(controller)));
router.get('/:id', handleError(controller.get.bind(controller)));
router.post('/mapping', handleError(controller.createMapping.bind(controller)));

export default router;
