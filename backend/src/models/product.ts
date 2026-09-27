import mongoose, { Schema } from 'mongoose';
import { deleteImageFile } from '../utils/product-image';

interface IProductImage {
  fileName: string;
  originalName: string;
}

interface IProduct {
  title: string;
  image: IProductImage;
  category: string;
  description?: string;
  price: number | null;
}

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Поле "title" должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля "title" - 2'],
      maxlength: [30, 'Максимальная длина поля "title" - 30'],
      unique: true,
    },
    image: {
      fileName: { type: String, required: [true, 'Поле "fileName" должно быть заполнено'] },
      originalName: { type: String, required: [true, 'Поле "originalName" должно быть заполнено'] },
    },
    category: { type: String, required: [true, 'Поле "category" должно быть заполнено'] },
    description: { type: String },
    price: { type: Number, default: null },
  },
  {
    versionKey: false,
  },
);

productSchema.post('findOneAndDelete', async (product) => {
  if (!product?.image?.fileName) {
    return;
  }

  const imageIsInUse = await mongoose.model('product').exists({
    'image.fileName': product.image.fileName,
    _id: { $ne: product._id },
  });
  if (!imageIsInUse) {
    await deleteImageFile(product.image.fileName);
  }
});

export default mongoose.model<IProduct>('product', productSchema);
