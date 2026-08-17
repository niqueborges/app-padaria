import type { Request, Response } from 'express';
import type { SaleService } from '../../../application/services/sale.service.js';
import { createSaleSchema } from '../../../application/dto/sale.dto.js';
import { ValidationError } from '../../../domain/errors/app-error.js';

export class SaleController {
  constructor(private readonly saleService: SaleService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const parseResult = createSaleSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      throw new ValidationError(issue?.message ?? 'Dados inválidos para registro de venda.');
    }

    const sale = await this.saleService.createSale(parseResult.data);
    res.status(201).json(sale);
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const sales = await this.saleService.listSales();
    res.status(200).json(sales);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params['id'];
    if (!id) {
      throw new ValidationError('ID da venda é obrigatório.');
    }

    const sale = await this.saleService.getSaleById(id);
    res.status(200).json(sale);
  };
}
