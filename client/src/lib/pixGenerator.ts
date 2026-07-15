/**
 * Gerador de Payload PIX (BR Code) - Padrão EMV QR Code
 * Documentação: https://www.bcb.gov.br/content/estabilidadefinanceira/forumpireunioes/AnexoI-PadroesParaIniciacaodoPix.pdf
 */

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return ((crc & 0xffff).toString(16).toUpperCase()).padStart(4, '0');
}

function field(id: string, value: string): string {
  const size = value.length.toString().padStart(2, '0');
  return `${id}${size}${value}`;
}

export interface PixPayload {
  chave: string;        // Chave PIX (CNPJ, CPF, telefone, email ou aleatória)
  nome: string;         // Nome do recebedor (máx 25 chars)
  cidade: string;       // Cidade do recebedor (máx 15 chars)
  valor: number;        // Valor em reais
  txid?: string;        // Identificador da transação (opcional)
  descricao?: string;   // Descrição do pagamento (opcional)
}

export function gerarPixCopiaECola(params: PixPayload): string {
  const nome = params.nome.substring(0, 25).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cidade = params.cidade.substring(0, 15).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const txid = (params.txid || '***').replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) || '***';
  const valor = params.valor.toFixed(2);

  // Merchant Account Information (MAI) - Dados do destinatário PIX
  const gui = field('00', 'br.gov.bcb.pix');
  const chaveField = field('01', params.chave);
  const descricaoField = ''; // Alguns bancos falham ao ler a descrição, removido por segurança
  const mai = field('26', gui + chaveField + descricaoField);

  // Monta payload sem CRC
  const payload =
    field('00', '01') +           // Payload Format Indicator
    field('01', '11') +           // Point of Initiation Method - 11 = estático (exigido por alguns bancos)
    mai +                          // Merchant Account Information
    field('52', '0000') +         // Merchant Category Code
    field('53', '986') +          // Transaction Currency (BRL = 986)
    field('54', valor) +          // Transaction Amount
    field('58', 'BR') +           // Country Code
    field('59', nome) +            // Merchant Name
    field('60', cidade) +          // Merchant City
    field('62', field('05', txid)) + // Additional Data Field (txid)
    '6304';                        // CRC16 placeholder

  const checksum = crc16(payload);
  return payload + checksum;
}
