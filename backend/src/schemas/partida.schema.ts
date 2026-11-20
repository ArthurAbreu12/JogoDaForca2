import { z } from 'zod';

// validacao para criar nova partida POST /api/partidas
export const novaPartidaSchema = z.object({
  jogador: z
    .string({ message: 'O nome do jogador é obrigatório' })
    .trim()
    .min(3, 'O apelido deve ter pelo menos 3 caracteres')
    .max(20, 'O apelido deve ter no máximo 20 caracteres'),
});

// validando um palpite: POST /api/partidas/:id/palpites 
export const palpiteSchema = z.object({
  letra: z
    .string({ message: 'A letra é obrigatória' })
    .regex(/^[a-zA-Z]$/, 'Envie uma única letra de A a Z')
    .transform((l) => l.toUpperCase()),
});

// id nas rotas GET /api/partidas/:id e POST /api/partidas/:id/palpites
export const partidaIdParamSchema = z.object({
  id: z.coerce
    .number({ message: 'O ID da partida deve ser um número' })
    .int('O ID deve ser um número inteiro')
    .positive('O ID deve ser positivo'),
});

export type NovaPartidaInput = z.infer<typeof novaPartidaSchema>;
export type PalpiteInput = z.infer<typeof palpiteSchema>;