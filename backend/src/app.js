import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';
import { requestIdMiddleware } from './utils/requestId.js';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import companyRoutes from './routes/company.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import buyerRoutes from './routes/buyer.routes.js';
import cartRoutes from './routes/cart.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import socialSecurityRoutes from './routes/socialSecurity.routes.js';
import socialSecurityAdminRoutes from './routes/admin/socialSecurityAdmin.routes.js';

export const app = express();

// Cada pedido recebe um id (prÃ³prio ou herdado de x-request-id) antes de
// tudo o resto, para poder ser seguido nos logs do inÃ­cio ao fim.
app.use(requestIdMiddleware);

// SeguranÃ§a bÃ¡sica de headers HTTP.
app.use(helmet());

// CORS restrito Ã  origem do frontend configurada em .env. `credentials:
// true` Ã© necessÃ¡rio para o cookie httpOnly do refresh token viajar em
// pedidos cross-origin (frontend em porta diferente do backend em dev).
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting global â€” protege contra abuso genÃ©rico. As rotas de
// autenticaÃ§Ã£o (login/registo/refresh) tÃªm limites dedicados e mais
// apertados em auth.routes.js, porque sÃ£o o alvo Ã³bvio de forÃ§a bruta.
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Rotas
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api', catalogRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/social-security', socialSecurityRoutes);
app.use('/api/admin/social-security', socialSecurityAdminRoutes);

// 404 e tratamento de erros centralizado.
app.use(notFoundHandler);
app.use(errorHandler);

