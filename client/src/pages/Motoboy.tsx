import { useState, useEffect, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Bike, Phone, Clock, MapPin, Package, Navigation, CheckCircle2, AlertTriangle } from 'lucide-react';
import { maskPhone, unmaskedPhone } from '@/lib/masks';

export default function Motoboy() {
  const [phone, setPhone] = useState('');
  const [submittedPhone, setSubmittedPhone] = useState(() => {
    return localStorage.getItem('motoboyPhone') || '';
  });
  const [activeDeliveryId, setActiveDeliveryId] = useState<number | null>(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const utils = trpc.useContext();
  const updateLocation = trpc.orders.updateLocation.useMutation();
  const markDelivered = trpc.orders.driverMarkDelivered.useMutation({
    onSuccess: () => {
      toast.success('Entrega finalizada com sucesso!');
      utils.orders.getByDriver.invalidate();
      stopTracking();
    }
  });
  
  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => utils.orders.getByDriver.invalidate()
  });

  const { data, isLoading } = trpc.orders.getByDriver.useQuery(
    { phone: submittedPhone },
    { enabled: submittedPhone.length >= 10, refetchInterval: 15000 }
  );

  // Se já houver um pedido "out_for_delivery" associado a este motorista, retoma a entrega
  useEffect(() => {
    if (data?.orders && !activeDeliveryId) {
      const activeOrder = data.orders.find((o: any) => o.status === 'out_for_delivery');
      if (activeOrder) {
        setActiveDeliveryId(activeOrder.id);
        startTracking(activeOrder.id);
      }
    }
  }, [data?.orders]);

  // Limpar rastreamento ao desmontar
  useEffect(() => {
    return () => stopTracking();
  }, []);

  const startTracking = (orderId: number) => {
    if (!navigator.geolocation) {
      toast.error('Seu navegador não suporta GPS');
      return;
    }

    setIsTransmitting(true);
    setActiveDeliveryId(orderId);

    // Usa watchPosition para pegar localização a cada instante e atualizar no servidor
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        updateLocation.mutate({
          orderId,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Erro de GPS:', error);
        toast.error('Erro ao acessar o GPS. Verifique as permissões.');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTransmitting(false);
    setActiveDeliveryId(null);
  };

  const handleStartDelivery = async (orderId: number, address: string) => {
    if (activeDeliveryId && activeDeliveryId !== orderId) {
      toast.error('Você já tem uma entrega em andamento!');
      return;
    }
    
    // Mudar status para out_for_delivery
    await updateStatus.mutateAsync({ orderId, status: 'out_for_delivery' });
    startTracking(orderId);

    // Abrir Google Maps com o endereço do cliente
    if (address) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleFinishDelivery = async (orderId: number) => {
    if (window.confirm('Confirmar entrega finalizada?')) {
      await markDelivered.mutateAsync({ orderId });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = unmaskedPhone(phone);
    if (raw.length < 10) {
      toast.error('Telefone inválido');
      return;
    }
    localStorage.setItem('motoboyPhone', raw);
    setSubmittedPhone(raw);
  };

  const handleClear = () => {
    stopTracking();
    localStorage.removeItem('motoboyPhone');
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
              Digite seu telefone cadastrado para ver seus pedidos.
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
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-xl font-bold text-white">Olá, {data.driver.name}</h1>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>
                  {data.orders.filter((o: any) => o.status !== 'delivered').length} pedido(s) em andamento
                </p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)' }}>
                  <Package size={14} style={{ color: '#C9A227' }} />
                  <span className="text-sm font-bold text-[#C9A227]">
                    {data.orders.filter((o: any) => {
                      const today = new Date().toDateString();
                      return o.status === 'delivered' && new Date(o.updatedAt).toDateString() === today;
                    }).length} entregas hoje
                  </span>
                </div>
              </div>
              <button onClick={handleClear} className="text-xs text-[#C9A227] border border-[#C9A227]/30 px-3 py-1 rounded h-fit">
                Sair
              </button>
            </div>

            {isTransmitting && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-lg mb-6 flex items-center gap-3 text-sm animate-pulse">
                <Navigation size={18} />
                <div>
                  <p className="font-bold">Transmitindo GPS em tempo real</p>
                  <p className="text-xs opacity-80">Mantenha a tela ligada durante a entrega</p>
                </div>
              </div>
            )}

            {data.orders.filter((o: any) => o.status !== 'delivered').length === 0 ? (
              <div className="text-center py-12 bg-[#111111] rounded-lg border border-[#C9A227]/10">
                <Package className="mx-auto mb-3" style={{ color: '#8A7A5A' }} size={32} />
                <p style={{ color: '#8A7A5A' }}>Nenhuma entrega em andamento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.orders.filter((o: any) => o.status !== 'delivered').map((order: any) => {
                  const isActive = activeDeliveryId === order.id;
                  const isPending = !isActive && order.status !== 'out_for_delivery';
                  
                  return (
                    <div key={order.id} className={`bg-[#111111] border rounded-lg p-4 transition-colors ${isActive ? 'border-[#C9A227]' : 'border-[#C9A227]/20'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-[#C9A227]/10 text-[#C9A227]">
                            #{order.orderNumber}
                          </span>
                          <h3 className="font-bold text-white mt-2">{order.customerName}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-[#8A7A5A] text-xs flex items-center gap-1 justify-end mb-1">
                            <Clock size={12} />
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="font-bold text-[#C9A227] text-sm">
                            R$ {parseFloat(order.finalAmount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="text-red-400 mt-1 flex-shrink-0" size={16} />
                          <p className="text-sm" style={{ color: '#F5F0E8' }}>{order.address}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <a 
                          href={`https://wa.me/55${order.customerPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2.5 rounded text-sm font-semibold flex items-center justify-center gap-2 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/10"
                        >
                          <Phone size={16} /> Contatar Cliente
                        </a>

                        {/* Botão de Navegar sempre visível quando há endereço */}
                        {order.address && (
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.address)}&travelmode=driving`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 rounded text-sm font-semibold flex items-center justify-center gap-2 border border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                          >
                            <MapPin size={16} /> Navegar até o Cliente
                          </a>
                        )}

                        {isActive ? (
                          <button 
                            onClick={() => handleFinishDelivery(order.id)}
                            disabled={markDelivered.isPending}
                            className="w-full py-2.5 rounded text-sm font-bold flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600"
                          >
                            {markDelivered.isPending ? 'Finalizando...' : <><CheckCircle2 size={16} /> Marcar como Entregue</>}
                          </button>
                        ) : isPending ? (
                          <button 
                            onClick={() => handleStartDelivery(order.id, order.address)}
                            disabled={updateStatus.isPending || !!activeDeliveryId}
                            className={`w-full py-2.5 rounded text-sm font-bold flex items-center justify-center gap-2 ${activeDeliveryId ? 'bg-gray-700 text-gray-500' : 'bg-[#C9A227] text-black hover:bg-[#D4B242]'}`}
                          >
                            <Navigation size={16} /> Iniciar Entrega + Abrir Mapa
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
