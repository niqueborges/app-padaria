import { Product } from './product.entity.js';
import { ValidationError } from '../errors/app-error.js';

describe('Product Entity (Domain)', () => {
  it('should create a valid product instance', () => {
    const product = new Product({
      name: 'Pão Francês',
      price: 18.5,
      stock: 50,
    });

    expect(product.name).toBe('Pão Francês');
    expect(product.price).toBe(18.5);
    expect(product.stock).toBe(50);
  });

  it('should throw ValidationError if name is empty', () => {
    expect(() => {
      new Product({
        name: '   ',
        price: 10,
        stock: 5,
      });
    }).toThrow(ValidationError);
  });

  it('should throw ValidationError if price is zero or negative', () => {
    expect(() => {
      new Product({
        name: 'Bolo',
        price: 0,
        stock: 5,
      });
    }).toThrow(ValidationError);

    expect(() => {
      new Product({
        name: 'Bolo',
        price: -5,
        stock: 5,
      });
    }).toThrow(ValidationError);
  });

  it('should throw ValidationError if stock is negative', () => {
    expect(() => {
      new Product({
        name: 'Bolo',
        price: 15,
        stock: -1,
      });
    }).toThrow(ValidationError);
  });
});
