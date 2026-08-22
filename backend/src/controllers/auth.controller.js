import * as authService from '../services/auth.service.js';
import { env } from '../config/env.js';

const REFRESH_COOKIE_NAME = 'ao_market_refresh';
const REFRESH_COOKIE_PATH = '/api/auth';

// O refresh token nunca vai no corpo da resposta — só o access token vai
// para o JSON (o frontend guarda-o em memória, não em localStorage). O
// refresh token vive exclusivamente num cookie httpOnly, inacessível a
// JavaScript no browser (mitiga roubo por XSS).
function setRefreshCookie(res, rawToken, expiresAt) {
  res.cookie(REFRESH_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: REFRESH_COOKIE_PATH,
    expires: expiresAt,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}

export async function register(req, res, next) {
  try {
    const user = await authService.registerBuyer(req.body);
    res.status(201).json({
      message: 'Conta criada. Verifique o seu email para ativar a conta.',
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function registerProducer(req, res, next) {
  try {
    const user = await authService.registerProducer(req.body);
    res.status(201).json({
      message: 'Conta de produtor criada. Verifique o seu email para ativar a conta.',
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function registerTransporter(req, res, next) {
  try {
    const user = await authService.registerTransporter(req.body);
    res.status(201).json({
      message: 'Conta de transportador criada. Verifique o seu email para ativar a conta.',
      user,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { user, accessToken, refreshToken, refreshTokenExpiresAt } = await authService.login(req.body, {
      ip: req.ip,
    });
    setRefreshCookie(res, refreshToken, refreshTokenExpiresAt);
    res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

// Chamado pelo frontend ao iniciar a app (ou quando um access token
// expira em pleno uso) para obter um novo access token sem pedir
// credenciais outra vez. Lê o refresh token do cookie httpOnly — nunca
// do corpo do pedido.
export async function refresh(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    const { user, accessToken, refreshToken, refreshTokenExpiresAt } = await authService.refreshAccessToken(
      rawRefreshToken,
      { ip: req.ip }
    );
    setRefreshCookie(res, refreshToken, refreshTokenExpiresAt);
    res.json({ user, accessToken });
  } catch (err) {
    clearRefreshCookie(res);
    next(err);
  }
}

// GET /api/auth/me — protegida por requireAuth (ver auth.routes.js).
// req.user.id vem do JWT já validado; os dados devolvidos vêm sempre de
// uma consulta fresca à base de dados (ver authService.getCurrentUser).
export async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
    await authService.revokeRefreshToken(rawRefreshToken);
    clearRefreshCookie(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
