import type { Request, Response } from 'express';
import type { ProductService } from '../../../application/services/product.service.js';
import { createProductSchema, updateProductSchema } from '../../../application/dto/product.dto.js';
import { ValidationError } from '../../../domain/errors/app-error.js';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const parseResult = createProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      throw new ValidationError(issue?.message ?? 'Dados inválidos para cadastro de produto.');
    }

    const product = await this.productService.create(parseResult.data);
    res.status(201).json(product);
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    const products = await this.productService.list();
    res.status(200).json(products);
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params['id'];
    if (!id) {
      throw new ValidationError('ID do produto é obrigatório.');
    }

    const product = await this.productService.getById(id);
    res.status(200).json(product);
  };

  update = async (req: Request, res: Response): Promise<void> => {
    const id = req.params['id'];
    if (!id) {
      throw new ValidationError('ID do produto é obrigatório.');
    }

    const parseResult = updateProductSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      throw new ValidationError(issue?.message ?? 'Dados inválidos para atualização de produto.');
    }

    const product = await this.productService.update(id, parseResult.data);
    res.status(200).json(product);
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    const id = req.params['id'];
    if (!id) {
      throw new ValidationError('ID do produto é obrigatório.');
    }

    await this.productService.delete(id);
    res.status(204).send();
  };
}
