import { SaleService } from './sale.service.js';
import type { SaleRepositoryPort } from '../ports/sale.repository.port.js';
import type { ProductRepositoryPort } from '../ports/product.repository.port.js';
import { Product } from '../../domain/entities/product.entity.js';
import { Sale, SaleItem } from '../../domain/entities/sale.entity.js';
import { NotFoundError, ValidationError } from '../../domain/errors/app-error.js';

describe('SaleService (Application)', () => {
  let saleService: SaleService;
  let mockSaleRepository: jest.Mocked<SaleRepositoryPort>;
  let mockProductRepository: jest.Mocked<ProductRepositoryPort>;

  const mockProduct = new Product({
    id: 'prod-123',
    name: 'Pão Francês (kg)',
    price: 18.5,
    stock: 50,
  });

  const mockSaleItem = new SaleItem({
    id: 'item-1',
    saleId: 'sale-1',
    productId: 'prod-123',
    quantity: 2,
    unitPrice: 18.5,
    productName: 'Pão Francês (kg)',
  });

  const mockSale = new Sale({
    id: 'sale-1',
    totalAmount: 37.0,
    createdAt: new Date(),
    items: [mockSaleItem],
  });

  beforeEach(() => {
    mockSaleRepository = {
      create: jest.fn(),
      createWithStockDeduction: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      getDailyRevenue: jest.fn(),
      getMonthlyRevenue: jest.fn(),
    };

    mockProductRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    saleService = new SaleService(mockSaleRepository, mockProductRepository);
  });

  describe('createSale', () => {
    it('should create a sale and deduct stock when products and stock are valid', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockSaleRepository.createWithStockDeduction.mockResolvedValue(mockSale);

      const result = await saleService.createSale({
        items: [{ productId: 'prod-123', quantity: 2 }],
      });

      expect(mockProductRepository.findById).toHaveBeenCalledWith('prod-123');
      expect(mockSaleRepository.createWithStockDeduction).toHaveBeenCalledWith({
        totalAmount: 37.0,
        items: [{ productId: 'prod-123', quantity: 2, unitPrice: 18.5 }],
      });
      expect(result).toEqual(mockSale);
    });

    it('should throw ValidationError if items list is empty', async () => {
      await expect(saleService.createSale({ items: [] })).rejects.toThrow(ValidationError);
      expect(mockSaleRepository.createWithStockDeduction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if product does not exist', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(
        saleService.createSale({
          items: [{ productId: 'non-existent-id', quantity: 1 }],
        })
      ).rejects.toThrow(NotFoundError);

      expect(mockSaleRepository.createWithStockDeduction).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if stock is insufficient', async () => {
      const lowStockProduct = new Product({
        id: 'prod-123',
        name: 'Pão Francês (kg)',
        price: 18.5,
        stock: 3,
      });
      mockProductRepository.findById.mockResolvedValue(lowStockProduct);

      await expect(
        saleService.createSale({
          items: [{ productId: 'prod-123', quantity: 5 }],
        })
      ).rejects.toThrow(ValidationError);

      expect(mockSaleRepository.createWithStockDeduction).not.toHaveBeenCalled();
    });
  });

  describe('listSales', () => {
    it('should return list of all sales', async () => {
      mockSaleRepository.findAll.mockResolvedValue([mockSale]);

      const result = await saleService.listSales();

      expect(mockSaleRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockSale]);
    });
  });

  describe('getSaleById', () => {
    it('should return sale when found', async () => {
      mockSaleRepository.findById.mockResolvedValue(mockSale);

      const result = await saleService.getSaleById('sale-1');

      expect(mockSaleRepository.findById).toHaveBeenCalledWith('sale-1');
      expect(result).toEqual(mockSale);
    });

    it('should throw NotFoundError when sale does not exist', async () => {
      mockSaleRepository.findById.mockResolvedValue(null);

      await expect(saleService.getSaleById('non-existent-sale')).rejects.toThrow(NotFoundError);
    });
  });
});
