import { ValidationError } from '../errors/app-error.js';

export interface ProductProps {
  id?: string;
  name: string;
  price: number;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  public readonly id?: string;
  public readonly name: string;
  public readonly price: number;
  public readonly stock: number;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(props: ProductProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('O nome do produto é obrigatório.');
    }

    if (props.price <= 0) {
      throw new ValidationError('O preço do produto deve ser maior que zero.');
    }

    if (props.stock < 0) {
      throw new ValidationError('O estoque do produto não pode ser negativo.');
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.price = props.price;
    this.stock = props.stock;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
