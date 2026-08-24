import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../utils/validate.js';
import * as companyController from '../controllers/company.controller.js';

const router = Router();

const registerCompanySchema = z
  .object({
    legalName: z.string().min(2, 'Indique a razão social.'),
    tradeName: z.string().max(160).optional(),
    nif: z.string().min(5, 'NIF inválido.'),
    sector: z.string().max(120).optional(),
    phone: z.string().min(9).optional(),
    email: z.string().email().optional(),
    province: z.string().max(80).optional(),
    municipality: z.string().max(80).optional(),
    address: z.string().max(200).optional(),
    legalRepName: z.string().min(2, 'Indique o nome do representante legal.'),
    legalRepBi: z.string().min(5, 'BI do representante legal inválido.'),
    capabilities: z
      .array(z.enum(['COMPRAR', 'VENDER', 'TRANSPORTAR']))
      .min(1, 'Selecione pelo menos uma forma de utilização.'),
    adminFullName: z.string().min(3, 'Nome do administrador é obrigatório.'),
    adminEmail: z.string().email('Email do administrador inválido.'),
    adminPassword: z.string().min(8, 'A palavra-passe deve ter pelo menos 8 caracteres.'),
    adminConfirmPassword: z.string(),
  })
  .refine((data) => data.adminPassword === data.adminConfirmPassword, {
    message: 'As palavras-passe não coincidem.',
    path: ['adminConfirmPassword'],
  });

// POST /api/companies/register — cadastro de empresa (público, cria a
// empresa e o utilizador administrador num único passo).
router.post('/register', validateBody(registerCompanySchema), companyController.register);

export default router;
