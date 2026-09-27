import { Router } from 'express';
import orderRouter from './order';
import productRouter from './product';
import authRouter from './auth';
import uploadRouter from './upload';

const routes = Router();

routes.use('/product', productRouter);
routes.use('/order', orderRouter);
routes.use('/auth', authRouter);
routes.use('/upload', uploadRouter);

export default routes;
