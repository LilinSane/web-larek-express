import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import {
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import config from '../config';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import User, { IUser } from '../models/user';
import { verifyRefreshToken } from '../middlewares/auth';

interface IAuthRequest extends Request {
  body: {
    name?: string;
    email: string;
    password: string;
  };
}

const cookieName = 'refreshToken';
const refreshTokenMaxAge = ms(config.refreshTokenExpiry as ms.StringValue);
if (!Number.isFinite(refreshTokenMaxAge) || refreshTokenMaxAge <= 0) {
  throw new Error('AUTH_REFRESH_TOKEN_EXPIRY must be a valid positive duration');
}

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: refreshTokenMaxAge,
  path: '/',
};

const clearCookieOptions: CookieOptions = {
  httpOnly: cookieOptions.httpOnly,
  sameSite: cookieOptions.sameSite,
  secure: cookieOptions.secure,
  path: cookieOptions.path,
};

const expiresInSeconds = (duration: string) => {
  const durationMs = ms(duration as ms.StringValue);
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new Error(`Invalid token expiry duration: ${duration}`);
  }
  return Math.floor(durationMs / 1000);
};

const createToken = (userId: string, duration: string, secret: string) => jwt.sign(
  { _id: userId, jti: randomUUID(), iat: Math.floor(Date.now() / 1000) },
  secret,
  { expiresIn: expiresInSeconds(duration) },
);

const createTokenPair = (userId: string) => ({
  accessToken: createToken(userId, config.accessTokenExpiry, config.jwtAccessSecret),
  refreshToken: createToken(userId, config.refreshTokenExpiry, config.jwtRefreshSecret),
});

const serializeUser = (user: IUser) => ({
  email: user.email,
  name: user.name,
});

const sendTokenPair = (res: Response, user: IUser, tokens: ReturnType<typeof createTokenPair>) => {
  res.cookie(cookieName, tokens.refreshToken, cookieOptions);
  res.json({
    user: serializeUser(user),
    success: true,
    accessToken: tokens.accessToken,
  });
};

const login = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ email: req.body.email })
      .select('+password +tokens');
    if (!user || !await bcrypt.compare(req.body.password, user.password)) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }

    const tokens = createTokenPair(user.id);
    user.tokens.push({ token: tokens.refreshToken });
    await user.save();
    sendTokenPair(res, user, tokens);
  } catch (error) {
    next(error);
  }
};

const register = async (req: IAuthRequest, res: Response, next: NextFunction) => {
  try {
    const password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password,
    });
    const tokens = createTokenPair(user.id);
    user.tokens.push({ token: tokens.refreshToken });
    await user.save();
    sendTokenPair(res, user, tokens);
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findById(req.user!._id);
    if (!user) {
      throw new NotFoundError('Пользователь по заданному id отсутствует в базе');
    }
    res.json({ user: serializeUser(user), success: true });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies[cookieName] as string;
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload._id).select('+tokens');
    if (!user) {
      throw new UnauthorizedError('Не валидный токен');
    }
    if (!user.tokens.some((token) => token.token === refreshToken)) {
      throw new UnauthorizedError('Не валидный токен');
    }

    user.tokens = user.tokens.filter((token) => token.token !== refreshToken);
    const tokens = createTokenPair(user.id);
    user.tokens.push({ token: tokens.refreshToken });
    await user.save();
    sendTokenPair(res, user, tokens);
  } catch (error) {
    next(error);
  }
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies[cookieName] as string;
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload._id).select('+tokens');
    if (!user) {
      throw new UnauthorizedError('Не валидный токен');
    }
    if (!user.tokens.some((token) => token.token === refreshToken)) {
      throw new UnauthorizedError('Не валидный токен');
    }

    user.tokens = user.tokens.filter((token) => token.token !== refreshToken);
    await user.save();
    res.clearCookie(cookieName, clearCookieOptions);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export default {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
};
