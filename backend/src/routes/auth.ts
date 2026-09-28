import { Router } from 'express';
import authController from '../controllers/auth';
import auth from '../middlewares/auth';
import validators from '../middlewares/auth-validators';

const authRouter = Router();

authRouter.post('/login', validators.loginValidator, authController.login);
authRouter.post('/register', validators.registerValidator, authController.register);
authRouter.get('/token', validators.refreshTokenValidator, authController.refreshAccessToken);
authRouter.get('/logout', validators.refreshTokenValidator, authController.logout);
authRouter.get('/user', auth, authController.getCurrentUser);

export default authRouter;
