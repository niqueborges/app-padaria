import { ReportService } from './report.service.js';
import type { SaleRepositoryPort, RevenueReport } from '../ports/sale.repository.port.js';
import { ValidationError } from '../../domain/errors/app-error.js';

describe('ReportService (Application)', () => {
  let reportService: ReportService;
  let mockSaleRepository: jest.Mocked<SaleRepositoryPort>;

  const mockDailyReport: RevenueReport = {
    period: '2026-08-17',
    totalSales: 10,
    totalRevenue: 350.5,
  };

  const mockMonthlyReport: RevenueReport = {
    period: '2026-08',
    totalSales: 250,
    totalRevenue: 8900.75,
  };

  beforeEach(() => {
    mockSaleRepository = {
      create: jest.fn(),
      createWithStockDeduction: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      getDailyRevenue: jest.fn(),
      getMonthlyRevenue: jest.fn(),
    };

    reportService = new ReportService(mockSaleRepository);
  });

  describe('getDailyReport', () => {
    it('should return daily revenue report for a specific date', async () => {
      mockSaleRepository.getDailyRevenue.mockResolvedValue(mockDailyReport);

      const result = await reportService.getDailyReport('2026-08-17');

      expect(mockSaleRepository.getDailyRevenue).toHaveBeenCalledWith(expect.any(Date));
      expect(result).toEqual(mockDailyReport);
    });

    it('should return daily revenue report for current date when date is omitted', async () => {
      mockSaleRepository.getDailyRevenue.mockResolvedValue(mockDailyReport);

      const result = await reportService.getDailyReport();

      expect(mockSaleRepository.getDailyRevenue).toHaveBeenCalledWith(expect.any(Date));
      expect(result).toEqual(mockDailyReport);
    });

    it('should throw ValidationError if date string is invalid', async () => {
      await expect(reportService.getDailyReport('data-invalida')).rejects.toThrow(ValidationError);
      expect(mockSaleRepository.getDailyRevenue).not.toHaveBeenCalled();
    });
  });

  describe('getMonthlyReport', () => {
    it('should return monthly revenue report for valid year and month', async () => {
      mockSaleRepository.getMonthlyRevenue.mockResolvedValue(mockMonthlyReport);

      const result = await reportService.getMonthlyReport(2026, 8);

      expect(mockSaleRepository.getMonthlyRevenue).toHaveBeenCalledWith(2026, 8);
      expect(result).toEqual(mockMonthlyReport);
    });

    it('should throw ValidationError if month is invalid', async () => {
      await expect(reportService.getMonthlyReport(2026, 13)).rejects.toThrow(ValidationError);
      await expect(reportService.getMonthlyReport(2026, 0)).rejects.toThrow(ValidationError);
      expect(mockSaleRepository.getMonthlyRevenue).not.toHaveBeenCalled();
    });

    it('should throw ValidationError if year is invalid', async () => {
      await expect(reportService.getMonthlyReport(1999, 8)).rejects.toThrow(ValidationError);
      expect(mockSaleRepository.getMonthlyRevenue).not.toHaveBeenCalled();
    });
  });
});
