import type { Sale } from '../../domain/entities/sale.entity.js';

export interface CreateSaleItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleData {
  totalAmount: number;
  items: CreateSaleItemData[];
}

export interface RevenueReport {
  period: string;
  totalSales: number;
  totalRevenue: number;
}

export interface SaleRepositoryPort {
  create(data: CreateSaleData): Promise<Sale>;
  findAll(): Promise<Sale[]>;
  findById(id: string): Promise<Sale | null>;
  getDailyRevenue(date: Date): Promise<RevenueReport>;
  getMonthlyRevenue(year: number, month: number): Promise<RevenueReport>;
}
