import { prisma } from '../config/prisma.js';
import { AppError } from '../middlewares/errorHandler.js';

const PAGE_SIZE_DEFAULT = 20;
const PAGE_SIZE_MAX = 50;

// --- Categorias ---

export async function listCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}

// --- Produtos ---
// Todas as leituras aqui são públicas (visitante/comprador não autenticado
// pode navegar no marketplace). Nunca devolvem dados de outros compradores
// nem informação sensível do produtor — apenas o que já é público por
// natureza (nome do negócio, localização, categoria).

function toPublicProduct(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    unit: product.unit,
    location: [product.municipality, product.province].filter(Boolean).join(', ') || null,
    producerName: product.producer?.businessName ?? null,
    category: product.category?.name ?? null,
    inStock: product.inventory ? Number(product.inventory.quantity) > 0 : null,
    photos: product.photos,
  };
}

export async function listProducts({ search, category, page = 1, pageSize = PAGE_SIZE_DEFAULT } = {}) {
  const take = Math.min(Number(pageSize) || PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where = {
    isActive: true,
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    ...(category ? { category: { name: category } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { producer: true, category: true, inventory: true },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: items.map(toPublicProduct),
    pagination: { page: Math.max(Number(page) || 1, 1), pageSize: take, total, totalPages: Math.ceil(total / take) || 1 },
  };
}

export async function getFeaturedProducts(limit = 8) {
  const items = await prisma.product.findMany({
    where: { isActive: true },
    include: { producer: true, category: true, inventory: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return items.map(toPublicProduct);
}

export async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { producer: true, category: true, inventory: true },
  });
  if (!product || !product.isActive) {
    throw new AppError('Produto não encontrado.', 404);
  }
  return {
    ...toPublicProduct(product),
    description: product.description,
  };
}

// --- Produtores (perfil público) ---

function toPublicProducer(producer) {
  return {
    id: producer.id,
    name: producer.businessName,
    category: producer.sector,
    location: null, // sem campo de localização direto no ProducerProfile hoje
    verifications: {
      identity: false, // sem módulo de verificação de identidade implementado ainda
      businessData: producer.isVerified,
      // Só é true quando existir mesmo um SocialSecurityProfile VERIFIED
      // ligado a este utilizador — nunca por omissão.
      socialSecurity: Boolean(producer.user?.socialSecurityProfile?.status === 'VERIFIED'),
    },
  };
}

export async function getFeaturedProducers(limit = 6) {
  const producers = await prisma.producerProfile.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: { user: { include: { socialSecurityProfile: true } } },
  });
  return producers.map(toPublicProducer);
}

export async function getProducerById(id) {
  const producer = await prisma.producerProfile.findUnique({
    where: { id },
    include: { user: { include: { socialSecurityProfile: true } } },
  });
  if (!producer) throw new AppError('Produtor não encontrado.', 404);
  return toPublicProducer(producer);
}
