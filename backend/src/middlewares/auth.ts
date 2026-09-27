import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import config from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

export interface IAuthenticatedRequest extends Request {
  user: JwtPayload & { _id: string };
}

export const isAuthenticatedRequest = (
  req: Request,
): req is IAuthenticatedRequest => {
  if (!('user' in req)) {
    return false;
  }

  const { user } = req;
  return (
    typeof user === 'object'
    && user !== null
    && '_id' in user
    && typeof user._id === 'string'
  );
};

const auth = (req: Request, _res: Response, next: NextFunction) => {
  const authorization = req.get('authorization');
  const accessToken = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : '';

  if (!accessToken) {
    next(new UnauthorizedError());
    return;
  }

  try {
    const payload = jwt.verify(accessToken, config.jwtSecret);
    if (
      typeof payload === 'string'
      || typeof payload._id !== 'string'
      || !Types.ObjectId.isValid(payload._id)
    ) {
      throw new UnauthorizedError();
    }

    Object.assign(req, { user: payload });
    next();
  } catch (error) {
    next(error instanceof UnauthorizedError
      ? error
      : new UnauthorizedError('Необходима авторизация'));
  }
};

export const verifyRefreshToken = (token: string): JwtPayload & { _id: string } => {
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    if (
      typeof payload === 'string'
      || typeof payload._id !== 'string'
      || !Types.ObjectId.isValid(payload._id)
    ) {
      throw new UnauthorizedError('Недействительный refresh-токен');
    }
    return payload as JwtPayload & { _id: string };
  } catch {
    throw new UnauthorizedError('Не валидный токен');
  }
};

export default auth;
