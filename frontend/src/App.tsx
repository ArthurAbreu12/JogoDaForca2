import { useState, useEffect } from 'react';
import type { EstadoPartida, ItemRanking } from './types';
import { api } from './api/cliente';
import { Mascara } from './components/mascara';
import { Teclado } from './components/teclado';
import { Vidas } from './components/vidas';
import { Ranking } from './components/ranking';
import './App.css';

//  boneco e as vidas
function BonecoForca({ vidasRestantes }: { vidasRestantes: number }) {
  const erros = 6 - vidasRestantes;
  return (
    <svg width="160" height="180" viewBox="0 0 160 180" style={{ stroke: '#e2e8f0', strokeWidth: 4, fill: 'none', strokeLinecap: 'round' }}>
      {/* Base e Poste */}
      <line x1="20" y1="170" x2="100" y2="170" stroke="#475569" />
      <line x1="50" y1="170" x2="50" y2="20" stroke="#475569" />
      <line x1="50" y1="20" x2="115" y2="20" stroke="#475569" />
      <line x1="115" y1="20" x2="115" y2="40" stroke="#38bdf8" />

      {/* Boneco aparece conforme os erros */}
      {erros >= 1 && <circle cx="115" cy="55" r="15" stroke="#f87171" />}
      {erros >= 2 && <line x1="115" y1="70" x2="115" y2="115" stroke="#f87171" />}
      {erros >= 3 && <line x1="115" y1="80" x2="95" y2="100" stroke="#f87171" />}
      {erros >= 4 && <line x1="115" y1="80" x2="135" y2="100" stroke="#f87171" />}
      {erros >= 5 && <line x1="115" y1="115" x2="95" y2="145" stroke="#f87171" />}
      {erros >= 6 && <line x1="115" y1="115" x2="135" y2="145" stroke="#f87171" />}
    </svg>
  );
}

export function App() {
  const [jogador, setJogador] = useState('');
  const [partida, setPartida] = useState<EstadoPartida | null>(null);
  const [ranking, setRanking] = useState<ItemRanking[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

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
    setErro(null);

    try {
      const partidaAtualizada = await api.palpitar(partida.id, letra);
      setPartida(partidaAtualizada);
      
      if (partidaAtualizada.status !== 'em_andamento') {
        carregarRanking();
      }
    } catch (err: unknown) {
      if (err instanceof Error) setErro(err.message);
    }
  }

  function reiniciarJogo() {
    setPartida(null);
    setErro(null); // limpa os erros antigos quando volta pro inicio
    carregarRanking();
  }

  return (
    <div className="dev-window">
      {/* Barra superior estilo IDE / Terminal */}
      <div className="window-header">
        <div className="window-dots">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>
        <div className="window-title">trabalho - jogo da forca</div>
        <div style={{ width: '44px' }}></div>
      </div>

      <div className="window-body">
        {erro && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            fontFamily: "'Fira Code', monospace",
            fontSize: '0.9rem'
          }}>
            ⚠️ {erro}
          </div>
        )}

        {/* TELA DE FIM DE JOGO */}
        {partida && partida.status !== 'em_andamento' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="hero-badge">
              {partida.status === 'vitoria' ? 'BUILD SUCCEEDED' : 'RUNTIME ERROR'}
            </div>
            <h1 style={{ 
              fontSize: '2.5rem', 
              color: partida.status === 'vitoria' ? '#10b981' : '#ef4444',
              marginBottom: '15px'
            }}>
              {partida.status === 'vitoria' ? '🎉 Você Venceu!' : '💀 Fim de Jogo!'}
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '10px' }}>
              A palavra secreta era: <strong style={{ color: '#38bdf8', fontFamily: "'Fira Code', monospace" }}>{partida.palavra}</strong>
            </p>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
              Pontuação da partida: <strong style={{ color: '#fbbf24' }}>+{partida.pontos} pts</strong>
            </p>
            
            <button onClick={reiniciarJogo} className="btn-neon" style={{ maxWidth: '280px' }}>
              Jogar Novamente
            </button>
          </div>
        )}

        {/* TELA DO JOGO EM ANDAMENTO */}
        {partida && partida.status === 'em_andamento' && (
          <div>
            <div className="game-header">
              <div className="tag-info">DEV: <span>{partida.jogador}</span></div>
              <div className="tag-info">STACK: <span>{partida.categoria}</span></div>
              <Vidas vidasRestantes={partida.vidasRestantes} />
            </div>

            <div className="game-stage">
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BonecoForca vidasRestantes={partida.vidasRestantes} />
              </div>
              
              <div>
                <Mascara mascara={partida.mascara} />
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748b', fontFamily: "'Fira Code', monospace" }}>
                  Tentativas: <span style={{ color: '#cbd5e1' }}>{(partida.tentativas || partida.tentativas || []).join(', ') || 'Nenhuma'}</span>
                </p>
              </div>
            </div>

            <div className="teclado-wrapper" style={{ textAlign: 'center', marginBottom: '25px' }}>
              <Teclado 
                tentadas={partida.tentativas || partida.tentativas || []} 
                desabilitado={false} 
                onLetra={enviarPalpite} 
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button onClick={reiniciarJogo} className="btn-danger">
                Abandonar Partida
              </button>
            </div>
          </div>
        )}

        {/*tela inicial*/}

        
        {!partida && (
          <div className="home-grid">
            <div>
              <h1 className="hero-title">Forca Dev</h1>
              <p className="hero-desc">
                Adivinhe termos de programação antes que o código quebre. Use o mesmo apelido para somar seus pontos no ranking!
              </p>

              <form onSubmit={iniciarPartida}>
                <label htmlFor="apelido" style={{ fontSize: '0.85rem', fontWeight: '600', color: '#94a3b8' }}>
                  SEU APELIDO DEV (3 A 20 CARACTERES)
                </label>
                <input
                  id="apelido"
                  type="text"
                  className="dev-input"
                  value={jogador}
                  onChange={(e) => setJogador(e.target.value)}
                  maxLength={20}
                  placeholder="ex: arthur_dev"
                />
                <button
                  type="submit"
                  disabled={!apelidoValido || carregando}
                  className="btn-neon"
                >
                  {carregando ? 'Compilando...' : '▶ Iniciar Partida'}
                </button>
              </form>
            </div>

            <div className="ranking-box">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.2rem' }}>🏆</span>
                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#f8fafc' }}>Top 10 Devs</span>
              </div>
              <Ranking itens={ranking} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}