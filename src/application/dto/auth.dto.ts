import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ message: 'O e-mail é obrigatório.' })
    .email('Formato de e-mail inválido.')
    .trim()
    .toLowerCase(),
  password: z.string({ message: 'A senha é obrigatória.' }).min(1, 'A senha não pode estar vazia.'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponseDTO {
  accessToken: string;
  user: AuthUserDTO;
}

export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
}
