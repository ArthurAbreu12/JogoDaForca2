export const  VIDAS_INICIAIS =6;

export interface DadosPartida{
    id: number
    jogador: string
    categoria: string 
    palavraSecreta: string
    tentativas: string[]
    vidasRestantes: number
    status: 'em_andamento' | 'vitoria' | 'derrota'
    pontos: number
}
//mostra as letras q ja foram e troca as outras por _
export function gerarMascara(palavra: string, tentadas:string[]): string{
    return [...palavra].map((letra)=>(tentadas.includes(letra) ? letra: '_')).join()
}
//calcula os pontos 
export function calcularPontos(palavra: string, vidasRestantes: number): number{
    const letrasDistintas = new Set(palavra).size
    return vidasRestantes * 10 + letrasDistintas * 5 
}