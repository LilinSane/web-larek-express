import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/bad-request-error';
import Product from '../models/product';

interface IOrderRequest {
  payment: 'card' | 'online';
  email: string;
  phone: string;
  address: string;
  total: number;
  items: string[];
}

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const order = req.body as IOrderRequest;

    const products = await Product.find({ _id: { $in: order.items } });
    const productsById = new Map(products.map((product) => [product.id, product]));
    const orderedProducts = order.items.map((id) => productsById.get(id));
    const missingItem = order.items.find((id) => !productsById.has(id));
    if (missingItem) {
      throw new BadRequestError(`Товар с id ${missingItem} не найден`);
    }

    const productWithoutPrice = orderedProducts.find(
      (product) => product?.price == null,
    );
    if (productWithoutPrice) {
      throw new BadRequestError(`Товар с id ${productWithoutPrice.id} не продается`);
    }

    const calculatedTotal = orderedProducts.reduce(
      (sum, product) => sum + (product?.price ?? 0),
      0,
    );
    if (calculatedTotal !== order.total) {
      throw new BadRequestError('Неверная сумма заказа');
    }

    res.json({ id: randomUUID(), total: calculatedTotal });
  } catch (error) {
    next(error);
  }
};

export default createOrder;
