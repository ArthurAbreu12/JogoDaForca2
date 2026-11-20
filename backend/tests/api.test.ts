import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../src/app'; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
  await app.ready(); //prepara o fastify pros testes
});

afterAll(async () => {
  await prisma.$disconnect();
  await app.close();
});

describe('Testes de Integração da API - Forca Dev', () => {

  let partidaId: number;

  it('deve criar uma nova partida com sucesso (POST /api/partidas)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/partidas',
      payload: { jogador: 'ana' }
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty('id');
    expect(body.jogador).toBe('ana');
    expect(body.status).toBe('em_andamento');
    expect(body.vidasRestantes).toBe(6); 
    expect(body.palavra).toBeNull(); 

    partidaId = body.id;
  });

  it('deve recusar um apelido muito curto com 400 (POST /api/partidas)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/partidas',
      payload: { jogador: 'a' } // menor que 3 caracteres
    });

    expect(response.statusCode).toBe(400);
  });

  it('deve retornar o estado da partida pelo ID (GET /api/partidas/:id)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/partidas/${partidaId}`
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.id).toBe(partidaId);
  });

  it('deve retornar o ranking de vitórias (GET /api/ranking)', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/ranking'
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(Array.isArray(body)).toBe(true);
  });

});