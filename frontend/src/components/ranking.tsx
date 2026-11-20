import type { ItemRanking } from '../types';

interface RankingProps {
  itens: ItemRanking[];
}

export function Ranking({ itens }: RankingProps) {
  return (
    <div style={{ marginTop: '20px' }}>
      <h3>🏆 Top 10 Ranking</h3>
      <table border={1} cellPadding={8} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Posição</th>
            <th>Jogador</th>
            <th>Pontos</th>
            <th>Palavra</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, index) => (
            <tr key={index}>
              <td style={{ textAlign: 'center' }}>{index + 1}º</td>
              <td>{item.jogador}</td>
              <td style={{ textAlign: 'center' }}>{item.pontos}</td>
              <td>{item.palavra}</td>
              <td>{new Date(item.finalizadaEm).toLocaleDateString()}</td>
            </tr>
          ))}
          {itens.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center' }}>Nenhuma partida finalizada ainda.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}