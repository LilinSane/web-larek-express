import { NextFunction, Request, Response } from 'express';
import NotFoundError from '../errors/not-found-error';
import Product from '../models/product';
import { deleteImageFile, moveTemporaryImage } from '../utils/product-image';

const removeImageAfterFailure = async (fileName: string | undefined) => {
  if (fileName) {
    await deleteImageFile(fileName);
  }
};

const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await Product.find();
    res.json({ items, total: items.length });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  let movedImage: string | undefined;
  let productWasCreated = false;
  try {
    movedImage = await moveTemporaryImage(req.body.image.fileName);
    const product = await Product.create({
      ...req.body,
      image: { ...req.body.image, fileName: movedImage },
    });
    productWasCreated = true;
    res.status(200).json(product);
  } catch (error) {
    if (!productWasCreated) {
      try {
        await removeImageAfterFailure(movedImage);
      } catch (cleanupError) {
        next(cleanupError);
        return;
      }
    }
    next(error);
  }
};

const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  let movedImage: string | undefined;
  let productWasUpdated = false;
  try {
    const currentProduct = await Product.findById(req.params.productId);
    if (!currentProduct) {
      throw new NotFoundError('Нет товара по заданному id');
    }

    const update = { ...req.body };
    if (update.image && update.image.fileName !== currentProduct.image.fileName) {
      movedImage = await moveTemporaryImage(update.image.fileName);
      update.image = { ...update.image, fileName: movedImage };
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      update,
      { new: true, runValidators: true },
    );
    if (!product) {
      throw new NotFoundError('Нет товара по заданному id');
    }
    productWasUpdated = true;

    if (movedImage && currentProduct.image.fileName !== movedImage) {
      const imageIsInUse = await Product.exists({
        'image.fileName': currentProduct.image.fileName,
        _id: { $ne: currentProduct._id },
      });
      if (!imageIsInUse) {
        await deleteImageFile(currentProduct.image.fileName);
      }
    }
    res.json(product);
  } catch (error) {
    if (!productWasUpdated) {
      try {
        await removeImageAfterFailure(movedImage);
      } catch (cleanupError) {
        next(cleanupError);
        return;
      }
    }
    next(error);
  }
};

const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      throw new NotFoundError('Нет товара по заданному id');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export default {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
};
