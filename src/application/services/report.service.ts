import type { SaleRepositoryPort, RevenueReport } from '../ports/sale.repository.port.js';
import { ValidationError } from '../../domain/errors/app-error.js';

export class ReportService {
  constructor(private readonly saleRepository: SaleRepositoryPort) {}

  async getDailyReport(dateInput?: string): Promise<RevenueReport> {
    let targetDate: Date;

    if (dateInput) {
      targetDate = new Date(`${dateInput}T00:00:00`);
      if (isNaN(targetDate.getTime())) {
        throw new ValidationError('Data informada é inválida.');
      }
    } else {
      targetDate = new Date();
    }

    return this.saleRepository.getDailyRevenue(targetDate);
  }

  async getMonthlyReport(year: number, month: number): Promise<RevenueReport> {
    if (month < 1 || month > 12) {
      throw new ValidationError('O mês deve estar entre 1 e 12.');
    }

    if (year < 2000 || year > 2100) {
      throw new ValidationError('O ano deve estar entre 2000 e 2100.');
    }

    return this.saleRepository.getMonthlyRevenue(year, month);
  }
}
