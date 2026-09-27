import { Router } from 'express';
import validators from '../middlewares/validators';
import productsController from '../controllers/products';
import auth from '../middlewares/auth';

const productRouter = Router();

productRouter.get('/', productsController.getProducts);
productRouter.post(
  '/',
  auth,
  validators.productValidator,
  productsController.createProduct,
);
productRouter.patch(
  '/:productId',
  auth,
  validators.productUpdateValidator,
  productsController.updateProduct,
);
productRouter.delete(
  '/:productId',
  auth,
  validators.productIdValidator,
  productsController.deleteProduct,
);

export default productRouter;
