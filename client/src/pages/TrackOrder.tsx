import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const LOGO_URL = '/logo.png';

const statusSteps = [
  { key: 'pending', label: 'Pedido Recebido', icon: '📋' },
  { key: 'confirmed', label: 'Confirmado', icon: '✅' },
  { key: 'preparing', label: 'Preparando', icon: '👨‍🍳' },
  { key: 'ready', label: 'Pronto', icon: '🎉' },
  { key: 'out_for_delivery', label: 'Saindo para Entrega', icon: '🚗' },
  { key: 'delivered', label: 'Entregue', icon: '🏠' },
];

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState<NodeJS.Timeout | null>(null);

  const getOrderQuery = trpc.orders.getByNumber.useQuery(
    { orderNumber: orderNumber.trim() },
    {
      enabled: false,
      retry: false,
    }
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Digite o número do pedido', {
        duration: 2000,
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
      return;
    }

    setIsSearching(true);
    try {
      const result = await getOrderQuery.refetch();
      if (result.data) {
        // Mapear dados do backend para o formato esperado
        const orderData = result.data;
        let items: any[] = [];
        if (Array.isArray(orderData.items)) {
          items = orderData.items;
        } else if (typeof orderData.items === 'string') {
          try {
            items = JSON.parse(orderData.items);
          } catch {
            items = [];
          }
        }
        
        setSearchedOrder({
          id: orderData.id,
          orderNumber: `#${orderData.orderNumber}`,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          status: orderData.status,
          items: items,
          total: orderData.finalAmount || orderData.totalAmount,
          createdAt: new Date(orderData.createdAt),
          estimatedDelivery: orderData.estimatedDeliveryTime ? new Date(orderData.estimatedDeliveryTime) : new Date(Date.now() + 60 * 60000),
        });
        
        toast.success('Pedido encontrado!', {
          duration: 2000,
          style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
        });
        
        // Auto-refresh a cada 30 segundos quando há pedido ativo
        if (autoRefresh) clearInterval(autoRefresh);
        const interval = setInterval(() => {
          getOrderQuery.refetch();
        }, 30000);
        setAutoRefresh(interval);
      }
    } catch (error: any) {
      toast.error(error.message || 'Pedido não encontrado', {
        duration: 2000,
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    return () => {
      if (autoRefresh) clearInterval(autoRefresh);
    };
  }, [autoRefresh]);

  const getStatusIndex = (status: string) => {
    // Mapear status do banco de dados para as chaves do timeline
    const statusMap: { [key: string]: string } = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'preparing': 'preparing',
      'ready': 'ready',
      'out_for_delivery': 'out_for_delivery',
      'delivered': 'delivered',
      'cancelled': 'pending',
    };
    return statusSteps.findIndex(s => s.key === (statusMap[status] || status));
  };

  const currentStatusIndex = searchedOrder ? getStatusIndex(searchedOrder.status) : -1;

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <Navbar />

      <section className="py-20 px-4 pt-24" style={{ background: '#0A0A0A' }}>
        <div className="container max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="font-display text-sm tracking-[0.3em] uppercase mb-3" style={{ color: '#C9A227' }}>
              Rastreie seu pedido
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: '#F5F0E8' }}>
              Acompanhe em Tempo Real
            </h1>
            <p className="text-sm" style={{ color: '#8A7A5A' }}>
              Digite o número do seu pedido para rastrear
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-12">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Ex: 12345"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="flex-1 px-4 py-3 rounded-sm text-sm"
                style={{
                  background: '#1A1A1A',
                  border: '1px solid rgba(201,162,39,0.3)',
                  color: '#F5F0E8',
                }}
              />
              <button
                type="submit"
                disabled={isSearching}
                className="btn-gold px-8 py-3 rounded-sm font-semibold disabled:opacity-50"
              >
                {isSearching ? 'Buscando...' : 'Rastrear'}
              </button>
            </div>
          </form>

          {/* Order Details */}
          {searchedOrder && (
            <div className="menu-card rounded-sm p-8 mb-12">
              {/* Order Header */}
              <div className="mb-8 pb-8 border-b" style={{ borderColor: 'rgba(201,162,39,0.2)' }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest" style={{ color: '#C9A227' }}>
                      Número do Pedido
                    </p>
                    <h2 className="font-display text-2xl font-bold" style={{ color: '#F5F0E8' }}>
                      {searchedOrder.orderNumber}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest" style={{ color: '#C9A227' }}>
                      Total
                    </p>
                    <p className="font-display text-2xl font-bold" style={{ color: '#C9A227' }}>
                      R$ {searchedOrder.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>
                  Cliente: {searchedOrder.customerName} • {searchedOrder.customerPhone}
                </p>
              </div>

              {/* Timeline */}
              <div className="mb-12">
                <p className="text-xs uppercase tracking-widest mb-6" style={{ color: '#C9A227' }}>
                  Status do Pedido
                </p>
                <div className="space-y-4">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        {/* Timeline dot and line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                              isCompleted ? 'bg-yellow-600' : 'bg-gray-700'
                            }`}
                            style={{
                              background: isCompleted ? '#C9A227' : '#2A2A2A',
                              color: isCompleted ? '#0A0A0A' : '#8A7A5A',
                            }}
                          >
                            {step.icon}
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div
                              className="w-1 h-12 mt-2"
                              style={{
                                background: isCompleted ? '#C9A227' : '#2A2A2A',
                              }}
                            />
                          )}
                        </div>

                        {/* Status info */}
                        <div className="pt-2 flex-1">
                          <p
                            className={`font-semibold ${isCurrent ? 'font-bold' : ''}`}
                            style={{
                              color: isCompleted ? '#F5F0E8' : '#8A7A5A',
                            }}
                          >
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-xs mt-1" style={{ color: '#C9A227' }}>
                              Status atual
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items */}
              <div className="mb-8 pb-8 border-t" style={{ borderColor: 'rgba(201,162,39,0.2)' }}>
                <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#C9A227' }}>
                  Itens do Pedido
                </p>
                <div className="space-y-3">
                  {searchedOrder.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span style={{ color: '#F5F0E8' }}>
                        {item.quantity}x {item.name}
                      </span>
                      <span style={{ color: '#C9A227' }}>
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimated Delivery */}
              <div className="p-4 rounded-sm" style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.2)' }}>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#C9A227' }}>
                  Previsão de Entrega
                </p>
                <p className="font-semibold" style={{ color: '#F5F0E8' }}>
                  {searchedOrder.estimatedDelivery instanceof Date
                    ? searchedOrder.estimatedDelivery.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Calculando...'}
                </p>
              </div>
              
              {/* Auto-refresh indicator */}
              <div className="mt-6 text-center text-xs" style={{ color: '#8A7A5A' }}>
                <p>🔄 Atualizando automaticamente a cada 30 segundos</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          {!searchedOrder && (
            <div className="menu-card rounded-sm p-8 text-center">
              <p className="text-sm" style={{ color: '#8A7A5A' }}>
                Digite o número do seu pedido acima para rastrear em tempo real. Você receberá atualizações via WhatsApp conforme o status mudar.
              </p>
              <p className="text-xs mt-4" style={{ color: '#4A3A2A' }}>
                O número do pedido foi enviado para seu WhatsApp quando você finalizou a compra.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
