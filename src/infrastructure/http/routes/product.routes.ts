import { Router } from 'express';
import { prisma } from '../../database/prisma.client.js';
import { PrismaProductRepository } from '../../database/repositories/prisma-product.repository.js';
import { ProductService } from '../../../application/services/product.service.js';
import { ProductController } from '../controllers/product.controller.js';

const productRepository = new PrismaProductRepository(prisma);
const productService = new ProductService(productRepository);
const productController = new ProductController(productService);

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: Pão Francês (kg)
 *         price:
 *           type: number
 *           example: 18.50
 *         stock:
 *           type: integer
 *           example: 50
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateProductInput:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - stock
 *       properties:
 *         name:
 *           type: string
 *           example: Pão Francês (kg)
 *         price:
 *           type: number
 *           example: 18.50
 *         stock:
 *           type: integer
 *           example: 50
 *     UpdateProductInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Pão Francês Especial
 *         price:
 *           type: number
 *           example: 19.90
 *         stock:
 *           type: integer
 *           example: 60
 */

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Cadastrar novo produto
 *     tags:
 *       - Produtos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductInput'
 *     responses:
 *       201:
 *         description: Produto cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dados de entrada inválidos
 *       409:
 *         description: Já existe um produto com este nome
 */
router.post('/', productController.create);

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Listar todos os produtos
 *     tags:
 *       - Produtos
 *     responses:
 *       200:
 *         description: Lista de produtos cadastrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', productController.list);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Obter detalhes de um produto por ID
 *     tags:
 *       - Produtos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Detalhes do produto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:id', productController.getById);

/**
 * @openapi
 * /api/products/{id}:
 *   put:
 *     summary: Atualizar dados de um produto
 *     tags:
 *       - Produtos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductInput'
 *     responses:
 *       200:
 *         description: Produto atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produto não encontrado
 *       409:
 *         description: Conflito com nome de outro produto
 */
router.put('/:id', productController.update);

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Remover um produto
 *     tags:
 *       - Produtos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Produto removido com sucesso
 *       404:
 *         description: Produto não encontrado
 */
router.delete('/:id', productController.delete);

export { router as productRoutes };
