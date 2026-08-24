import { prisma } from '../config/prisma.js';

// Cria uma notificação in-app. O envio por email/push será acoplado aqui
// nas próximas fases, sem alterar quem chama esta função.
export async function notify(userId, title, message, channel = 'IN_APP') {
  if (!userId) return null;
  return prisma.notification.create({
    data: { userId, title, message, channel },
  });
}
