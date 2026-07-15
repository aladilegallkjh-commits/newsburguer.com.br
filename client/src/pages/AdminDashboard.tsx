import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { LogOut, Menu, X, Settings, FileText, Clock, Trophy, ShoppingBag, Plus, Trash2, Edit2, Download, Bike, Ticket, Printer, Bell, Power } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import MenuImageUpload from '@/components/MenuImageUpload';
import EditMenuItemImageModal from '@/components/EditMenuItemImageModal';
import EditMenuItemModal from '@/components/EditMenuItemModal';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';

const LOGO_URL = '/logo.png';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Clock size={20} /> },
  { id: 'pedidos', label: 'Pedidos', icon: <ShoppingBag size={20} /> },
  { id: 'cardapio', label: 'Cardápio', icon: <FileText size={20} /> },
  { id: 'informacoes', label: 'Configurações', icon: <Settings size={20} /> },
  { id: 'promocoes', label: 'Promoções', icon: <Trophy size={20} /> },
  { id: 'entregadores', label: 'Entregadores', icon: <Bike size={20} /> },
  { id: 'cupons', label: 'Cupons', icon: <Ticket size={20} /> },
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminEmail] = useState(localStorage.getItem('adminEmail') || 'Admin');
  const { data: metrics } = trpc.analytics.getMetrics.useQuery();

  const formatMoney = (val: string | number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

  const logoutMutation = trpc.adminAuth.logout.useMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      console.error(e);
    }
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminToken');
    toast.success('Logout realizado', {
      duration: 2000,
      style: { background: 'rgba(10,16,13,0.85)', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
    });
    setLocation('/admin/login');
  };

  return (
    <div className="min-h-screen flex text-[#F5F0E8]" style={{ background: '#080c09' }}>
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-72' : 'w-20'} transition-all duration-300 border-r flex flex-col relative z-20`}
        style={{ background: '#0a100d', borderColor: 'rgba(201,162,39,0.1)' }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="New S'Burguer" className="w-10 h-10 object-contain" />
            {sidebarOpen && (
              <div className="leading-tight">
                <span className="font-bold text-[#C9A227] tracking-wider text-sm block">NEWS</span>
                <span className="font-bold text-[#F5F0E8] tracking-widest text-sm block">BURGUER</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-sm transition-colors hover:bg-[#C9A227]/10"
            style={{ color: '#C9A227' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-28 scrollbar-hide">
          <nav className="mt-4 space-y-1 px-4">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                  activeTab === item.id ? 'font-semibold rounded-lg' : 'rounded-lg'
                }`}
                style={{
                  background: activeTab === item.id ? 'rgba(201,162,39,0.15)' : 'transparent',
                  color: activeTab === item.id ? '#EAD695' : '#8A7A5A',
                  border: activeTab === item.id ? '1px solid rgba(201,162,39,0.3)' : '1px solid transparent',
                  boxShadow: activeTab === item.id ? '0 0 15px rgba(201,162,39,0.1)' : 'none'
                }}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          {sidebarOpen && (
            <>
              {/* Promoções Destaque */}
              <div className="mt-4 px-4">
                <div className="rounded-xl border border-[#C9A227]/20 p-4" style={{ background: 'linear-gradient(180deg, rgba(13,26,20,0.8) 0%, rgba(10,16,13,0.8) 100%)' }}>
                  <h4 className="text-xs font-bold text-[#C9A227] mb-3 tracking-wider uppercase">Promoções Destaque</h4>
                  <ul className="space-y-2 text-xs text-[#8A7A5A]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A227] mt-0.5">•</span>
                      <span>Hambúrguer Gourmet - Compre 1 Leve 2</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A227] mt-0.5">•</span>
                      <span>Combo Família - R$ 49,90 (was R$ 65,90)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A227] mt-0.5">•</span>
                      <span>Frete Grátis nas próximas 2 horas</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Resumo do Negócio */}
              <div className="mt-4 px-4 mb-4">
                <div className="rounded-xl border border-[#C9A227]/20 p-4" style={{ background: 'linear-gradient(180deg, rgba(13,26,20,0.8) 0%, rgba(10,16,13,0.8) 100%)' }}>
                  <h4 className="text-xs font-bold text-[#C9A227] mb-3 tracking-wider uppercase">Resumo do Negócio</h4>
                  
                  <div className="mb-3">
                    <p className="text-xs text-[#8A7A5A] mb-1">Faturamento Total (Mês Atual)</p>
                    <p className="text-lg font-bold text-[#C9A227]">{metrics ? formatMoney(metrics.revenueThisMonth) : 'R$ 0,00'}</p>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-[#8A7A5A] mb-1">Total de Pedidos (Mês Atual)</p>
                      <p className="text-lg font-bold text-[#F5F0E8]">{metrics ? metrics.ordersThisMonth : '0'}</p>
                    </div>
                    {/* Fake mini chart */}
                    <div className="w-16 h-8 opacity-70">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{v:1},{v:3},{v:2},{v:5},{v:3},{v:6}]}>
                          <defs>
                            <linearGradient id="colorMini" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C9A227" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#C9A227" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="v" stroke="#C9A227" fill="url(#colorMini)" strokeWidth={1.5} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Logout */}
        <div className="absolute bottom-6 left-4 right-4 z-30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 border border-red-900/50 hover:border-red-500/50"
            style={{
              background: 'linear-gradient(90deg, rgba(30,0,0,1) 0%, rgba(60,0,0,1) 100%)',
              color: '#FF6B6B',
              boxShadow: '0 4px 15px rgba(255,0,0,0.1)'
            }}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto relative" style={{
        backgroundImage: `radial-gradient(circle at center, transparent 0%, #080c09 100%), url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A227' fill-opacity='0.08'%3E%3Cpath d='M50 25a15 15 0 0115 15v5H35v-5a15 15 0 0115-15zM30 50h40v5a15 15 0 01-30 0v-5H30z'/%3E%3Cpath d='M20 70a5 5 0 110-10 5 5 0 010 10zm60-40a5 5 0 110-10 5 5 0 010 10z'/%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: 'cover, 150px 150px'
      }}>
        {/* Header and Content Area */}
        <div className="p-8">
          <div className="flex items-start justify-between mb-12">
            <div>
              <h1 className="font-display text-4xl font-bold mb-1" style={{ color: '#F5F0E8' }}>
                Painel Administrativo
              </h1>
              <p className="text-sm" style={{ color: '#8A7A5A' }}>
                Bem-vindo, {adminEmail}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <StoreToggle />
              <div className="text-sm" style={{ color: '#8A7A5A' }}>
                {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'pedidos' && <PedidosTab />}
          {activeTab === 'cardapio' && <CardapioTab />}
          {activeTab === 'informacoes' && <InformacoesTab />}
          {activeTab === 'promocoes' && <PromocoesTab />}
          {activeTab === 'entregadores' && <EntregadoresTab />}
          {activeTab === 'cupons' && <CuponsTab />}
        </div>
      </div>
    </div>
  );
}

function PedidosTab() {
  const { data: orders, isLoading } = trpc.orders.getAll.useQuery(undefined, { refetchInterval: 5000 });
  const { data: drivers } = trpc.drivers.getAll.useQuery();
  const updateStatus = trpc.orders.updateStatus.useMutation();
  const assignDriver = trpc.orders.assignDriver.useMutation();
  const prevOrdersCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(() => localStorage.getItem('audioEnabled') === 'true');
  const [hasNewOrder, setHasNewOrder] = useState(false);

  useEffect(() => {
    // Inicializa o áudio com arquivo local (sem bloqueios de rede/CORS)
    audioRef.current = new Audio('/beep.wav');
  }, []);

  const playBeep = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.warn('Audio autoplay blocked by browser', e));
      }
    } catch (e) {
      console.warn('Audio playback failed', e);
    }
  };

  useEffect(() => {
    if (orders && prevOrdersCount.current > 0 && orders.length > prevOrdersCount.current) {
      setHasNewOrder(true);
      toast('🔔 Novo pedido recebido!', {
        duration: 8000,
        style: { background: '#C9A227', color: '#0A0A0A', fontWeight: 'bold' },
      });
      if (audioEnabled) {
        playBeep();
      }
    }
    if (orders) prevOrdersCount.current = orders.length;
  }, [orders, audioEnabled]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus as any });
      toast.success('Status atualizado!', {
        duration: 2000,
        style: { background: 'rgba(10,16,13,0.85)', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleNotifyCustomer = (order: any, currentStatus: string) => {
    const statusMsgs: Record<string, string> = {
      pending: '✅ Recebemos o seu pedido e logo iremos confirmar!',
      confirmed: '✅ Seu pedido foi confirmado! Estamos preparando...',
      preparing: '👨‍🍳 Seu pedido está sendo preparado com muito cuidado!',
      ready: '🎉 Seu pedido está embalado e pronto! Saindo para entrega...',
      out_for_delivery: '🚗 Seu pedido saiu para entrega! Chegando em breve...',
      delivered: '🎊 Seu pedido foi entregue! Bom apetite!',
      cancelled: '❌ Seu pedido foi cancelado. Entre em contato conosco se houver dúvidas.'
    };
    
    const msg = `*Pedido ${order.orderNumber}*\n\n${statusMsgs[currentStatus] || 'Status do pedido atualizado.'}\n\n---\nNew S'Burguer 🍔`;
    const phone = (order.customerPhone || '').replace(/\D/g, '');
    const phoneWithCountry = phone.startsWith('55') ? phone : `55${phone}`;
    const waLink = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(msg)}`;
    
    window.open(waLink, '_blank');
  };

  const handleDriverChange = async (orderId: number, driverId: string) => {
    try {
      await assignDriver.mutateAsync({ orderId, driverId: driverId ? Number(driverId) : null });
      toast.success('Entregador atribuído!');
    } catch (error) {
      toast.error('Erro ao atribuir entregador');
    }
  };

  const handlePrint = (order: any) => {
    const printWindow = window.open('', '', 'width=300,height=600');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><style>
        body { font-family: monospace; font-size: 14px; margin: 0; padding: 10px; width: 80mm; }
        .center { text-align: center; }
        .line { border-bottom: 1px dashed black; margin: 10px 0; }
        h1, h2 { margin: 5px 0; }
      </style></head><body>
        <div class="center">
          <h2>NEW S'BURGUER</h2>
          <p>Pedido: ${order.orderNumber}</p>
          <p>${new Date(order.createdAt).toLocaleString('pt-BR')}</p>
        </div>
        <div class="line"></div>
        <p><b>Cliente:</b> ${order.customerName}</p>
        <p><b>Telefone:</b> ${order.customerPhone}</p>
        <p><b>Entrega:</b> ${order.deliveryType === 'delivery' ? 'Delivery' : 'Retirada'}</p>
        ${order.address ? `<p><b>Endereço:</b> ${order.address}</p>` : ''}
        <div class="line"></div>
        ${Array.isArray(order.items) ? order.items.map((i:any) => `<p>${i.quantity}x ${i.name} (R$ ${(i.price * i.quantity).toFixed(2)})</p>`).join('') : ''}
        <div class="line"></div>
        <p><b>Total: R$ ${parseFloat(order.finalAmount).toFixed(2)}</b></p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  const statusColors: Record<string, string> = { 'pending': '#FF6B35', 'confirmed': '#FFA500', 'preparing': '#C9A227', 'ready': '#4CAF50', 'out_for_delivery': '#2196F3', 'delivered': '#8BC34A', 'cancelled': '#F44336' };
  const statusLabels: Record<string, string> = { 'pending': 'Pendente', 'confirmed': 'Confirmado', 'preparing': 'Preparando', 'ready': 'Pronto', 'out_for_delivery': 'Saindo para Entrega', 'delivered': 'Entregue', 'cancelled': 'Cancelado' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold" style={{ color: '#F5F0E8' }}>Gerenciar Pedidos</h2>
        <button
          onClick={() => {
            const nextState = !audioEnabled;
            setAudioEnabled(nextState);
            localStorage.setItem('audioEnabled', String(nextState));
            if (nextState) {
              playBeep();
              toast.success('Som ativado! Você deve ouvir um bipe.', { style: { background: '#C9A227', color: '#111', fontWeight: 'bold' } });
            } else {
              toast('Som desativado.', { style: { background: '#111', color: '#8A7A5A' } });
            }
            setHasNewOrder(false);
          }}
          className="px-4 py-2 rounded font-semibold text-sm flex items-center gap-2 transition-all relative"
          style={{ 
            background: audioEnabled ? 'rgba(201,162,39,0.2)' : 'rgba(255,107,107,0.1)', 
            color: audioEnabled ? '#C9A227' : '#FF6B6B',
            border: `1px solid ${audioEnabled ? 'rgba(201,162,39,0.5)' : 'rgba(255,107,107,0.3)'}`
          }}
        >
          {audioEnabled ? <Bell size={16} /> : <Bell size={16} className="opacity-50" />}
          {audioEnabled ? 'Som Ativado' : 'Ativar Som de Notificação'}
          {hasNewOrder && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping" style={{ background: '#C9A227' }} />
          )}
        </button>
      </div>
      {isLoading ? <p style={{ color: '#8A7A5A' }}>Carregando pedidos...</p> : !orders || orders.length === 0 ? <p style={{ color: '#8A7A5A' }}>Nenhum pedido recebido</p> : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="rounded-2xl p-6" style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold flex items-center gap-2" style={{ color: '#F5F0E8' }}>
                    {order.orderNumber}
                    <button onClick={() => handlePrint(order)} className="p-1 rounded transition" style={{ background: '#222' }} title="Imprimir Comanda"><Printer size={16} /></button>
                  </h3>
                  <p className="text-sm" style={{ color: '#8A7A5A' }}>{order.customerName} • {order.customerPhone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" style={{ color: '#C9A227' }}>R$ {parseFloat(order.finalAmount).toFixed(2)}</p>
                </div>
              </div>
              <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(201,162,39,0.1)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#C9A227' }}>Itens:</p>
                {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                  <p key={idx} className="text-sm" style={{ color: '#8A7A5A' }}>• {item.name} x{item.quantity}</p>
                ))}
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${statusColors[order.status]}20`, color: statusColors[order.status] }}>{statusLabels[order.status]}</span>
                <div className="flex items-center gap-4">
                  {order.deliveryType === 'delivery' && (
                    <select value={order.driverId || ''} onChange={e => handleDriverChange(order.id, e.target.value)} className="px-3 py-2 rounded text-sm" style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}>
                      <option value="">Atribuir Entregador</option>
                      {drivers?.filter((d: any) => d.isActive).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)} className="px-3 py-2 rounded text-sm" style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}>
                      <option value="pending">Pendente</option>
                      <option value="confirmed">Confirmado</option>
                      <option value="preparing">Preparando</option>
                      <option value="ready">Pronto / Embalado</option>
                      <option value="out_for_delivery">Saindo para Entrega</option>
                      <option value="delivered">Entregue</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                    
                    <button 
                      onClick={() => handleNotifyCustomer(order, order.status)}
                      className="px-3 py-2 rounded flex items-center justify-center gap-2 transition-all hover:opacity-80 text-sm font-semibold"
                      title="Avisar cliente no WhatsApp"
                      style={{ background: '#25D366', color: '#FFF' }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      Avisar Cliente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function CardapioTab() {
  const { data: items, isLoading, refetch } = trpc.menu.getAll.useQuery();
  const createItem = trpc.menu.create.useMutation();
  const updateItem = trpc.menu.update.useMutation();
  const deleteItem = trpc.menu.delete.useMutation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [editingImageItem, setEditingImageItem] = useState<any>(null);
  const [editingFullItem, setEditingFullItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'hamburgers' as const,
    price: 0,
    imageUrl: '',
    ingredients: '',
  });

  const handleAdd = async () => {
    if (!formData.name || formData.price <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const ingredientsArray = formData.ingredients
        .split(',')
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      await createItem.mutateAsync({ ...formData, ingredients: ingredientsArray } as any);
      toast.success('Item adicionado!');
      setFormData({ name: '', description: '', category: 'hamburgers', price: 0, imageUrl: '', ingredients: '' });
      refetch();
    } catch (error) {
      toast.error('Erro ao adicionar item');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar este item?')) {
      try {
        await deleteItem.mutateAsync({ id });
        toast.success('Item deletado!');
        refetch();
      } catch (error) {
        toast.error('Erro ao deletar item');
      }
    }
  };

  const handleOpenEditImageModal = (item: any) => {
    setEditingImageId(item.id);
    setEditingImageItem(item);
  };

  const handleCloseEditImageModal = () => {
    setEditingImageId(null);
    setEditingImageItem(null);
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
        Gerenciar Cardápio
      </h2>

      {/* Add New Item */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
      >
        <h3 className="font-semibold mb-4" style={{ color: '#C9A227' }}>
          <Plus size={18} className="inline mr-2" />
          Adicionar Novo Item
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do item"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="px-3 py-2 rounded"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="px-3 py-2 rounded"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            >
              <option value="hamburgers">Hambúrgueres</option>
              <option value="hotdogs">Hot Dogs</option>
              <option value="combos">Combos</option>
              <option value="drinks">Bebidas</option>
              <option value="extras">Extras</option>
            </select>
            <input
              type="number"
              placeholder="Preço"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="px-3 py-2 rounded"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
            <input
              type="text"
              placeholder="Ingredientes (separados por vírgula)"
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              className="px-3 py-2 rounded col-span-2"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
            <button
              onClick={handleAdd}
              disabled={createItem.isPending}
              className="px-4 py-2 rounded font-semibold"
              style={{ background: '#C9A227', color: '#0D1A14' }}
            >
              {createItem.isPending ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>

          <MenuImageUpload
            onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
            itemName={formData.name || 'Novo item'}
          />
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <p style={{ color: '#8A7A5A' }}>Carregando cardápio...</p>
      ) : !items || items.length === 0 ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
        >
          <p style={{ color: '#8A7A5A' }}>Nenhum item no cardápio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="rounded-lg overflow-hidden"
              style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold mb-2" style={{ color: '#F5F0E8' }}>
                  {item.name}
                </h3>
                <p className="text-sm mb-3" style={{ color: '#8A7A5A' }}>
                  {item.description || 'Sem descrição'}
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-bold" style={{ color: '#C9A227' }}>
                    R$ {parseFloat(item.price).toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingFullItem(item)}
                      disabled={updateItem.isPending}
                      className="p-2 rounded hover:opacity-80"
                      style={{ background: 'rgba(201,162,39,0.2)', color: '#C9A227' }}
                      title="Editar detalhes"
                    >
                      <Settings size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenEditImageModal(item)}
                      disabled={updateItem.isPending}
                      className="p-2 rounded hover:opacity-80"
                      style={{ background: 'rgba(201,162,39,0.2)', color: '#C9A227' }}
                      title="Editar imagem"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteItem.isPending}
                      className="p-2 rounded hover:opacity-80"
                      style={{ background: 'rgba(244, 67, 54, 0.2)', color: '#F44336' }}
                      title="Deletar item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Image Modal */}
      {editingImageItem && (
        <EditMenuItemImageModal
          isOpen={editingImageId !== null}
          onClose={handleCloseEditImageModal}
          itemId={editingImageId || 0}
          itemName={editingImageItem.name}
          currentImageUrl={editingImageItem.imageUrl}
          onImageUpdated={() => {
            refetch();
            handleCloseEditImageModal();
          }}
        />
      )}

      {/* Edit Full Item Modal */}
      {editingFullItem && (
        <EditMenuItemModal
          isOpen={editingFullItem !== null}
          onClose={() => setEditingFullItem(null)}
          item={editingFullItem}
          onUpdated={() => refetch()}
        />
      )}
    </div>
  );
}

