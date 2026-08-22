import * as catalogService from '../services/catalog.service.js';

export async function listCategories(req, res, next) {
  try {
    const categories = await catalogService.listCategories();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

export async function listProducts(req, res, next) {
  try {
    const { q, categoria, page, pageSize } = req.query;
    const result = await catalogService.listProducts({ search: q, category: categoria, page, pageSize });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedProducts(req, res, next) {
  try {
    const products = await catalogService.getFeaturedProducts();
    res.json({ products });
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req, res, next) {
  try {
    const product = await catalogService.getProductById(req.params.id);
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedProducers(req, res, next) {
  try {
    const producers = await catalogService.getFeaturedProducers();
    res.json({ producers });
  } catch (err) {
    next(err);
  }
}

export async function getProducer(req, res, next) {
  try {
    const producer = await catalogService.getProducerById(req.params.id);
    res.json({ producer });
  } catch (err) {
    next(err);
  }
}
