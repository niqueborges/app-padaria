import type { ProductRepositoryPort } from '../ports/product.repository.port.js';
import type { CreateProductInput, UpdateProductInput } from '../dto/product.dto.js';
import type { Product } from '../../domain/entities/product.entity.js';
import { ConflictError, NotFoundError } from '../../domain/errors/app-error.js';

export class ProductService {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async create(input: CreateProductInput): Promise<Product> {
    const existing = await this.productRepository.findByName(input.name);
    if (existing) {
      throw new ConflictError(`Já existe um produto cadastrado com o nome "${input.name}".`);
    }

    return this.productRepository.create({
      name: input.name,
      price: input.price,
      stock: input.stock,
    });
  }

  async list(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  async getById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Produto com ID "${id}" não foi encontrado.`);
    }

    return product;
  }

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Produto com ID "${id}" não foi encontrado.`);
    }

    if (input.name && input.name.toLowerCase() !== existing.name.toLowerCase()) {
      const duplicate = await this.productRepository.findByName(input.name);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError(`Já existe outro produto cadastrado com o nome "${input.name}".`);
      }
    }

    const updated = await this.productRepository.update(id, input);
    if (!updated) {
      throw new NotFoundError(`Falha ao atualizar o produto com ID "${id}".`);
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Produto com ID "${id}" não foi encontrado.`);
    }

    const deleted = await this.productRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Falha ao remover o produto com ID "${id}".`);
    }
  }
}
