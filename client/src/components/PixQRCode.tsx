import { QRCodeSVG } from 'qrcode.react';
import { Copy, CheckCircle, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { gerarPixCopiaECola } from '@/lib/pixGenerator';

interface PixQRCodeProps {
  valor: number;
  pedidoNumero: string;
}

// ⚙️ Configurações da conta PIX - Altere aqui se necessário
const PIX_CHAVE = '67.608.862/0001-72';
const PIX_NOME = "NEW'S BURGUER";
const PIX_CIDADE = 'CURITIBA';

export default function PixQRCode({ valor, pedidoNumero }: PixQRCodeProps) {
  const [copiado, setCopiado] = useState(false);

  const pixPayload = gerarPixCopiaECola({
    chave: PIX_CHAVE,
    nome: PIX_NOME,
    cidade: PIX_CIDADE,
    valor,
    txid: `PED${pedidoNumero}`,
    descricao: `Pedido ${pedidoNumero}`,
  });

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopiado(true);
      toast.success('Código PIX copiado!', {
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
      setTimeout(() => setCopiado(false), 3000);
    } catch {
      toast.error('Erro ao copiar. Toque no código para copiar manualmente.');
    }
  };

  return (
    <div
      className="rounded-xl p-5 flex flex-col items-center gap-4"
      style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.25)' }}
    >
      {/* Header */}
      <div className="text-center">
        <p className="font-bold text-sm" style={{ color: '#C9A227' }}>
          💚 Pague com PIX
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#8A7A5A' }}>
          Escaneie o QR Code ou copie o código
        </p>
      </div>

      {/* QR Code */}
      <div
        className="p-3 rounded-lg"
        style={{ background: '#FFFFFF' }}
      >
        <QRCodeSVG
          value={pixPayload}
          size={200}
          bgColor="#FFFFFF"
          fgColor="#000000"
          level="M"
        />
      </div>

      {/* Valor */}
      <div className="text-center">
        <p className="text-xs" style={{ color: '#8A7A5A' }}>Valor total</p>
        <p className="text-2xl font-bold" style={{ color: '#C9A227' }}>
          R$ {valor.toFixed(2).replace('.', ',')}
        </p>
      </div>

      {/* Botão Copiar */}
      <button
        onClick={handleCopiar}
        className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
        style={{
          background: copiado ? 'rgba(34,197,94,0.15)' : 'rgba(201,162,39,0.15)',
          color: copiado ? '#22C55E' : '#C9A227',
          border: `1px solid ${copiado ? 'rgba(34,197,94,0.4)' : 'rgba(201,162,39,0.3)'}`,
        }}
      >
        {copiado ? (
          <>
            <CheckCircle size={16} />
            Copiado!
          </>
        ) : (
          <>
            <Copy size={16} />
            Copiar Código PIX
          </>
        )}
      </button>

      {/* Instrução */}
      <div
        className="w-full rounded-lg p-3 flex items-start gap-2"
        style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.1)' }}
      >
        <Smartphone size={14} style={{ color: '#C9A227', flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: '#8A7A5A' }}>
          Abra o app do seu banco, escolha <strong style={{ color: '#F5F0E8' }}>PIX → Pagar → Copia e Cola</strong> e cole o código acima. Após o pagamento, envie o comprovante pelo WhatsApp.
        </p>
      </div>
    </div>
  );
}
