import { prisma } from '../config/prisma.js';

// Todas as funções aqui são exclusivamente de LEITURA. Ownership é sempre
// imposto filtrando por userId vindo de req.user (nunca de parâmetros do
// pedido) — ver buyer.controller.js.

export async function getProfile(userId) {
  return prisma.buyerProfile.findUnique({ where: { userId } });
}

export async function listAddresses(userId) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function listFavorites(userId) {
  const [favoriteProducts, favoriteProducers] = await Promise.all([
    prisma.favoriteProduct.findMany({
      where: { userId },
      include: { product: { include: { producer: true, category: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.favoriteProducer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // FavoriteProducer.producerId não tem relação Prisma definida para
  // ProducerProfile no schema atual — resolve-se com uma segunda query em
  // vez de alterar o schema fora do âmbito deste pedido.
  const producerIds = favoriteProducers.map((f) => f.producerId);
  const producers = producerIds.length
    ? await prisma.producerProfile.findMany({ where: { id: { in: producerIds } } })
    : [];
  const producerById = new Map(producers.map((p) => [p.id, p]));

  return {
    products: favoriteProducts.map((f) => ({
      productId: f.productId,
      addedAt: f.createdAt,
      product: {
        id: f.product.id,
        name: f.product.name,
        price: f.product.price,
        unit: f.product.unit,
        producerName: f.product.producer?.businessName ?? null,
        category: f.product.category?.name ?? null,
      },
    })),
    producers: favoriteProducers.map((f) => ({
      producerId: f.producerId,
      addedAt: f.createdAt,
      producer: producerById.has(f.producerId)
        ? { id: f.producerId, name: producerById.get(f.producerId).businessName, sector: producerById.get(f.producerId).sector }
        : null,
    })),
  };
}

const ORDER_INCLUDE = {
  items: { include: { product: { select: { id: true, name: true, unit: true } } } },
  payment: true,
  delivery: true,
};

export async function listOrders(userId, { status, page = 1, pageSize = 20 } = {}) {
  const take = Math.min(Number(pageSize) || 20, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
  const where = { buyerId: userId, ...(status ? { status } : {}) };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, pagination: { page: Math.max(Number(page) || 1, 1), pageSize: take, total, totalPages: Math.ceil(total / take) || 1 } };
}

// Devolve null (não lança) quando o pedido não existe OU não pertence ao
// utilizador — o controller decide então responder 404, sem distinguir
// "não existe" de "não é teu" (evita confirmar a um atacante que um
// determinado orderId existe mas pertence a outra pessoa).
export async function getOrderById(userId, orderId) {
  return prisma.order.findFirst({
    where: { id: orderId, buyerId: userId },
    include: { ...ORDER_INCLUDE, statusHistory: { orderBy: { createdAt: 'asc' } }, deliveryAddress: true },
  });
}

export async function getCart(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    return { items: [], subtotal: 0 };
  }

  // O backend recalcula sempre o total a partir do preço atual do
  // produto — nunca confia em nenhum valor que possa ter sido guardado
  // ou enviado pelo cliente.
  const items = cart.items.map((item) => {
    const unitPrice = Number(item.product.price);
    const quantity = Number(item.quantity);
    return {
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      unit: item.product.unit,
      quantity,
      unitPrice,
      subtotal: Number((unitPrice * quantity).toFixed(2)),
    };
  });

  const subtotal = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
  return { id: cart.id, items, subtotal };
}

export async function listPayments(userId) {
  return prisma.payment.findMany({
    where: { order: { buyerId: userId } },
    include: { order: { select: { id: true, status: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

// A entrega só é devolvida se a encomenda associada pertencer ao
// utilizador (ou à empresa indicada, quando aplicável) — mesma lógica de
// "não confirmar existência" usada em getOrderById.
export async function getDeliveryById(userId, deliveryId, companyId) {
  return prisma.delivery.findFirst({
    where: {
      id: deliveryId,
      order: companyId ? { OR: [{ buyerId: userId }, { companyId }] } : { buyerId: userId },
    },
    include: { proofs: true, assignment: true, order: { select: { id: true, status: true } } },
  });
}

export async function listNotifications(userId, { page = 1, pageSize = 20, unreadOnly } = {}) {
  const take = Math.min(Number(pageSize) || 20, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
  const where = { userId, ...(unreadOnly ? { readAt: null } : {}) };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take, skip }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: { page: Math.max(Number(page) || 1, 1), pageSize: take, total, totalPages: Math.ceil(total / take) || 1 },
  };
}

export async function listDocuments(userId) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}
