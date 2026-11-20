interface VidasProps {
  vidasRestantes: number; // 0 a 6
}

export function Vidas({ vidasRestantes }: VidasProps) {
  return (
    <div style={{ margin: '15px 0', fontSize: '1.2rem' }}>
      <span>Vidas restantes: </span>
      <span style={{ color: 'red', fontWeight: 'bold' }}>
        {'❤️'.repeat(vidasRestantes)}{'🖤'.repeat(6 - vidasRestantes)}
      </span>
      <span> ({vidasRestantes}/6)</span>
    </div>
  );
}