import { type FastifyInstance, type FastifyRequest, type FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { novaPartidaSchema, palpiteSchema, partidaIdParamSchema } from '../schemas/partida.schema.js';
import { gerarMascara, calcularPontos, VIDAS_INICIAIS } from '../jogo/regras.js';

const prisma = new PrismaClient();

export async function rotasPartidas(app: FastifyInstance) {

  //  POST /api/partidas -cria uma nova partida sorteando uma palavra
  app.post('/partidas', async (req: FastifyRequest, reply: FastifyReply) => {
    const dados = novaPartidaSchema.parse(req.body);

    const totalPalavras = await prisma.palavra.count();
    if (totalPalavras === 0) {
      return reply.status(500).send({ erro: 'Nenhuma palavra cadastrada no banco. Execute o seed.' });
    }

    const randomIndex = Math.floor(Math.random() * totalPalavras);
    const palavras = await prisma.palavra.findMany({
      skip: randomIndex,
      take: 1,
    });
    const palavraSorteada = palavras[0];

    if (!palavraSorteada) {
      return reply.status(500).send({ erro: 'Erro ao sortear palavra.' });
    }

    const novaPartida = await prisma.partida.create({
      data: {
        jogador: dados.jogador,
        palavraId: palavraSorteada.id,
        tentativas: '',
        erros: 0,
        status: 'em_andamento',
        pontos: 0,
      },
      include: { palavra: true },
    });

    const tentativasArr: string[] = [];
    const mascara = gerarMascara(novaPartida.palavra.texto, tentativasArr);
    const vidasRestantes = VIDAS_INICIAIS;

    return reply.status(201).send({
      id: novaPartida.id,
      jogador: novaPartida.jogador,
      categoria: novaPartida.palavra.categoria,
      mascara,
      letrasTentadas: tentativasArr,
      vidasRestantes,
      status: novaPartida.status,
      pontos: novaPartida.pontos,
      palavra: null,
    });
  });

  // GET /api/partidas/:id - retorna o estado atual da partida
  app.get('/partidas/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const params = partidaIdParamSchema.parse(req.params);

    const partida = await prisma.partida.findUnique({
      where: { id: params.id },
      include: { palavra: true },
    });

    if (!partida) {
      return reply.status(404).send({ erro: 'Partida não encontrada' });
    }

    const tentativasArr = partida.tentativas ? [...partida.tentativas] : [];
    const mascara = gerarMascara(partida.palavra.texto, tentativasArr);
    const vidasRestantes = Math.max(0, VIDAS_INICIAIS - partida.erros);

    return reply.send({
      id: partida.id,
      jogador: partida.jogador,
      categoria: partida.palavra.categoria,
      mascara,
      letrasTentadas: tentativasArr,
      vidasRestantes,
      status: partida.status,
      pontos: partida.pontos,
      palavra: partida.status === 'em_andamento' ? null : partida.palavra.texto,
    });
  });

  // POST /api/partidas/:id/palpites - envia uma letra pra partida
  app.post('/partidas/:id/palpites', async (req: FastifyRequest, reply: FastifyReply) => {
    const params = partidaIdParamSchema.parse(req.params);
    const { letra } = palpiteSchema.parse(req.body);

    const partida = await prisma.partida.findUnique({
      where: { id: params.id },
      include: { palavra: true },
    });

    if (!partida) {
      return reply.status(404).send({ erro: 'Partida não encontrada' });
    }

    if (partida.status !== 'em_andamento') {
      return reply.status(409).send({ erro: 'Partida já encerrada' });
    }

    const tentativasArr = partida.tentativas ? [...partida.tentativas] : [];

    if (tentativasArr.includes(letra)) {
      return reply.status(409).send({ erro: 'Letra já tentada' });
    }

    tentativasArr.push(letra);
    let novosErros = partida.erros;

    if (!partida.palavra.texto.includes(letra)) {
      novosErros += 1;
    }

    const vidasRestantes = Math.max(0, VIDAS_INICIAIS - novosErros);
    const mascara = gerarMascara(partida.palavra.texto, tentativasArr);

    let novoStatus: 'em_andamento' | 'vitoria' | 'derrota' = 'em_andamento';
    let novosPontos = 0;
    let finalizadaEmData: Date | null = null;

    if (!mascara.includes('_')) {
      novoStatus = 'vitoria';
      novosPontos = calcularPontos(partida.palavra.texto, vidasRestantes);
      finalizadaEmData = new Date();
    } else if (vidasRestantes === 0) {
      novoStatus = 'derrota';
      novosPontos = 0;
      finalizadaEmData = new Date();
    }

    const partidaAtualizada = await prisma.partida.update({
      where: { id: partida.id },
      data: {
        tentativas: tentativasArr.join(''),
        erros: novosErros,
        status: novoStatus,
        pontos: novosPontos,
        finalizadaEm: finalizadaEmData,
      },
      include: { palavra: true },
    });

    return reply.send({
      id: partidaAtualizada.id,
      jogador: partidaAtualizada.jogador,
      categoria: partidaAtualizada.palavra.categoria,
      mascara,
      letrasTentadas: tentativasArr,
      vidasRestantes,
      status: partidaAtualizada.status,
      pontos: partidaAtualizada.pontos,
      palavra: partidaAtualizada.status === 'em_andamento' ? null : partidaAtualizada.palavra.texto,
    });
  });

  // GET /api/ranking - retorna o top 10 consolidado por jogador
  app.get('/ranking', async (_req: FastifyRequest, reply: FastifyReply) => {
    // Agrupa as partidas de vitória por nome do jogador e soma os pontos
    const rankingAgrupado = await prisma.partida.groupBy({
      by: ['jogador'],
      where: { status: 'vitoria' },
      _sum: {
        pontos: true,
      },
      _max: {
        finalizadaEm: true,
      },
      orderBy: {
        _sum: {
          pontos: 'desc',
        },
      },
      take: 10,
    });

    const ranking = rankingAgrupado.map((item) => ({
      jogador: item.jogador,
      pontos: item._sum.pontos || 0,
      palavra: '-', // Opcional (como agrupa vários jogos, exibe um traço ou o padrão)
      finalizadaEm: item._max.finalizadaEm ? item._max.finalizadaEm.toISOString() : new Date().toISOString(),
    }));

    return reply.send(ranking);
  });
}