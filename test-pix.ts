import { gerarPixCopiaECola } from './client/src/lib/pixGenerator.ts';

const res = gerarPixCopiaECola({
  chave: '+5541999349874',
  nome: 'NEWS BURGUER',
  cidade: 'CURITIBA',
  valor: 10.50,
  txid: 'PED123',
  descricao: 'Pedido 123'
});

console.log(res);
