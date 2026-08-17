import type { PrismaClient } from '../../../generated/prisma/client.js';
import { Sale, SaleItem } from '../../../domain/entities/sale.entity.js';
import type {
  SaleRepositoryPort,
  CreateSaleData,
  RevenueReport,
} from '../../../application/ports/sale.repository.port.js';

export class PrismaSaleRepository implements SaleRepositoryPort {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateSaleData): Promise<Sale> {
    const raw = await this.prisma.sale.create({
      data: {
        totalAmount: data.totalAmount,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const items = raw.items.map(
      (item) =>
        new SaleItem({
          id: item.id,
          saleId: item.saleId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          productName: item.product?.name,
        })
    );

    return new Sale({
      id: raw.id,
      totalAmount: raw.totalAmount,
      createdAt: raw.createdAt,
      items,
    });
  }

  async findAll(): Promise<Sale[]> {
    const records = await this.prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map(
      (raw) =>
        new Sale({
          id: raw.id,
          totalAmount: raw.totalAmount,
          createdAt: raw.createdAt,
          items: raw.items.map(
            (item) =>
              new SaleItem({
                id: item.id,
                saleId: item.saleId,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                productName: item.product?.name,
              })
          ),
        })
    );
  }

  async findById(id: string): Promise<Sale | null> {
    const raw = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!raw) return null;

    return new Sale({
      id: raw.id,
      totalAmount: raw.totalAmount,
      createdAt: raw.createdAt,
      items: raw.items.map(
        (item) =>
          new SaleItem({
            id: item.id,
            saleId: item.saleId,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            productName: item.product?.name,
          })
      ),
    });
  }

  async getDailyRevenue(date: Date): Promise<RevenueReport> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    return {
      period: startOfDay.toISOString().split('T')[0] ?? '',
      totalSales: sales.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
    };
  }

  async getMonthlyRevenue(year: number, month: number): Promise<RevenueReport> {
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    const formattedMonth = String(month).padStart(2, '0');

    return {
      period: `${year}-${formattedMonth}`,
      totalSales: sales.length,
      totalRevenue: Number(totalRevenue.toFixed(2)),
    };
  }
}
