import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';

const SALT_ROUNDS = 12;

// Cadastro de empresa: cria a Company, um User para o representante legal
// (accountType BUYER_COMPANY — a empresa pode comprar, vender e/ou
// transportar, conforme `capabilities`; o tipo de conta reflete que o
// login se faz como pessoa ligada a uma empresa) e a CompanyMembership
// como ADMINISTRADOR. Tudo dentro de uma transação: ou fica tudo criado,
// ou nada fica.
export async function registerCompany({
  legalName,
  tradeName,
  nif,
  sector,
  phone,
  email,
  province,
  municipality,
  address,
  legalRepName,
  legalRepBi,
  capabilities,
  adminFullName,
  adminEmail,
  adminPassword,
}) {
  const [existingCompany, existingUser] = await Promise.all([
    prisma.company.findUnique({ where: { nif } }),
    prisma.user.findUnique({ where: { email: adminEmail } }),
  ]);

  if (existingCompany) {
    throw new AppError('Já existe uma empresa registada com este NIF.', 409);
  }
  if (existingUser) {
    throw new AppError('Já existe uma conta com este email.', 409);
  }

  const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  const result = await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        legalName,
        tradeName,
        nif,
        sector,
        phone,
        email,
        province,
        municipality,
        address,
        legalRepName,
        legalRepBi,
        capabilities: capabilities ?? [],
      },
    });

    const adminUser = await tx.user.create({
      data: {
        fullName: adminFullName,
        email: adminEmail,
        phone,
        passwordHash,
        accountType: 'BUYER_COMPANY',
        status: 'PENDING_VERIFICATION',
      },
    });

    await tx.companyMembership.create({
      data: { companyId: company.id, userId: adminUser.id, role: 'ADMINISTRADOR' },
    });

    const buyerRole = await tx.role.findUnique({ where: { name: 'BUYER' } });
    const companyAdminRole = await tx.role.findUnique({ where: { name: 'COMPANY_ADMIN' } });

    // Sem estes roles (criados pelo seed), o utilizador fica sem
    // permissões — regista-se para diagnóstico, mas não bloqueia a criação.
    if (!buyerRole || !companyAdminRole) {
      logger.error('Roles BUYER/COMPANY_ADMIN não encontrados ao registar empresa. Corra "npm run prisma:seed".', {
        companyId: company.id,
      });
    }
    if (buyerRole) {
      await tx.userRole.create({ data: { userId: adminUser.id, roleId: buyerRole.id } });
    }
    if (companyAdminRole) {
      await tx.userRole.create({ data: { userId: adminUser.id, roleId: companyAdminRole.id } });
    }

    return { company, adminUser };
  });

  const { passwordHash: _omit, ...safeAdminUser } = result.adminUser;
  return { company: result.company, adminUser: safeAdminUser };
}
