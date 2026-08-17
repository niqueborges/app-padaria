import { z } from 'zod';

export const createSaleItemSchema = z.object({
  productId: z
    .string({ message: 'O ID do produto é obrigatório.' })
    .uuid('ID do produto inválido (deve ser um UUID).'),
  quantity: z
    .number({ message: 'A quantidade é obrigatória.' })
    .int('A quantidade deve ser um número inteiro.')
    .positive('A quantidade deve ser maior que zero.'),
});

export const createSaleSchema = z.object({
  items: z
    .array(createSaleItemSchema, { message: 'A lista de itens da venda é obrigatória.' })
    .min(1, 'A venda precisa de pelo menos 1 item.'),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type CreateSaleItemInput = z.infer<typeof createSaleItemSchema>;

export interface SaleItemResponseDTO {
  id: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleResponseDTO {
  id: string;
  totalAmount: number;
  createdAt: string;
  items: SaleItemResponseDTO[];
}
