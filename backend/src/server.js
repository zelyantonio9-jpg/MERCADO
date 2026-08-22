import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { logger } from './utils/logger.js';

const server = app.listen(env.port, '0.0.0.0', () => {
  logger.info('AO MARKET backend iniciado', { port: env.port, env: env.nodeEnv });
});

// Encerramento controlado: para de aceitar novas ligações, deixa os
// pedidos em curso terminarem, e só depois fecha a ligação à base de
// dados. Sem isto, um SIGTERM (ex: deploy, restart do orquestrador)
// pode cortar pedidos a meio e deixar ligações Prisma penduradas.
async function shutdown(signal) {
  logger.info(`A encerrar (sinal ${signal})...`);
  server.close(async (err) => {
    if (err) {
      logger.error('Erro ao fechar o servidor HTTP.', { error: err.message });
      process.exitCode = 1;
    }
    await prisma.$disconnect();
    logger.info('Encerramento concluído.');
    process.exit();
  });

  // Se o encerramento gracioso demorar demasiado, força a saída — evita
  // que o processo fique pendurado indefinidamente num deploy.
  setTimeout(() => {
    logger.error('Encerramento forçado após timeout.');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('unhandledRejection', { reason: reason instanceof Error ? reason.message : reason });
});
process.on('uncaughtException', (error) => {
  logger.error('uncaughtException', { error: error.message, stack: error.stack });
  process.exit(1);
});

