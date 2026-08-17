import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma } from '../src/infrastructure/database/prisma.client.js';
import { logger } from '../src/shared/logger.js';

async function main(): Promise<void> {
  logger.info('Iniciando o povoamento do banco de dados (seed)...');

  // 1. Criar os dois usuarios base (Pedro e Esposa)
  const passwordHashPedro = await bcrypt.hash('padaria123', 10);
  const passwordHashMaria = await bcrypt.hash('maria123', 10);

  const pedro = await prisma.user.upsert({
    where: { email: 'pedro@padaria.com' },
    update: {},
    create: {
      name: 'Pedro',
      email: 'pedro@padaria.com',
      password: passwordHashPedro,
    },
  });

  const maria = await prisma.user.upsert({
    where: { email: 'maria@padaria.com' },
    update: {},
    create: {
      name: 'Maria',
      email: 'maria@padaria.com',
      password: passwordHashMaria,
    },
  });

  logger.info({
    pedro: { name: pedro.name, email: pedro.email },
    maria: { name: maria.name, email: maria.email },
    message: 'Usuarios base criados ou atualizados com sucesso.',
  });

  // 2. Criar produtos iniciais da padaria
  const initialProducts = [
    { name: 'Pão Francês (kg)', price: 18.5, stock: 50 },
    { name: 'Pão de Queijo (un)', price: 4.5, stock: 100 },
    { name: 'Bolo de Cenoura (fatia)', price: 8.0, stock: 20 },
    { name: 'Café Expresso', price: 6.0, stock: 200 },
    { name: 'Croissant Simples', price: 9.5, stock: 30 },
  ];

  for (const prod of initialProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: prod.name },
    });

    if (!existing) {
      await prisma.product.create({
        data: prod,
      });
      logger.info({ product: prod.name, message: 'Produto inicial inserido.' });
    }
  }

  logger.info('Povoamento concluído com sucesso!');
}

main()
  .catch((e: unknown) => {
    const message = e instanceof Error ? e.message : 'Erro desconhecido';
    logger.error({ error: message }, 'Erro ao executar seed');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
