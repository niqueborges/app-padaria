import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string({ message: 'O nome do produto é obrigatório.' })
    .min(2, 'O nome deve ter no mínimo 2 caracteres.')
    .trim(),
  price: z
    .number({ message: 'O preço do produto é obrigatório.' })
    .positive('O preço deve ser maior que zero.'),
  stock: z
    .number({ message: 'A quantidade em estoque é obrigatória.' })
    .int('O estoque deve ser um número inteiro.')
    .min(0, 'O estoque não pode ser negativo.'),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export interface ProductResponseDTO {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}
