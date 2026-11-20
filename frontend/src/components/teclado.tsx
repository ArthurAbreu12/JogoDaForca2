interface TecladoProps {
  tentadas: string[];
  desabilitado: boolean;
  onLetra: (letra: string) => void;
}

const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function Teclado({ tentadas = [], desabilitado, onLetra }: TecladoProps) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '400px', justifyContent: 'center' }}>
      {LETRAS.map((letra) => {
        const jaFoiTentada = tentadas.includes(letra);
        return (
          <button
            key={letra}
            disabled={desabilitado || jaFoiTentada}
            onClick={() => onLetra(letra)}
            style={{
              padding: '10px 14px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: desabilitado || jaFoiTentada ? 'not-allowed' : 'pointer',
              backgroundColor: jaFoiTentada ? '#333333' : '#f0f0f0',
              color: jaFoiTentada ? '#666666' : '#000000',
              border: 'none',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
          >
            {letra}
          </button>
        );
      })}
    </div>
  );
}