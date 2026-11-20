interface MascaraProps {
  mascara: string[] | string;
}

export function Mascara({ mascara }: MascaraProps) {
  // Se for array, transforma em string limpa sem vírgulas feias
  const textoMascara = Array.isArray(mascara) ? mascara.join(' ') : mascara.split('').join(' ');

  return (
    <div style={{ 
      fontSize: '2.5rem', 
      letterSpacing: '8px', 
      margin: '20px 0', 
      fontFamily: 'monospace',
      fontWeight: 'bold',
      color: '#ffffff'
    }}>
      {textoMascara}
    </div>
  );
}