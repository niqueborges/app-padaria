import { ValidationError } from '../errors/app-error.js';

export interface SaleItemProps {
  id?: string;
  saleId?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  productName?: string;
}

export class SaleItem {
  public readonly id?: string;
  public readonly saleId?: string;
  public readonly productId: string;
  public readonly quantity: number;
  public readonly unitPrice: number;
  public readonly productName?: string;

  constructor(props: SaleItemProps) {
    if (props.quantity <= 0) {
      throw new ValidationError('A quantidade do item vendido deve ser maior que zero.');
    }

    if (props.unitPrice <= 0) {
      throw new ValidationError('O preço unitário deve ser maior que zero.');
    }

    this.id = props.id;
    this.saleId = props.saleId;
    this.productId = props.productId;
    this.quantity = props.quantity;
    this.unitPrice = props.unitPrice;
    this.productName = props.productName;
  }

  public get subtotal(): number {
    return Number((this.quantity * this.unitPrice).toFixed(2));
  }
}

export interface SaleProps {
  id?: string;
  totalAmount?: number;
  createdAt?: Date;
  items: SaleItem[];
}

export class Sale {
  public readonly id?: string;
  public readonly totalAmount: number;
  public readonly createdAt?: Date;
  public readonly items: SaleItem[];

  constructor(props: SaleProps) {
    if (!props.items || props.items.length === 0) {
      throw new ValidationError('A venda precisa conter pelo menos um item.');
    }

    this.id = props.id;
    this.items = props.items;
    this.createdAt = props.createdAt;

    const calculatedTotal = props.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.totalAmount =
      props.totalAmount !== undefined ? props.totalAmount : Number(calculatedTotal.toFixed(2));
  }
}
