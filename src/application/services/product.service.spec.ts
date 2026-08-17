import { ProductService } from './product.service.js';
import type { ProductRepositoryPort } from '../ports/product.repository.port.js';
import { Product } from '../../domain/entities/product.entity.js';
import { ConflictError, NotFoundError } from '../../domain/errors/app-error.js';

describe('ProductService (Application)', () => {
  let productService: ProductService;
  let mockProductRepository: jest.Mocked<ProductRepositoryPort>;

  const mockProduct = new Product({
    id: 'prod-123',
    name: 'Pão Francês',
    price: 18.5,
    stock: 50,
  });

  beforeEach(() => {
    mockProductRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    productService = new ProductService(mockProductRepository);
  });

  describe('create', () => {
    it('should create a product when name is unique', async () => {
      mockProductRepository.findByName.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(mockProduct);

      const result = await productService.create({
        name: 'Pão Francês',
        price: 18.5,
        stock: 50,
      });

      expect(mockProductRepository.findByName).toHaveBeenCalledWith('Pão Francês');
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        name: 'Pão Francês',
        price: 18.5,
        stock: 50,
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw ConflictError if product name already exists', async () => {
      mockProductRepository.findByName.mockResolvedValue(mockProduct);

      await expect(
        productService.create({
          name: 'Pão Francês',
          price: 18.5,
          stock: 50,
        })
      ).rejects.toThrow(ConflictError);

      expect(mockProductRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should return list of all products', async () => {
      mockProductRepository.findAll.mockResolvedValue([mockProduct]);

      const result = await productService.list();

      expect(mockProductRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('getById', () => {
    it('should return product when found', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);

      const result = await productService.getById('prod-123');

      expect(mockProductRepository.findById).toHaveBeenCalledWith('prod-123');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundError when product does not exist', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.getById('prod-999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('should update product successfully', async () => {
      const updatedProduct = new Product({
        id: 'prod-123',
        name: 'Pão Francês Quentinho',
        price: 20.0,
        stock: 45,
      });

      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.findByName.mockResolvedValue(null);
      mockProductRepository.update.mockResolvedValue(updatedProduct);

      const result = await productService.update('prod-123', {
        name: 'Pão Francês Quentinho',
        price: 20.0,
      });

      expect(result).toEqual(updatedProduct);
      expect(mockProductRepository.update).toHaveBeenCalledWith('prod-123', {
        name: 'Pão Francês Quentinho',
        price: 20.0,
      });
    });

    it('should throw NotFoundError when updating non-existent product', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.update('prod-999', { price: 20.0 })).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw ConflictError if updating name to an already existing name', async () => {
      const anotherProduct = new Product({
        id: 'prod-456',
        name: 'Bolo de Cenoura',
        price: 15.0,
        stock: 10,
      });

      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.findByName.mockResolvedValue(anotherProduct);

      await expect(productService.update('prod-123', { name: 'Bolo de Cenoura' })).rejects.toThrow(
        ConflictError
      );

      expect(mockProductRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete product successfully', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.delete.mockResolvedValue(true);

      await productService.delete('prod-123');

      expect(mockProductRepository.findById).toHaveBeenCalledWith('prod-123');
      expect(mockProductRepository.delete).toHaveBeenCalledWith('prod-123');
    });

    it('should throw NotFoundError if product to delete does not exist', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.delete('prod-999')).rejects.toThrow(NotFoundError);
      expect(mockProductRepository.delete).not.toHaveBeenCalled();
    });
  });
});
