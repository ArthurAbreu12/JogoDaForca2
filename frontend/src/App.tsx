import { useState, useEffect } from 'react';
import type { EstadoPartida, ItemRanking } from './types';
import { api } from './api/cliente';
import { Mascara } from './components/mascara';
import { Teclado } from './components/teclado';
import { Vidas } from './components/vidas';
import { Ranking } from './components/ranking';

export function App() {
  const [jogador, setJogador] = useState('');
  const [partida, setPartida] = useState<EstadoPartida | null>(null);
  const [ranking, setRanking] = useState<ItemRanking[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  // carrega o ranking ao abrir a aplicacao
  useEffect(() => {
    carregarRanking();
  }, []);

  async function carregarRanking() {
    try {
      const dados = await api.ranking();
      setRanking(dados);
    } catch (err: unknown) {
      if (err instanceof Error) setErro(err.message);
    }
  }

  // validacao do nome 
  const apelidoValido = jogador.trim().length >= 3 && jogador.trim().length <= 20;

  async function iniciarPartida(e: React.FormEvent) {
    e.preventDefault();
    if (!apelidoValido) return;

    setCarregando(true);
    setErro(null);
    try {
      const novaPartida = await api.novaPartida(jogador.trim());
      setPartida(novaPartida);
    } catch (err: unknown) {
      if (err instanceof Error) setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function enviarPalpite(letra: string) {
    if (!partida || partida.status !== 'em_andamento') return;

    try {
      const partidaAtualizada = await api.palpitar(partida.id, letra);
      setPartida(partidaAtualizada);
      
      // se a partida encerrou, atualiza o ranking em segundo plano
      if (partidaAtualizada.status !== 'em_andamento') {
        carregarRanking();
      }
    } catch (err: unknown) {
      if (err instanceof Error) setErro(err.message);
    }
  }

  function reiniciarJogo() {
    setPartida(null);
    setJogador('');
    carregarRanking();
  }

  // tela do final do jogo
  if (partida && partida.status !== 'em_andamento') {
    const vitoria = partida.status === 'vitoria';
    return (
      <div style={{ textAlign: 'center', padding: '30px', fontFamily: 'sans-serif' }}>
        <h1>{vitoria ? '🎉 Parabéns, Você Venceu!' : '😢 Fim de Jogo - Derrota!'}</h1>
        <p style={{ fontSize: '1.2rem' }}>A palavra secreta era: <strong>{partida.palavra}</strong></p>
        <p style={{ fontSize: '1.2rem' }}>Pontuação total: <strong>{partida.pontos} pontos</strong></p>
        
        <button 
          onClick={reiniciarJogo}
          style={{ padding: '12px 24px', fontSize: '1rem', cursor: 'pointer', marginTop: '20px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Jogar de novo
        </button>
      </div>
    );
  }

  // tela do jogo rodando
  if (partida) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', margin: '0 auto' }}>
        <h2>Forca Dev</h2>
        <p>Categoria: <strong>{partida.categoria}</strong> | Jogador: <strong>{partida.jogador}</strong></p>
        
        {erro && <div style={{ color: 'red', margin: '10px 0' }}>{erro}</div>}

        <Vidas vidasRestantes={partida.vidasRestantes} />
        <Mascara mascara={partida.mascara} />

        {/* Linha protegida contra valores undefined */}
        <p style={{ margin: '15px 0' }}>
          Letras tentadas: <strong>{(partida.tentativas || []).join(', ') || 'Nenhuma'}</strong>
        </p>

        <Teclado 
          tentadas={partida.tentativas || []} 
          desabilitado={false} 
          onLetra={enviarPalpite} 
        />

        <div style={{ marginTop: '30px' }}>
          <button onClick={reiniciarJogo} style={{ padding: '8px 16px', cursor: 'pointer', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}>
            Desistir / Sair
          </button>
        </div>
      </div>
    );
  }

  // tela inicial
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>🎮 Forca Dev</h1>
      
      {erro && <div style={{ color: 'red', textAlign: 'center', margin: '10px 0' }}>{erro}</div>}

      <form onSubmit={iniciarPartida} style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div>
          <label htmlFor="apelido" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Digite seu apelido (3 a 20 caracteres):
          </label>
          <input
            id="apelido"
            type="text"
            value={jogador}
            onChange={(e) => setJogador(e.target.value)}
            maxLength={20}
            style={{ padding: '10px', fontSize: '1rem', width: '250px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <button
          type="submit"
          disabled={!apelidoValido || carregando}
          style={{
            marginTop: '15px',
            padding: '10px 25px',
            fontSize: '1rem',
            cursor: !apelidoValido || carregando ? 'not-allowed' : 'pointer',
            backgroundColor: !apelidoValido ? '#ccc' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {carregando ? 'Iniciando...' : 'Jogar'}
        </button>
      </form>

      <Ranking itens={ranking} />
    </div>
  );
}