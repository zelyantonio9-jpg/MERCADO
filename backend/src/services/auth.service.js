import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from '../utils/logger.js';
import { generateOpaqueToken, hashToken, parseDurationToMs } from '../utils/tokens.js';

const SALT_ROUNDS = 12;

// Liga o novo utilizador ao Role correspondente (criado pelo seed:
// BUYER, PRODUCER, TRANSPORTER, ...). Sem isto, o login resolveria
// permissions como um array vazio e o utilizador não conseguiria fazer
// nada na plataforma — por isso esta função é chamada em todo registo.
async function assignRole(userId, roleName) {
  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) {
    logger.error(`Role "${roleName}" não encontrado ao registar utilizador. Corra "npm run prisma:seed".`, {
      userId, roleName,
    });
    return;
  }
  await prisma.userRole.create({ data: { userId, roleId: role.id } });
}

async function assertEmailAvailable(email) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Já existe uma conta com este email.', 409);
  }
}

export async function registerBuyer({ fullName, email, phone, password }) {
  await assertEmailAvailable(email);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      passwordHash,
      accountType: 'BUYER_INDIVIDUAL',
      status: 'PENDING_VERIFICATION',
      buyerProfile: { create: { buyerType: 'CONSUMIDOR_INDIVIDUAL' } },
    },
    include: { buyerProfile: true },
  });

  await assignRole(user.id, 'BUYER');
  return sanitizeUser(user);
}

// Cadastro do produtor/vendedor — cria o User (accountType PRODUCER) e o
// ProducerProfile associado. O produtor só consegue publicar produtos
// depois de o backend do marketplace (Fase 4) validar o perfil — por
// agora fica com isVerified=false por omissão.
export async function registerProducer({ fullName, email, phone, password, businessName, sector }) {
  await assertEmailAvailable(email);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      passwordHash,
      accountType: 'PRODUCER',
      status: 'PENDING_VERIFICATION',
      producerProfile: { create: { businessName, sector } },
    },
    include: { producerProfile: true },
  });

  await assignRole(user.id, 'PRODUCER');
  return sanitizeUser(user);
}

// Cadastro do transportador — cria o User (accountType TRANSPORTER) e o
// TransporterProfile. Áreas de atuação ficam como array de texto livre
// (províncias/municípios), sem validar contra uma lista fechada aqui —
// essa validação fica para quando existir um catálogo geográfico oficial.
export async function registerTransporter({ fullName, email, phone, password, operatingAreas }) {
  await assertEmailAvailable(email);
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      passwordHash,
      accountType: 'TRANSPORTER',
      status: 'PENDING_VERIFICATION',
      transporterProfile: { create: { operatingAreas: operatingAreas ?? [] } },
    },
    include: { transporterProfile: true },
  });

  await assignRole(user.id, 'TRANSPORTER');
  return sanitizeUser(user);
}

// --- Tokens ---
//
// Access token: JWT de vida curta (env.jwtExpiresIn), assinado, contém
// roles/permissions já resolvidos — nunca persistido, não pode ser
// revogado individualmente (por isso tem de expirar depressa).
//
// Refresh token: valor opaco (não é JWT) de vida longa, devolvido ao
// cliente num cookie httpOnly, e cuja HASH (nunca o valor em si) fica
// persistida em RefreshToken. Isto permite revogar sessões e detetar
// reutilização de um token já rodado (sinal de roubo).

const USER_AUTH_INCLUDE = {
  userRoles: { include: { role: { include: { rolePermissions: { include: { permission: true } } } } } },
  companyMemberships: true,
};

function buildAccessTokenPayload(user) {
  const roles = user.userRoles.map((ur) => ur.role.name);
  const permissions = [
    ...new Set(user.userRoles.flatMap((ur) => ur.role.rolePermissions.map((rp) => rp.permission.key))),
  ];
  // Nota: um utilizador pode pertencer a várias empresas; o companyId ativo
  // deve ser escolhido explicitamente no frontend (troca de contexto) nas
  // fases seguintes. Por agora assume-se a primeira associação, se existir.
  const companyId = user.companyMemberships[0]?.companyId ?? null;
  return { sub: user.id, accountType: user.accountType, roles, permissions, companyId };
}

function signAccessToken(user) {
  return jwt.sign(buildAccessTokenPayload(user), env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}


async function issueRefreshToken(userId, { familyId, ip } = {}) {
  const raw = generateOpaqueToken();
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + parseDurationToMs(env.jwtRefreshExpiresIn));
  const family = familyId || crypto.randomUUID();

  await prisma.refreshToken.create({
    data: { userId, tokenHash, familyId: family, expiresAt, createdByIp: ip ?? null },
  });

  return { raw, familyId: family, expiresAt };
}

