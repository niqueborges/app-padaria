import type { Product } from '../../domain/entities/product.entity.js';

export interface CreateProductData {
  name: string;
  price: number;
  stock: number;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  stock?: number;
}

export interface ProductRepositoryPort {
  findById(id: string): Promise<Product | null>;
  findByName(name: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  create(data: CreateProductData): Promise<Product>;
  update(id: string, data: UpdateProductData): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}
