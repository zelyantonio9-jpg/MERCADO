// Seed inicial: cria os papéis (roles) e permissões base do RBAC.
// Corre com: npm run prisma:seed --workspace=backend

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Comprador
  'buyer.profile.read', 'buyer.profile.update',
  'addresses.create', 'addresses.read', 'addresses.update', 'addresses.delete',
  'cart.read', 'cart.create', 'cart.update',
  'orders.create', 'orders.read', 'orders.cancel',
  'payments.read',
  'delivery.read', 'delivery.confirm',
  'chat.read', 'chat.send',
  'reviews.create',
  'documents.read',
  'favorites.manage',
  // Produtor
  'products.read', 'products.create', 'products.update', 'products.delete',
  'producer.orders.read', 'producer.orders.update',
  // Transportador
  'transport.requests.read', 'transport.requests.accept', 'transport.deliveries.update',
  // Empresa
  'company.orders.read', 'company.orders.approve', 'company.users.manage',
  // Segurança Social (módulo INSS)
  'social_security.read', 'social_security.manage', 'social_security.verify',
  'social_security.documents.read', 'social_security.documents.upload',
  // Administração
  'admin.users.manage', 'admin.support.manage', 'admin.audit.read',
];

const ROLES = {
  BUYER: [
    'buyer.profile.read', 'buyer.profile.update',
    'addresses.create', 'addresses.read', 'addresses.update', 'addresses.delete',
    'cart.read', 'cart.create', 'cart.update',
    'orders.create', 'orders.read', 'orders.cancel',
    'payments.read', 'delivery.read', 'delivery.confirm',
    'chat.read', 'chat.send', 'reviews.create', 'documents.read', 'favorites.manage',
  ],
  PRODUCER: [
    'products.read', 'products.create', 'products.update', 'products.delete',
    'producer.orders.read', 'producer.orders.update', 'chat.read', 'chat.send', 'documents.read',
    'social_security.read', 'social_security.manage', 'social_security.documents.read', 'social_security.documents.upload',
  ],
  TRANSPORTER: [
    'transport.requests.read', 'transport.requests.accept', 'transport.deliveries.update', 'chat.read', 'chat.send', 'documents.read',
    'social_security.read', 'social_security.manage', 'social_security.documents.read', 'social_security.documents.upload',
  ],
  COMPANY_ADMIN: [
    'company.orders.read', 'company.orders.approve', 'company.users.manage',
    'social_security.read', 'social_security.manage', 'social_security.documents.read', 'social_security.documents.upload',
  ],
  ADMIN: PERMISSIONS,
  // O suporte pode acompanhar/orientar, mas a permissão de verificação
  // documental (social_security.verify) fica reservada a operadores
  // explicitamente autorizados — aqui incluída por ser o papel operacional
  // previsto no fluxo de "Administração → Segurança Social".
  SUPPORT: ['admin.support.manage', 'admin.audit.read', 'chat.read', 'chat.send', 'social_security.verify', 'social_security.read'],
};

async function seedCategories() {
  console.log('A semear categorias...');
  const CATEGORIES = [
    'Agricultura', 'Frutas', 'Hortícolas', 'Cereais', 'Tubérculos',
    'Carne', 'Pescado', 'Laticínios', 'Produtos transformados', 'Artesanato', 'Outros',
  ];
  for (const name of CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
}

async function main() {
  console.log('A semear permissões...');
  for (const key of PERMISSIONS) {
    await prisma.permission.upsert({ where: { key }, update: {}, create: { key } });
  }

  console.log('A semear papéis (roles)...');
  for (const [roleName, permissionKeys] of Object.entries(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    for (const key of permissionKeys) {
      const permission = await prisma.permission.findUnique({ where: { key } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  await seedCategories();

  console.log('Seed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
