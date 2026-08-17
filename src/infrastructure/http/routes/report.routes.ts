import { Router } from 'express';
import { prisma } from '../../database/prisma.client.js';
import { PrismaSaleRepository } from '../../database/repositories/prisma-sale.repository.js';
import { ReportService } from '../../../application/services/report.service.js';
import { ReportController } from '../controllers/report.controller.js';

const saleRepository = new PrismaSaleRepository(prisma);
const reportService = new ReportService(saleRepository);
const reportController = new ReportController(reportService);

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     RevenueReport:
 *       type: object
 *       properties:
 *         period:
 *           type: string
 *           example: "2026-08-17"
 *         totalSales:
 *           type: integer
 *           example: 12
 *         totalRevenue:
 *           type: number
 *           example: 450.75
 */

/**
 * @openapi
 * /api/reports/daily:
 *   get:
 *     summary: Obter relatório de faturamento diário
 *     tags:
 *       - Relatórios
 *     parameters:
 *       - in: query
 *         name: date
 *         required: false
 *         schema:
 *           type: string
 *           example: "2026-08-17"
 *         description: Data no formato AAAA-MM-DD (padrão é o dia atual)
 *     responses:
 *       200:
 *         description: Relatório de faturamento do dia solicitado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RevenueReport'
 *       400:
 *         description: Formato de data inválido
 */
router.get('/daily', reportController.getDaily);

/**
 * @openapi
 * /api/reports/monthly:
 *   get:
 *     summary: Obter relatório de faturamento mensal
 *     tags:
 *       - Relatórios
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2026
 *         description: Ano de referência (ex 2026)
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           example: 8
 *         description: Mês de referência (1 a 12)
 *     responses:
 *       200:
 *         description: Relatório de faturamento do mês solicitado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RevenueReport'
 *       400:
 *         description: Parâmetros de ano ou mês inválidos
 */
router.get('/monthly', reportController.getMonthly);

export { router as reportRoutes };
