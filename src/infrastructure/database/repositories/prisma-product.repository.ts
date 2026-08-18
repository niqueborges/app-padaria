import type { PrismaClient } from '../../../generated/prisma/client.js';
import { Prisma } from '../../../generated/prisma/client.js';
import { Product } from '../../../domain/entities/product.entity.js';
import type {
  ProductRepositoryPort,
  CreateProductData,
  UpdateProductData,
} from '../../../application/ports/product.repository.port.js';

export class PrismaProductRepository implements ProductRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Product | null> {
    const raw = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!raw) return null;

    return new Product({
      id: raw.id,
      name: raw.name,
      price: raw.price,
      stock: raw.stock,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findByName(name: string): Promise<Product | null> {
    const raw = await this.prisma.product.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' } },
    });

    if (!raw) return null;

    return new Product({
      id: raw.id,
      name: raw.name,
      price: raw.price,
      stock: raw.stock,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async findAll(): Promise<Product[]> {
    const records = await this.prisma.product.findMany({
      orderBy: { name: 'asc' },
    });

    return records.map(
      (raw) =>
        new Product({
          id: raw.id,
          name: raw.name,
          price: raw.price,
          stock: raw.stock,
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt,
        })
    );
  }

  async create(data: CreateProductData): Promise<Product> {
    const raw = await this.prisma.product.create({
      data: {
        name: data.name.trim(),
        price: data.price,
        stock: data.stock,
      },
    });

    return new Product({
      id: raw.id,
      name: raw.name,
      price: raw.price,
      stock: raw.stock,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  async update(id: string, data: UpdateProductData): Promise<Product | null> {
    try {
      const raw = await this.prisma.product.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name.trim() }),
          ...(data.price !== undefined && { price: data.price }),
          ...(data.stock !== undefined && { stock: data.stock }),
        },
      });

      return new Product({
        id: raw.id,
        name: raw.name,
        price: raw.price,
        stock: raw.stock,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return null;
      }
      throw err;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.product.delete({
        where: { id },
      });
      return true;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        return false;
      }
      throw err;
    }
  }
}
