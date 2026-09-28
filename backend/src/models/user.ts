import mongoose, { Schema } from 'mongoose';
import validator from 'validator';

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: { token: string }[];
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      default: 'Ё-мое',
      minlength: 2,
      maxlength: 30,
    },
    email: {
      type: String,
      required: [true, 'Поле "email" должно быть заполнено'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (email: string) => validator.isEmail(email),
        message: 'Поле "email" должно содержать корректный email',
      },
    },
    password: {
      type: String,
      required: [true, 'Поле "password" должно быть заполнено'],
      minlength: [6, 'Минимальная длина поля "password" - 6'],
      select: false,
    },
    tokens: {
      type: [{ token: { type: String, required: true } }],
      default: [],
      select: false,
    },
  },
  {
    versionKey: false,
  },
);

export default mongoose.model<IUser>('user', userSchema);
