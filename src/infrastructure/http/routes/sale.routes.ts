import { Router } from 'express';
import { prisma } from '../../database/prisma.client.js';
import { PrismaSaleRepository } from '../../database/repositories/prisma-sale.repository.js';
import { PrismaProductRepository } from '../../database/repositories/prisma-product.repository.js';
import { SaleService } from '../../../application/services/sale.service.js';
import { SaleController } from '../controllers/sale.controller.js';

const saleRepository = new PrismaSaleRepository(prisma);
const productRepository = new PrismaProductRepository(prisma);
const saleService = new SaleService(saleRepository, productRepository);
const saleController = new SaleController(saleService);

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     SaleItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         productId:
 *           type: string
 *           format: uuid
 *         productName:
 *           type: string
 *           example: Pão Francês (kg)
 *         quantity:
 *           type: integer
 *           example: 2
 *         unitPrice:
 *           type: number
 *           example: 18.50
 *         subtotal:
 *           type: number
 *           example: 37.00
 *     Sale:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         totalAmount:
 *           type: number
 *           example: 37.00
 *         createdAt:
 *           type: string
 *           format: date-time
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SaleItem'
 *     CreateSaleItemInput:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         productId:
 *           type: string
 *           format: uuid
 *           example: d730d9ca-1b85-4e59-98e5-46e9e6dfdfd0
 *         quantity:
 *           type: integer
 *           example: 2
 *     CreateSaleInput:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreateSaleItemInput'
 */

/**
 * @openapi
 * /api/sales:
 *   post:
 *     summary: Registrar uma nova venda
 *     tags:
 *       - Vendas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSaleInput'
 *     responses:
 *       201:
 *         description: Venda registrada com sucesso e estoque atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       400:
 *         description: Dados inválidos ou estoque insuficiente
 *       404:
 *         description: Produto não encontrado
 */
router.post('/', saleController.create);

/**
 * @openapi
 * /api/sales:
 *   get:
 *     summary: Listar todas as vendas registradas
 *     tags:
 *       - Vendas
 *     responses:
 *       200:
 *         description: Lista de vendas registradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sale'
 */
router.get('/', saleController.list);

/**
 * @openapi
 * /api/sales/{id}:
 *   get:
 *     summary: Obter detalhes de uma venda por ID
 *     tags:
 *       - Vendas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalhes da venda e seus itens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sale'
 *       404:
 *         description: Venda não encontrada
 */
router.get('/:id', saleController.getById);

export { router as saleRoutes };