function InformacoesTab() {
  const { data: settings, isLoading } = trpc.storeSettings.get.useQuery();
  const updateSettings = trpc.storeSettings.update.useMutation();
  const [formData, setFormData] = useState({
    storeName: settings?.storeName || '',
    whatsappNumber: settings?.whatsappNumber || '',
    email: settings?.email || '',
    phone: settings?.phone || '',
    address: settings?.address || '',
    city: settings?.city || '',
    state: settings?.state || '',
    openingTime: settings?.openingTime || '',
    closingTime: settings?.closingTime || '',
  });

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(formData as any);
      toast.success('Configurações atualizadas!');
    } catch (error) {
      toast.error('Erro ao atualizar configurações');
    }
  };

  if (isLoading) return <p style={{ color: '#8A7A5A' }}>Carregando...</p>;

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
        Configurações da Loja
      </h2>

      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: '#8A7A5A' }}>
              Nome da Loja
            </label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-3 py-2 rounded"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: '#8A7A5A' }}>
              WhatsApp
            </label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              className="w-full px-3 py-2 rounded"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: '#8A7A5A' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: '#8A7A5A' }}>
              Telefone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm mb-2" style={{ color: '#8A7A5A' }}>
              Endereço
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: '#8A7A5A' }}>
              Cidade
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 rounded"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: '#8A7A5A' }}>
              Estado
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3 py-2 rounded"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: '#8A7A5A' }}>
              Horário de Abertura
            </label>
            <input
              type="time"
              value={formData.openingTime}
              onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
              className="w-full px-3 py-2 rounded"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: '#8A7A5A' }}>
              Horário de Fechamento
            </label>
            <input
              type="time"
              value={formData.closingTime}
              onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
              className="w-full px-3 py-2 rounded"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="mt-6 px-6 py-2 rounded font-semibold"
          style={{ background: '#C9A227', color: '#0D1A14' }}
        >
          {updateSettings.isPending ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
}

