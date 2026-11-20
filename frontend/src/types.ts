export type StatusPartida = 'em_andamento' | 'vitoria' | 'derrota';

export interface EstadoPartida {
  id: number;
  jogador: string;
  categoria: string;
  mascara: string; // ex.: "PR_M_SE"
  tentativas: string[]; // ex.: ["E", "P", "R", "S", "M", "A"]
  vidasRestantes: number; // 0 a 6
  status: StatusPartida;
  pontos: number; // 0 enquanto não houver vitória
  palavra: string | null; // null enquanto status == 'em_andamento'
}

export interface ItemRanking {
  jogador: string;
  pontos: number;
  palavra: string;
  finalizadaEm: string; // data ISO
}