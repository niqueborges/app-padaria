import { z } from 'zod';

export const dailyReportQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido. Use AAAA-MM-DD.')
    .optional(),
});

export const monthlyReportQuerySchema = z.object({
  year: z.coerce
    .number({ message: 'O ano deve ser um número válido.' })
    .int('O ano deve ser um número inteiro.')
    .min(2000, 'Ano deve ser igual ou superior a 2000.')
    .max(2100, 'Ano deve ser inferior a 2100.'),
  month: z.coerce
    .number({ message: 'O mês deve ser um número válido.' })
    .int('O mês deve ser um número inteiro.')
    .min(1, 'Mês deve estar entre 1 e 12.')
    .max(12, 'Mês deve estar entre 1 e 12.'),
});

export type DailyReportQuery = z.infer<typeof dailyReportQuerySchema>;
export type MonthlyReportQuery = z.infer<typeof monthlyReportQuerySchema>;

export interface RevenueReportDTO {
  period: string;
  totalSales: number;
  totalRevenue: number;
}
