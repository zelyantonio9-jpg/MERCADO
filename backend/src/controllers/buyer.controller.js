import * as buyerService from '../services/buyer.service.js';
import { AppError } from '../middlewares/errorHandler.js';

export async function getProfile(req, res, next) {
  try {
    const profile = await buyerService.getProfile(req.user.id);
    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

export async function listAddresses(req, res, next) {
  try {
    const addresses = await buyerService.listAddresses(req.user.id);
    res.json({ addresses });
  } catch (err) {
    next(err);
  }
}

export async function listFavorites(req, res, next) {
  try {
    const favorites = await buyerService.listFavorites(req.user.id);
    res.json(favorites);
  } catch (err) {
    next(err);
  }
}

export async function listOrders(req, res, next) {
  try {
    const { status, page, pageSize } = req.query;
    const result = await buyerService.listOrders(req.user.id, { status, page, pageSize });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const order = await buyerService.getOrderById(req.user.id, req.params.id);
    if (!order) {
      throw new AppError('Pedido não encontrado.', 404);
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

export async function getCart(req, res, next) {
  try {
    const cart = await buyerService.getCart(req.user.id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
}

export async function listPayments(req, res, next) {
  try {
    const payments = await buyerService.listPayments(req.user.id);
    res.json({ payments });
  } catch (err) {
    next(err);
  }
}

export async function getDelivery(req, res, next) {
  try {
    const delivery = await buyerService.getDeliveryById(req.user.id, req.params.id, req.user.companyId);
    if (!delivery) {
      throw new AppError('Entrega não encontrada.', 404);
    }
    res.json({ delivery });
  } catch (err) {
    next(err);
  }
}

export async function listNotifications(req, res, next) {
  try {
    const { page, pageSize, unread } = req.query;
    const result = await buyerService.listNotifications(req.user.id, {
      page,
      pageSize,
      unreadOnly: unread === 'true',
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listDocuments(req, res, next) {
  try {
    const documents = await buyerService.listDocuments(req.user.id);
    res.json({ documents });
  } catch (err) {
    next(err);
  }
}
