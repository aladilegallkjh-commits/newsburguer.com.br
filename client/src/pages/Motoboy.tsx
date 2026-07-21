import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Bike, Phone, Clock, MapPin, Package } from 'lucide-react';
import { maskPhone, unmaskedPhone } from '@/lib/masks';

export default function Motoboy() {
  const [phone, setPhone] = useState('');
  const [submittedPhone, setSubmittedPhone] = useState('');

  const { data, isLoading, refetch } = trpc.orders.getByDriver.useQuery(
    { phone: submittedPhone },
    { enabled: submittedPhone.length >= 10, refetchInterval: 30000 } // Refetch a cada 30s
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = unmaskedPhone(phone);
    if (raw.length < 10) {
      toast.error('Telefone inválido');
      return;
    }
    setSubmittedPhone(raw);
  };

  const handleClear = () => {
    setSubmittedPhone('');
    setPhone('');
  };

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <Navbar />
      
      <main className="max-w-md mx-auto pt-24 pb-20 px-4">
        {!submittedPhone ? (
          <div className="bg-[#111111] border border-[#C9A227]/20 p-6 rounded-lg shadow-xl text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(201,162,39,0.1)' }}>
              <Bike size={32} style={{ color: '#C9A227' }} />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Portal do Entregador</h2>
            <p className="text-sm mb-6" style={{ color: '#8A7A5A' }}>
              Digite seu telefone cadastrado para ver seus pedidos em andamento.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7A5A]" size={18} />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(41) 99999-9999"
                  maxLength={15}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-white"
                  style={{ background: '#0A0A0A', border: '1px solid rgba(201,162,39,0.3)' }}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-bold transition-colors"
                style={{ background: '#C9A227', color: '#0A0A0A' }}
              >
                Acessar Pedidos
              </button>
            </form>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 mx-auto mb-4 border-t-2 border-[#C9A227] rounded-full"></div>
            <p style={{ color: '#8A7A5A' }}>Buscando pedidos...</p>
          </div>
        ) : !data?.driver ? (
          <div className="bg-[#111111] border border-red-500/20 p-6 rounded-lg text-center">
            <p className="text-red-400 mb-4">Entregador não encontrado com este número.</p>
            <button onClick={handleClear} className="px-6 py-2 rounded text-sm font-semibold border border-[#C9A227]/30 text-[#C9A227]">
              Tentar Novamente
            </button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-xl font-bold text-white">Olá, {data.driver.name}</h1>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>{data.orders.length} pedido(s) atribuído(s)</p>
              </div>
              <button onClick={handleClear} className="text-xs text-[#C9A227] border border-[#C9A227]/30 px-3 py-1 rounded">
                Sair
              </button>
            </div>

            {data.orders.length === 0 ? (
              <div className="text-center py-12 bg-[#111111] rounded-lg border border-[#C9A227]/10">
                <Package className="mx-auto mb-3" style={{ color: '#8A7A5A' }} size={32} />
                <p style={{ color: '#8A7A5A' }}>Você não tem entregas pendentes no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.orders.map((order: any) => (
                  <div key={order.id} className="bg-[#111111] border border-[#C9A227]/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold px-2 py-1 rounded bg-[#C9A227]/10 text-[#C9A227]">
                          #{order.orderNumber}
                        </span>
                        <h3 className="font-bold text-white mt-2">{order.customerName}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-[#8A7A5A] text-xs flex items-center gap-1 justify-end">
                          <Clock size={12} />
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="text-red-400 mt-1 flex-shrink-0" size={16} />
                        <p className="text-sm" style={{ color: '#F5F0E8' }}>{order.address}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#C9A227]/10 flex justify-between items-center">
                      <span className="font-bold text-[#C9A227]">
                        R$ {parseFloat(order.finalAmount).toFixed(2)}
                      </span>
                      <a 
                        href={`https://wa.me/55${order.customerPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded text-sm font-semibold flex items-center gap-2 transition-colors"
                        style={{ background: '#25D366', color: 'white' }}
                      >
                        <Phone size={14} /> Contatar Cliente
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
