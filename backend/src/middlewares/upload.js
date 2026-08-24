import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';

// Armazenamento local para o ambiente de desenvolvimento. Em produção,
// substituir por armazenamento de objetos (ex: S3-compatible) mantendo a
// mesma interface (req.file.path / req.file.filename).
const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/social-security'),
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomUUID();
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

export const uploadSocialSecurityDocument = multer({
  storage,
  limits: { fileSize: env.uploadMaxSizeMb * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new AppError('Tipo de ficheiro não permitido. Envie PDF, JPG ou PNG.', 400));
    }
    cb(null, true);
  },
}).single('document');
