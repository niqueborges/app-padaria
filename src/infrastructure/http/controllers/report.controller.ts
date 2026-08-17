import type { Request, Response } from 'express';
import type { ReportService } from '../../../application/services/report.service.js';
import {
  dailyReportQuerySchema,
  monthlyReportQuerySchema,
} from '../../../application/dto/report.dto.js';
import { ValidationError } from '../../../domain/errors/app-error.js';

export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  getDaily = async (req: Request, res: Response): Promise<void> => {
    const parseResult = dailyReportQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      throw new ValidationError(issue?.message ?? 'Parâmetros de consulta inválidos.');
    }

    const report = await this.reportService.getDailyReport(parseResult.data.date);
    res.status(200).json(report);
  };

  getMonthly = async (req: Request, res: Response): Promise<void> => {
    const parseResult = monthlyReportQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      throw new ValidationError(issue?.message ?? 'Parâmetros de consulta inválidos.');
    }

    const { year, month } = parseResult.data;
    const report = await this.reportService.getMonthlyReport(year, month);
    res.status(200).json(report);
  };
}
