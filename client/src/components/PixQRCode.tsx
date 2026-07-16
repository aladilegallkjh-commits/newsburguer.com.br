import { QRCodeCanvas } from 'qrcode.react';
import { Copy, CheckCircle, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { gerarPixCopiaECola } from '@/lib/pixGenerator';

interface PixQRCodeProps {
  valor: number;
  pedidoNumero: string;
}

// ⚙️ Configurações da conta PIX
const PIX_CHAVE = '+5541999349874';
const PIX_NOME = 'NEWS BURGUER';
const PIX_CIDADE = 'CURITIBA';

export default function PixQRCode({ valor, pedidoNumero }: PixQRCodeProps) {
  const [copiado, setCopiado] = useState(false);
  const [pixPayload, setPixPayload] = useState('');

  useEffect(() => {
    try {
      // txid baseado no número do pedido (só alfanumérico, sem '***')
      const txidLimpo = pedidoNumero.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25);

      const payload = gerarPixCopiaECola({
        chave: PIX_CHAVE,
        nome: PIX_NOME,
        cidade: PIX_CIDADE,
        valor,
        txid: txidLimpo || undefined, // undefined = omite campo 62 (mais compatível)
      });
      console.log('[PixQRCode] payload:', payload);
      setPixPayload(payload);
    } catch (e) {
      console.error('[PixQRCode] erro ao gerar payload:', e);
    }
  }, [valor, pedidoNumero]);

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
        className="p-3 rounded-lg flex justify-center"
        style={{ background: '#FFFFFF', minWidth: 180, minHeight: 180 }}
      >
        {pixPayload ? (
          <QRCodeCanvas
            value={pixPayload}
            size={180}
            bgColor="#FFFFFF"
            fgColor="#000000"
            level="L"
          />
        ) : (
          <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#888', fontSize: 12 }}>Carregando...</p>
          </div>
        )}
      </div>

      {/* Código copia e cola */}
      <textarea
        readOnly
        value={pixPayload}
        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        className="w-full text-[10px] p-2 rounded bg-black text-gray-400 border border-gray-800 break-all cursor-pointer"
        rows={3}
        placeholder="Gerando código PIX..."
      />

      {/* Valor */}
      <div className="text-center">
        <p className="text-xs" style={{ color: '#8A7A5A' }}>Valor total</p>
        <p className="text-2xl font-bold" style={{ color: '#C9A227' }}>
          R$ {valor.toFixed(2).replace('.', ',')}
        </p>
      </div>

      {/* Botões Copiar */}
      <div className="w-full flex flex-col gap-2">
        <button
          onClick={handleCopiar}
          disabled={!pixPayload}
          className="w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50"
          style={{
            background: copiado ? 'rgba(34,197,94,0.15)' : 'rgba(201,162,39,0.15)',
            color: copiado ? '#22C55E' : '#C9A227',
            border: `1px solid ${copiado ? 'rgba(34,197,94,0.4)' : 'rgba(201,162,39,0.3)'}`,
          }}
        >
          {copiado ? (
            <>
              <CheckCircle size={16} />
              Código Copiado!
            </>
          ) : (
            <>
              <Copy size={16} />
              Copiar Copia e Cola
            </>
          )}
        </button>

        <button
          onClick={async () => {
            await navigator.clipboard.writeText(PIX_CHAVE);
            toast.success('Chave PIX copiada!', { style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' } });
          }}
          className="w-full py-2.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
          style={{ background: 'transparent', color: '#8A7A5A', border: '1px solid rgba(201,162,39,0.2)' }}
        >
          <Copy size={14} />
          Copiar apenas a Chave PIX
        </button>
      </div>

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
