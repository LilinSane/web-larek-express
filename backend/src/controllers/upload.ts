import { Request, Response, NextFunction } from 'express';
import config from '../config';
import BadRequestError from '../errors/bad-request-error';

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    next(new BadRequestError('Файл не передан'));
    return;
  }

  res.json({
    fileName: `/${config.uploadPath}/${req.file.filename}`,
    originalName: req.file.originalname,
  });
};

export default uploadFile;
