import Fastify, { type FastifyError, type FastifyRequest, type FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import { ZodError } from 'zod';
import { rotasPartidas } from './routes/partida.routes.js'; // Ajuste conforme o caminho das suas rotas

export const app = Fastify({
  logger: true,
});

// registra o cors
await app.register(cors, {
  origin: true, 
});

// registra as rotas com um prefixo /api 
await app.register(rotasPartidas, { prefix: '/api' });

// middleware central de tratamento de erros 
app.setErrorHandler((error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
  // tratamento de erros de validacao do zod 
  if (error instanceof ZodError) {
    return reply.status(400).send({
      erro: 'Dados inválidos',
      detalhes: error.issues,
    });
  }

  // tratamento de erros (ex:409 conflito, 404 não encontrado)
  if ('status' in error && typeof error.status === 'number') {
    return reply.status(error.status).send({
      erro: error.message,
    });
  }

  // Erro genérico / interno do servidor (500)
  request.log.error(error);
  return reply.status(500).send({
    erro: 'Erro interno do servidor',
  });
});