export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleItem {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export interface Sale {
  id: string;
  totalAmount: number;
  createdAt: string;
  items: SaleItem[];
}

export interface RevenueReport {
  period: string;
  totalSales: number;
  totalRevenue: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
