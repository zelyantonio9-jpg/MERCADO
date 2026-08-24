import * as companyService from '../services/company.service.js';

export async function register(req, res, next) {
  try {
    const { company, adminUser } = await companyService.registerCompany(req.body);
    res.status(201).json({
      message: 'Empresa registada. Verifique o email do administrador para ativar a conta.',
      company,
      adminUser,
    });
  } catch (err) {
    next(err);
  }
}
