import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

async function main(){
    console.log("Iniciando o seed com prisma")

    const palavras =[
        //javascript
        {texto: 'PROMISE', categoria: 'JavaScript'},
        {texto: 'CALLBACK', categoria: 'JavaScript'},
        {texto: 'VARIABLE', categoria: 'JavaScript'},
        {texto: 'BOOLEAN', categoria: 'JavaScript'},
        {texto: 'FUNCTION', categoria: 'JavaScript'},
        {texto: 'ASYNC', categoria: 'JavaScript'},
        {texto: 'OBJECT', categoria: 'JavaScript'},
    
        //typescript
        {texto: 'INTERFACE', categoria:'TypeScript'},
        {texto: 'GENERICS', categoria:'TypeScript'},
        {texto: 'UNION', categoria:'TypeScript'},
        {texto: 'TUPLE', categoria:'TypeScript'},
        {texto: 'ENUM', categoria:'TypeScript'},
        {texto: 'DECORATOR', categoria:'TypeScript'},
      
        //react
        {texto: 'COMPONENTE', categoria:'React'},
        {texto: 'EFFECT', categoria:'React'},
        {texto: 'HOOKS', categoria:'React'},
        {texto: 'STATE', categoria:'React'},
        {texto: 'ROUTER', categoria:'React'},
        {texto: 'CONTEXT', categoria:'React'},
        {texto: 'PROPS', categoria:'React'},
    ]
    
    for (const item of palavras) {
        await prisma.palavra.upsert({
            where: {texto: item.texto},
            update: {},
            create:{
                texto: item.texto,
                categoria: item.categoria
            }
        })
    }

    console.log('seed concluido com sucesso!')
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });