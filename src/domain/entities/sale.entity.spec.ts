import { Sale, SaleItem } from './sale.entity.js';
import { ValidationError } from '../errors/app-error.js';

describe('Sale and SaleItem Entities (Domain)', () => {
  it('should calculate correct subtotal and sale totalAmount automatically', () => {
    const item1 = new SaleItem({
      productId: 'prod-1',
      quantity: 2,
      unitPrice: 5.5,
    });

    const item2 = new SaleItem({
      productId: 'prod-2',
      quantity: 3,
      unitPrice: 10.0,
    });

    expect(item1.subtotal).toBe(11.0);
    expect(item2.subtotal).toBe(30.0);

    const sale = new Sale({
      items: [item1, item2],
    });

    expect(sale.totalAmount).toBe(41.0);
    expect(sale.items.length).toBe(2);
  });

  it('should throw ValidationError if sale has no items', () => {
    expect(() => {
      new Sale({
        items: [],
      });
    }).toThrow(ValidationError);
  });

  it('should throw ValidationError if item quantity is zero or negative', () => {
    expect(() => {
      new SaleItem({
        productId: 'prod-1',
        quantity: 0,
        unitPrice: 10,
      });
    }).toThrow(ValidationError);
  });

  it('should throw ValidationError if item unitPrice is zero or negative', () => {
    expect(() => {
      new SaleItem({
        productId: 'prod-1',
        quantity: 2,
        unitPrice: 0,
      });
    }).toThrow(ValidationError);
  });
});