function PromocoesTab() {
  const { data: promotions, isLoading, refetch } = trpc.promotions.getAll.useQuery();
  const createPromo = trpc.promotions.create.useMutation();
  const deletePromo = trpc.promotions.delete.useMutation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'percentage' as const,
    discountValue: 0,
  });

  const handleAdd = async () => {
    if (!formData.title || formData.discountValue <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createPromo.mutateAsync(formData as any);
      toast.success('Promoção adicionada!');
      setFormData({ title: '', description: '', type: 'percentage', discountValue: 0 });
      refetch();
    } catch (error) {
      toast.error('Erro ao adicionar promoção');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja deletar esta promoção?')) {
      try {
        await deletePromo.mutateAsync({ id });
        toast.success('Promoção deletada!');
        refetch();
      } catch (error) {
        toast.error('Erro ao deletar promoção');
      }
    }
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
        Gerenciar Promoções
      </h2>

      {/* Add New Promotion */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
      >
        <h3 className="font-semibold mb-4" style={{ color: '#C9A227' }}>
          <Plus size={18} className="inline mr-2" />
          Adicionar Nova Promoção
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Título da promoção"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="px-3 py-2 rounded"
            style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
          />
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="px-3 py-2 rounded"
            style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <option value="percentage">Percentual (%)</option>
            <option value="fixed">Valor Fixo (R$)</option>
            <option value="combo">Combo</option>
          </select>
          <input
            type="number"
            placeholder="Valor do desconto"
            value={formData.discountValue}
            onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
            className="px-3 py-2 rounded"
            style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
          />
          <button
            onClick={handleAdd}
            disabled={createPromo.isPending}
            className="px-4 py-2 rounded font-semibold"
            style={{ background: '#C9A227', color: '#0D1A14' }}
          >
            {createPromo.isPending ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
      </div>

      {/* Promotions List */}
      {isLoading ? (
        <p style={{ color: '#8A7A5A' }}>Carregando promoções...</p>
      ) : !promotions || promotions.length === 0 ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
        >
          <p style={{ color: '#8A7A5A' }}>Nenhuma promoção cadastrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {promotions.map((promo: any) => (
            <div
              key={promo.id}
              className="rounded-lg p-4 flex items-center justify-between"
              style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
            >
              <div>
                <h3 className="font-semibold" style={{ color: '#F5F0E8' }}>
                  {promo.title}
                </h3>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>
                  {promo.discountType === 'percentage' && `${promo.discountValue}% de desconto`}
                  {promo.discountType === 'fixed' && `R$ ${promo.discountValue.toFixed(2)} de desconto`}
                  {promo.discountType === 'combo' && `Combo especial`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(promo.id)}
                disabled={deletePromo.isPending}
                className="p-2 rounded hover:opacity-80"
                style={{ background: 'rgba(244, 67, 54, 0.2)', color: '#F44336' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Dados de exemplo para gráficos
const salesData = [
  { day: 'Seg', sales: 1200, orders: 8 },
  { day: 'Ter', sales: 1900, orders: 12 },
  { day: 'Qua', sales: 1600, orders: 10 },
  { day: 'Qui', sales: 2100, orders: 14 },
  { day: 'Sex', sales: 2800, orders: 18 },
  { day: 'Sab', sales: 3500, orders: 22 },
  { day: 'Dom', sales: 2900, orders: 19 },
];

const peakHoursData = [
  { hour: '11h', orders: 2 },
  { hour: '12h', orders: 8 },
  { hour: '13h', orders: 6 },
  { hour: '14h', orders: 3 },
  { hour: '18h', orders: 5 },
  { hour: '19h', orders: 12 },
  { hour: '20h', orders: 9 },
  { hour: '21h', orders: 4 },
];

const topProductsData = [
  { name: 'X-Burguer', value: 35, fill: '#C9A227' },
  { name: 'X-Bacon', value: 25, fill: '#FFA500' },
  { name: 'Combo', value: 20, fill: '#FF6B35' },
  { name: 'Bebidas', value: 15, fill: '#4CAF50' },
  { name: 'Extras', value: 5, fill: '#2196F3' },
];

function DashboardTab() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  const { data: dashboardData, isLoading } = trpc.dashboard.getStats.useQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  
  const salesData = dashboardData?.salesData || [];
  const peakHoursData = dashboardData?.peakHoursData || [];
  const topProductsData = dashboardData?.topProducts || [];
  const stats = dashboardData?.stats || { todaySales: '0', todayOrders: 0, avgTicket: '0', totalOrders: 0, salesGrowth: '0', ordersGrowth: '0', avgTicketGrowth: '0' };
  
  const handleDateRangeChange = (range: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (range) {
      case 'today':
        setStartDate(new Date(today));
        setEndDate(new Date(today));
        break;
      case '7days':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        setStartDate(sevenDaysAgo);
        setEndDate(new Date(today));
        break;
      case '30days':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
        setStartDate(thirtyDaysAgo);
        setEndDate(new Date(today));
        break;
      case 'month':
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setStartDate(firstDay);
        setEndDate(lastDay);
        break;
    }
  };
  
  const exportToPDF = () => {
    const toastId = toast.loading('Gerando PDF...');
    try {
      console.log('Iniciando geração de PDF...');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      console.log('jsPDF instanciado com sucesso.');
      const pageW = 210;
      const margin = 14;
      const col = pageW - margin * 2;
      let y = margin;

      const periodStr = startDate && endDate
        ? `${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`
        : 'Todos os períodos';

      // ── Cabeçalho ──────────────────────────────────────────────────────────
      pdf.setFillColor(10, 10, 10);
      pdf.rect(0, 0, pageW, 30, 'F');
      pdf.setTextColor(201, 162, 39);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text("NEW S'BURGUER", margin, y + 7);
      pdf.setFontSize(10);
      pdf.setTextColor(138, 122, 90);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Relatório de Vendas', margin, y + 14);
      pdf.text(periodStr, margin, y + 20);
      pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, pageW - margin, y + 14, { align: 'right' });
      y = 38;

      // ── Estatísticas Principais ────────────────────────────────────────────
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(245, 240, 232);
      pdf.text('Estatísticas do Período', margin, y);
      y += 6;

      pdf.setDrawColor(201, 162, 39);
      pdf.setLineWidth(0.3);
      pdf.line(margin, y, pageW - margin, y);
      y += 5;

      const statItems = [
        ['Vendas Hoje', `R$ ${stats.todaySales}`, `${parseFloat(stats.salesGrowth) >= 0 ? '+' : ''}${stats.salesGrowth}%`],
        ['Pedidos Hoje', String(stats.todayOrders), `${parseFloat(stats.ordersGrowth) >= 0 ? '+' : ''}${stats.ordersGrowth}%`],
        ['Ticket Médio', `R$ ${stats.avgTicket}`, `${parseFloat(stats.avgTicketGrowth) >= 0 ? '+' : ''}${stats.avgTicketGrowth}%`],
        ['Total de Pedidos', String(stats.totalOrders), ''],
      ];

      const boxW = col / 2 - 3;
      let bx = margin;
      let by = y;
      statItems.forEach(([label, value, growth], i) => {
        console.log(`Rendering stat box ${i}`);
        pdf.setFillColor(17, 17, 17);
        pdf.rect(bx, by, boxW, 22, 'F');
        pdf.setDrawColor(201, 162, 39);
        pdf.setLineWidth(0.2);
        pdf.rect(bx, by, boxW, 22, 'S');

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(138, 122, 90);
        pdf.text(label, bx + 4, by + 7);

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(201, 162, 39);
        pdf.text(value, bx + 4, by + 16);

        if (growth) {
          const g = parseFloat(growth);
          pdf.setFontSize(8);
          pdf.setTextColor(g >= 0 ? 76 : 244, g >= 0 ? 175 : 67, g >= 0 ? 80 : 54);
          pdf.text(growth, bx + boxW - 4, by + 16, { align: 'right' });
        }

        if (i % 2 === 1) { bx = margin; by += 26; } else { bx += boxW + 6; }
      });
      y = by + (bx === margin ? 0 : 26) + 4;

      // ── Vendas por Período ─────────────────────────────────────────────────
      if (salesData.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(245, 240, 232);
        pdf.text('Vendas por Período', margin, y);
        y += 6;
        pdf.line(margin, y, pageW - margin, y);
        y += 5;

        // Cabeçalho da tabela
        pdf.setFillColor(25, 25, 25);
        pdf.rect(margin, y, col, 7, 'F');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(201, 162, 39);
        pdf.text('Período', margin + 2, y + 5);
        pdf.text('Vendas (R$)', margin + col * 0.5, y + 5);
        pdf.text('Pedidos', margin + col * 0.8, y + 5);
        y += 7;

        salesData.slice(0, 15).forEach((row: any, i: number) => {
          if (i % 2 === 0) {
            pdf.setFillColor(20, 20, 20);
            pdf.rect(margin, y, col, 6, 'F');
          }
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(245, 240, 232);
          pdf.setFontSize(8);
          pdf.text(String(row.day || row.date || `Período ${i + 1}`), margin + 2, y + 4);
          pdf.text(`R$ ${Number(row.sales || 0).toFixed(2)}`, margin + col * 0.5, y + 4);
          pdf.text(String(row.orders || 0), margin + col * 0.8, y + 4);
          y += 6;
        });
        y += 4;
      }

      // ── Produtos Mais Vendidos ─────────────────────────────────────────────
      if (topProductsData.length > 0) {
        if (y > 230) { pdf.addPage(); y = margin; }

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(245, 240, 232);
        pdf.text('Produtos Mais Vendidos', margin, y);
        y += 6;
        pdf.line(margin, y, pageW - margin, y);
        y += 5;

        pdf.setFillColor(25, 25, 25);
        pdf.rect(margin, y, col, 7, 'F');
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(201, 162, 39);
        pdf.text('Produto', margin + 2, y + 5);
        pdf.text('Participação (%)', margin + col * 0.65, y + 5);
        y += 7;

        topProductsData.slice(0, 10).forEach((prod: any, i: number) => {
          if (i % 2 === 0) {
            pdf.setFillColor(20, 20, 20);
            pdf.rect(margin, y, col, 6, 'F');
          }
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(245, 240, 232);
          pdf.setFontSize(8);
          pdf.text(`${i + 1}. ${prod.name}`, margin + 2, y + 4);
          pdf.text(`${prod.value}%`, margin + col * 0.65, y + 4);
          y += 6;
        });
      }

      // ── Rodapé ─────────────────────────────────────────────────────────────
      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(7);
        pdf.setTextColor(74, 58, 42);
        pdf.text(`Pág. ${p} de ${totalPages}  •  New S'Burguer  •  Relatório gerado automaticamente`, pageW / 2, 292, { align: 'center' });
      }

      const dateStr = startDate ? startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      pdf.save(`relatorio-newsburguer-${dateStr}.pdf`);
      toast.success('PDF gerado com sucesso!', { id: toastId });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.', { id: toastId });
    }
  };
  
  return (
    <div>
      <h2 className="font-display text-3xl font-bold mb-8" style={{ color: '#F5F0E8' }}>
        Dashboard de Vendas
      </h2>
      
      {/* Seletor de Datas */}
      <div className="mb-6 flex gap-3 flex-wrap items-center">
        <div className="flex gap-3">
          <button
            onClick={() => handleDateRangeChange('today')}
            className="px-5 py-2 rounded-lg text-sm font-bold transition shadow-lg hover:brightness-110"
            style={{ background: 'linear-gradient(180deg, #EAD695 0%, #B8860B 100%)', color: '#111', border: '1px solid rgba(255,215,0,0.5)', boxShadow: '0 0 15px rgba(201,162,39,0.4)' }}
          >
            Hoje
          </button>
          <button
            onClick={() => handleDateRangeChange('7days')}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition hover:bg-[#C9A227]/20"
            style={{ background: 'rgba(10,16,13,0.7)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
          >
            Últimos 7 dias
          </button>
          <button
            onClick={() => handleDateRangeChange('30days')}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition hover:bg-[#C9A227]/20"
            style={{ background: 'rgba(10,16,13,0.7)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
          >
            Últimos 30 dias
          </button>
          <button
            onClick={() => handleDateRangeChange('month')}
            className="px-5 py-2 rounded-lg text-sm font-semibold transition hover:bg-[#C9A227]/20"
            style={{ background: 'rgba(10,16,13,0.7)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
          >
            Este mês
          </button>
        </div>
        
        <div className="flex gap-2 items-center ml-4">
          <input
            type="date"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: 'rgba(10,16,13,0.7)', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
          />
          <span style={{ color: '#8A7A5A' }}>a</span>
          <input
            type="date"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
            className="px-3 py-2 rounded-lg text-sm"
            style={{ background: 'rgba(10,16,13,0.7)', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
          />
        </div>
        
        <button
          onClick={exportToPDF}
          className="px-5 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ml-auto shadow-lg hover:brightness-110"
          style={{ background: 'linear-gradient(180deg, #EAD695 0%, #B8860B 100%)', color: '#111', border: '1px solid rgba(255,215,0,0.5)', boxShadow: '0 0 15px rgba(201,162,39,0.4)' }}
        >
          <Download size={16} />
          Exportar PDF
        </button>
      </div>

      {/* Conteúdo do Dashboard para Exportação */}
      <div id="dashboard-content">
      {/* Estatísticas Rápidas */}
      {isLoading ? (
        <p style={{ color: '#8A7A5A' }}>Carregando dados...</p>
      ) : (
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="rounded-2xl p-6" style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.8)', boxShadow: '0 0 40px rgba(201,162,39,0.4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>Vendas Hoje</p>
                <h3 className="text-3xl font-bold mt-2" style={{ color: '#C9A227' }}>R$ {stats.todaySales}</h3>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: parseFloat(stats.salesGrowth) >= 0 ? '#4CAF50' : '#FF6B6B' }}>
                  {parseFloat(stats.salesGrowth) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(stats.salesGrowth))}%
                </p>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: '#8A7A5A' }}>vs período anterior</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.8)', boxShadow: '0 0 40px rgba(201,162,39,0.4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>Pedidos Hoje</p>
                <h3 className="text-3xl font-bold mt-2" style={{ color: '#C9A227' }}>{stats.todayOrders}</h3>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: parseFloat(stats.ordersGrowth) >= 0 ? '#4CAF50' : '#FF6B6B' }}>
                  {parseFloat(stats.ordersGrowth) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(stats.ordersGrowth))}%
                </p>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: '#8A7A5A' }}>vs período anterior</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.8)', boxShadow: '0 0 40px rgba(201,162,39,0.4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>Ticket Médio</p>
                <h3 className="text-3xl font-bold mt-2" style={{ color: '#C9A227' }}>R$ {stats.avgTicket}</h3>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: parseFloat(stats.avgTicketGrowth) >= 0 ? '#4CAF50' : '#FF6B6B' }}>
                  {parseFloat(stats.avgTicketGrowth) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(stats.avgTicketGrowth))}%
                </p>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: '#8A7A5A' }}>vs período anterior</p>
          </div>
          <div className="rounded-2xl p-6" style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.8)', boxShadow: '0 0 40px rgba(201,162,39,0.4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>Total de Pedidos</p>
                <h3 className="text-3xl font-bold mt-2" style={{ color: '#C9A227' }}>{stats.totalOrders}</h3>
              </div>
              <div className="text-right">
                 <p className="text-sm font-semibold" style={{ color: '#4CAF50' }}>
                  ↑ 0%
                </p>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: '#8A7A5A' }}>Todos os tempos</p>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Vendas por Dia */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}>
          <h3 className="font-semibold mb-6" style={{ color: '#F5F0E8' }}>Vendas Últimos 7 Dias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A227" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#C9A227" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.1)" vertical={false} />
              <XAxis dataKey="day" stroke="#8A7A5A" axisLine={false} tickLine={false} />
              <YAxis stroke="#8A7A5A" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#0a100d', border: '1px solid rgba(201,162,39,0.3)', borderRadius: '8px' }}
                labelStyle={{ color: '#C9A227' }}
                itemStyle={{ color: '#F5F0E8' }}
              />
              <Area type="monotone" dataKey="sales" stroke="#C9A227" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" dot={{ fill: '#0a100d', stroke: '#C9A227', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#C9A227' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Horários de Pico */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}>
          <h3 className="font-semibold mb-6" style={{ color: '#F5F0E8' }}>Horários de Pico</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={peakHoursData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A227" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#C9A227" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.1)" vertical={false} />
              <XAxis dataKey="hour" stroke="#8A7A5A" axisLine={false} tickLine={false} />
              <YAxis stroke="#8A7A5A" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: '#0a100d', border: '1px solid rgba(201,162,39,0.3)', borderRadius: '8px' }}
                labelStyle={{ color: '#C9A227' }}
                itemStyle={{ color: '#F5F0E8' }}
              />
              <Area type="monotone" dataKey="orders" stroke="#C9A227" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" dot={{ fill: '#0a100d', stroke: '#C9A227', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#C9A227' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Produtos Mais Vendidos */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-2xl p-6" style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#F5F0E8' }}>Produtos Mais Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topProductsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {topProductsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#0A0A0A', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}
                labelStyle={{ color: '#C9A227' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Resumo de Produtos */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(10,16,13,0.85)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 30px rgba(201,162,39,0.3)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#F5F0E8' }}>Top 5 Produtos</h3>
          <div className="space-y-3">
            {topProductsData.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ background: product.fill }}
                  />
                  <span style={{ color: '#F5F0E8' }}>{product.name}</span>
                </div>
                <span style={{ color: '#C9A227' }} className="font-semibold">{product.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
function StoreToggle() {
  const { data: settings } = trpc.storeSettings.get.useQuery();
  const updateSettings = trpc.storeSettings.update.useMutation();
  const isOpen = settings?.isOpen === 1;

  const toggleStore = async () => {
    try {
      await updateSettings.mutateAsync({ isOpen: isOpen ? 0 : 1 });
      toast.success(isOpen ? 'Loja fechada' : 'Loja aberta');
    } catch (e) {
      toast.error('Erro ao alterar status da loja');
    }
  };

  return (
    <button
      onClick={toggleStore}
      className="flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all"
      style={{
        background: isOpen ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 107, 107, 0.1)',
        color: isOpen ? '#4CAF50' : '#FF6B6B',
        border: isOpen ? '1px solid rgba(76, 175, 80, 0.3)' : '1px solid rgba(255, 107, 107, 0.3)'
      }}
    >
      <Power size={18} />
      {isOpen ? 'LOJA ABERTA' : 'LOJA FECHADA'}
    </button>
  );
}

function EntregadoresTab() {
  const { data: drivers, refetch } = trpc.drivers.getAll.useQuery();
  const createDriver = trpc.drivers.create.useMutation();
  const deleteDriver = trpc.drivers.delete.useMutation();
  const [formData, setFormData] = useState({ name: '', phone: '', vehicleType: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return toast.error('Preencha nome e telefone');
    await createDriver.mutateAsync(formData);
    toast.success('Entregador adicionado');
    setFormData({ name: '', phone: '', vehicleType: '' });
    refetch();
  };

  return (
    <div>
      <h2 className="text-xl font-display font-bold mb-6 text-[#F5F0E8]">Entregadores</h2>
      <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-lg bg-[#111] border border-[#C9A227]/20 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm text-[#8A7A5A] mb-1">Nome</label>
          <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#0A0A0A] border border-[#C9A227]/30 rounded p-2 text-white" />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-[#8A7A5A] mb-1">Telefone</label>
          <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#0A0A0A] border border-[#C9A227]/30 rounded p-2 text-white" />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-[#8A7A5A] mb-1">Veículo</label>
          <input type="text" value={formData.vehicleType} onChange={e => setFormData({ ...formData, vehicleType: e.target.value })} className="w-full bg-[#0A0A0A] border border-[#C9A227]/30 rounded p-2 text-white" />
        </div>
        <button type="submit" className="bg-[#C9A227] text-black px-4 py-2 rounded font-bold">Adicionar</button>
      </form>
      <div className="grid gap-4">
        {drivers?.map(d => (
          <div key={d.id} className="p-4 rounded-lg bg-[#111] border border-[#C9A227]/20 flex justify-between items-center">
            <div>
              <p className="font-bold text-[#F5F0E8]">{d.name}</p>
              <div className="text-xs text-[#8A7A5A]">Veículo: {d.vehicleType || 'Não informado'}</div>
            </div>
            <button onClick={async () => { await deleteDriver.mutateAsync({ id: d.id }); refetch(); }} className="text-red-500 hover:text-red-400">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function CuponsTab() {
  const { data: coupons, refetch } = trpc.coupons.getAll.useQuery();
  const createCoupon = trpc.coupons.create.useMutation();
  const deleteCoupon = trpc.coupons.delete.useMutation();
  const [formData, setFormData] = useState({ code: '', type: 'percentage', discountValue: 0, minOrderAmount: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || formData.discountValue <= 0) return toast.error('Preencha código e desconto');
    await createCoupon.mutateAsync({ ...formData, type: formData.type as any, discountValue: Number(formData.discountValue), minOrderAmount: Number(formData.minOrderAmount) });
    toast.success('Cupom criado');
    setFormData({ code: '', type: 'percentage', discountValue: 0, minOrderAmount: 0 });
    refetch();
  };

  return (
    <div>
      <h2 className="text-xl font-display font-bold mb-6 text-[#F5F0E8]">Cupons de Desconto</h2>
      <form onSubmit={handleSubmit} className="mb-8 p-4 rounded-lg bg-[#111] border border-[#C9A227]/20 grid grid-cols-5 gap-4 items-end">
        <div>
          <label className="block text-sm text-[#8A7A5A] mb-1">Código</label>
          <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full bg-[#0A0A0A] border border-[#C9A227]/30 rounded p-2 text-white" />
        </div>
        <div>
          <label className="block text-sm text-[#8A7A5A] mb-1">Tipo</label>
          <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full bg-[#0A0A0A] border border-[#C9A227]/30 rounded p-2 text-white">
            <option value="percentage">Porcentagem (%)</option>
            <option value="fixed">Fixo (R$)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#8A7A5A] mb-1">Desconto</label>
          <input type="number" value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })} className="w-full bg-[#0A0A0A] border border-[#C9A227]/30 rounded p-2 text-white" />
        </div>
        <div>
          <label className="block text-sm text-[#8A7A5A] mb-1">Pedido Mín. (R$)</label>
          <input type="number" value={formData.minOrderAmount} onChange={e => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })} className="w-full bg-[#0A0A0A] border border-[#C9A227]/30 rounded p-2 text-white" />
        </div>
        <button type="submit" className="bg-[#C9A227] text-black px-4 py-2 rounded font-bold">Criar</button>
      </form>
      <div className="grid gap-4">
        {coupons?.map(c => (
          <div key={c.id} className="p-4 rounded-lg bg-[#111] border border-[#C9A227]/20 flex justify-between items-center">
            <div>
              <p className="font-bold text-[#F5F0E8]">{c.code}</p>
              <p className="text-sm text-[#8A7A5A]">{c.discountType === 'percentage' ? c.discountValue + '%' : 'R$ ' + c.discountValue} • Min: R$ {c.minOrderAmount}</p>
            </div>
            <button onClick={async () => { await deleteCoupon.mutateAsync({ id: c.id }); refetch(); }} className="text-red-500 hover:text-red-400">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}





