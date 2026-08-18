import type { SaleRepositoryPort, CreateSaleItemData } from '../ports/sale.repository.port.js';
import type { ProductRepositoryPort } from '../ports/product.repository.port.js';
import type { CreateSaleInput } from '../dto/sale.dto.js';
import type { Sale } from '../../domain/entities/sale.entity.js';
import { NotFoundError, ValidationError } from '../../domain/errors/app-error.js';

export class SaleService {
  constructor(
    private readonly saleRepository: SaleRepositoryPort,
    private readonly productRepository: ProductRepositoryPort
  ) {}

  async createSale(input: CreateSaleInput): Promise<Sale> {
    if (!input.items || input.items.length === 0) {
      throw new ValidationError('A venda deve conter pelo menos um item.');
    }

    const itemsToCreate: CreateSaleItemData[] = [];
    let calculatedTotal = 0;

    for (const item of input.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new NotFoundError(`Produto com ID "${item.productId}" não foi encontrado.`);
      }

      if (product.stock < item.quantity) {
        throw new ValidationError(
          `Estoque insuficiente para o produto "${product.name}". Disponível: ${product.stock}, solicitado: ${item.quantity}.`
        );
      }

      const unitPrice = product.price;
      calculatedTotal += unitPrice * item.quantity;

      itemsToCreate.push({
        // product.id e garantido: produto foi buscado e validado como existente (Q3: tipar entidade persistida)
        productId: product.id!,
        quantity: item.quantity,
        unitPrice,
      });
    }

    const totalAmount = Number(calculatedTotal.toFixed(2));

    return this.saleRepository.createWithStockDeduction({
      totalAmount,
      items: itemsToCreate,
    });
  }

  async listSales(): Promise<Sale[]> {
    return this.saleRepository.findAll();
  }

  async getSaleById(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findById(id);
    if (!sale) {
      throw new NotFoundError(`Venda com ID "${id}" não foi encontrada.`);
    }

    return sale;
  }
}
