interface MascaraProps {
  mascara: string[] | string;
}

export function Mascara({ mascara }: MascaraProps) {
  const textoMascara = Array.isArray(mascara) ? mascara.join(' ') : mascara;

  return (
    <div style={{ 
      fontSize: '2.4rem', 
      letterSpacing: '10px', 
      fontFamily: "'Fira Code', monospace",
      fontWeight: '700',
      color: '#38bdf8',
      textShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
      wordBreak: 'break-word',
      textAlign: 'center'
    }}>
      {textoMascara}
    </div>
  );
}