async function issueTokenPair(user, { ip } = {}) {
  const accessToken = signAccessToken(user);
  const refresh = await issueRefreshToken(user.id, { ip });
  return { accessToken, refreshToken: refresh.raw, refreshTokenExpiresAt: refresh.expiresAt };
}

export async function login({ email, password }, { ip } = {}) {
  const user = await prisma.user.findUnique({ where: { email }, include: USER_AUTH_INCLUDE });

  if (!user) {
    throw new AppError('Credenciais inválidas.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError('Credenciais inválidas.', 401);
  }

  if (user.status === 'SUSPENDED' || user.status === 'BLOCKED') {
    throw new AppError('Esta conta está suspensa. Contacte o suporte.', 403);
  }

  const tokens = await issueTokenPair(user, { ip });
  return { user: toAuthResponseUser(user), ...tokens };
}

// GET /api/auth/me — devolve os dados atuais do utilizador autenticado.
// req.user (populado por requireAuth a partir do JWT) só tem id/roles/
// permissions/companyId; aqui vai-se sempre à base de dados buscar o
// estado real (fullName, email, status, etc.), nunca confiando em dados
// do próprio token para além do id — o token pode estar desatualizado
// (ex: role mudou depois de emitido) mas ainda válido até expirar.
export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: USER_AUTH_INCLUDE });

  if (!user) {
    throw new AppError('Utilizador não encontrado.', 404);
  }
  if (user.status === 'SUSPENDED' || user.status === 'BLOCKED') {
    throw new AppError('Esta conta está suspensa. Contacte o suporte.', 403);
  }

  return toAuthResponseUser(user);
}

// Chamado pelo frontend automaticamente (ex: ao abrir a app) para trocar
// um refresh token válido por um novo access token — sem pedir a
// palavra-passe outra vez. Roda o refresh token a cada uso: o antigo é
// revogado e substituído por um novo, sempre na mesma "família".
export async function refreshAccessToken(rawRefreshToken, { ip } = {}) {
  if (!rawRefreshToken) {
    throw new AppError('Sessão não encontrada.', 401);
  }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!stored) {
    throw new AppError('Sessão inválida. Autentique-se novamente.', 401);
  }

  if (stored.revokedAt) {
    // Um token já revogado a ser reutilizado é o sinal clássico de que foi
    // roubado (alguém copiou um refresh token antigo). Resposta correta:
    // revogar TODA a família de tokens, forçando novo login em todos os
    // dispositivos com essa sessão.
    await prisma.refreshToken.updateMany({
      where: { familyId: stored.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    logger.warn('Reutilização de refresh token detetada — família revogada.', {
      userId: stored.userId, familyId: stored.familyId,
    });
    throw new AppError('Sessão inválida. Autentique-se novamente.', 401);
  }

  if (stored.expiresAt < new Date()) {
    throw new AppError('Sessão expirada. Autentique-se novamente.', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId }, include: USER_AUTH_INCLUDE });
  if (!user || user.status === 'SUSPENDED' || user.status === 'BLOCKED') {
    throw new AppError('Sessão inválida.', 401);
  }

  const newRefresh = await issueRefreshToken(user.id, { familyId: stored.familyId, ip });

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date(), replacedByTokenHash: hashToken(newRefresh.raw) },
  });

  const accessToken = signAccessToken(user);
  return {
    user: toAuthResponseUser(user),
    accessToken,
    refreshToken: newRefresh.raw,
    refreshTokenExpiresAt: newRefresh.expiresAt,
  };
}

// Logout do dispositivo atual: revoga apenas este refresh token (não
// afeta sessões noutros dispositivos).
export async function revokeRefreshToken(rawRefreshToken) {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

// Disponível para fluxos futuros (alteração de password, "terminar todas
// as sessões", suspensão de conta pelo suporte) — revoga tudo o que ainda
// estiver ativo para este utilizador.
export async function revokeAllUserTokens(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

function sanitizeUser(user) {
  const { passwordHash, userRoles, companyMemberships, ...safeUser } = user;
  return safeUser;
}

// Formato devolvido pelas rotas de autenticação: dados seguros do
// utilizador + roles/permissions já resolvidos, para o frontend poder
// decidir o que mostrar (ex: <RequireAuth permission="...">) sem ter de
// decodificar o JWT. Nunca é usado para aplicar autorização no backend —
// isso continua a ser feito a partir do token assinado em cada pedido.
function toAuthResponseUser(user) {
  const payload = buildAccessTokenPayload(user);
  return { ...sanitizeUser(user), roles: payload.roles, permissions: payload.permissions, companyId: payload.companyId };
}
