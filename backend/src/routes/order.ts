import { Router } from 'express';
import createOrder from '../controllers/order';
import validators from '../middlewares/validators';

const orderRouter = Router();

orderRouter.post('/', validators.orderValidator, createOrder);

export default orderRouter;
