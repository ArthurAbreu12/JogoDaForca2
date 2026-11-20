import { describe, it, expect } from 'vitest';
import { gerarMascara, calcularPontos } from '../src/jogo/regras';

describe('Regras do Jogo - Forca Dev', () => {
  
  it('deve gerar a máscara corretamente ocultando as letras não tentadas com sublinhado', () => {
    const palavra = 'PROMISE';
    const tentadas = ['P', 'E'];
    expect(gerarMascara(palavra, tentadas)).toBe('P_____%E');
  });

  it('deve revelar todas as letras na máscara se todas foram tentadas corretamente', () => {
    const palavra = 'HOOKS';
    const tentadas = ['H', 'O', 'K', 'S'];
    expect(gerarMascara(palavra, tentadas)).toBe('HOOKS');
  });

  it('deve calcular os pontos corretamente na vitória conforme a RN06 (exemplo do enunciado)', () => {
    // palavra PROMISE tem 7 letras distintas (P, R, O, M, I, S, E)
    // com 4 vidas restantes: (4 * 10) + (7 * 5) = 40 + 35 = 75 pontos
    const palavra = 'PROMISE';
    const vidasRestantes = 4;
    expect(calcularPontos(palavra, vidasRestantes)).toBe(75);
  });

  it('deve calcular os pontos corretamente com o total de vidas iniciais', () => {
    // palavra REACT tem 5 letras distintas (R, E, A, C, T)
    // com 6 vidas restantes: (6 * 10) + (5 * 5) = 60 + 25 = 85 pontos
    const palavra = 'REACT';
    const vidasRestantes = 6;
    expect(calcularPontos(palavra, vidasRestantes)).toBe(85);
  });

});