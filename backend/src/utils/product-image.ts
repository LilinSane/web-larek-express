import { promises as fs } from 'fs';
import path from 'path';
import BadRequestError from '../errors/bad-request-error';
import config from '../config';

const getImageName = (fileName: string) => {
  const prefix = `/${config.uploadPath}/`;
  const imageName = path.posix.basename(fileName);
  if (
    !fileName.startsWith(prefix)
    || imageName !== fileName.slice(prefix.length)
    || !/^[a-zA-Z0-9_-]+\.(png|jpe?g|gif|svg)$/i.test(imageName)
  ) {
    throw new BadRequestError('Некорректный путь к изображению');
  }
  return imageName;
};

const isMissingFileError = (error: unknown) => (
  error instanceof Error && 'code' in error && error.code === 'ENOENT'
);

const isUploadedImage = (imageName: string) => (
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|jpe?g|gif|svg)$/i
    .test(imageName)
);

export const moveTemporaryImage = async (fileName: string) => {
  const imageName = getImageName(fileName);
  const temporaryPath = path.join(config.temporaryDirectory, imageName);
  const destinationPath = path.join(config.imagesDirectory, imageName);

  await fs.mkdir(config.imagesDirectory, { recursive: true });
  try {
    await fs.copyFile(temporaryPath, destinationPath);
    await fs.unlink(temporaryPath);
  } catch (error) {
    if (isMissingFileError(error)) {
      try {
        const stats = await fs.stat(destinationPath);
        if (stats.isFile()) {
          return fileName;
        }
      } catch (publicFileError) {
        if (!isMissingFileError(publicFileError)) {
          throw publicFileError;
        }
      }
      throw new BadRequestError('Изображение не найдено во временном хранилище или публичной папке');
    }
    throw error;
  }
  return `/${config.uploadPath}/${imageName}`;
};

export const deleteImageFile = async (fileName: string) => {
  const imageName = getImageName(fileName);
  if (!isUploadedImage(imageName)) {
    return;
  }

  const imagePath = path.join(config.imagesDirectory, imageName);
  try {
    await fs.unlink(imagePath);
  } catch (error) {
    if (!isMissingFileError(error)) {
      throw error;
    }
  }
};
