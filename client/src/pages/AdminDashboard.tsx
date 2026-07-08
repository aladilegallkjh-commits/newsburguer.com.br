import { useState } from 'react';
import { useLocation } from 'wouter';
import { LogOut, Menu, X, Settings, FileText, Clock, Trophy, ShoppingBag, Plus, Trash2, Edit2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import MenuImageUpload from '@/components/MenuImageUpload';
import EditMenuItemImageModal from '@/components/EditMenuItemImageModal';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminEmail] = useState(localStorage.getItem('adminEmail') || 'Admin');

  const handleLogout = () => {
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminToken');
    toast.success('Logout realizado', {
      duration: 2000,
      style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
    });
    setLocation('/');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0A0A0A' }}>
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r`}
        style={{ background: '#0D1A14', borderColor: 'rgba(201,162,39,0.15)' }}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between">
          <img src={LOGO_URL} alt="New S'Burguer" className="w-10 h-10 object-contain" />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-sm transition-colors"
            style={{ color: '#C9A227' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="mt-8 space-y-2 px-3">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 ${
                activeTab === item.id ? 'font-semibold' : ''
              }`}
              style={{
                background: activeTab === item.id ? 'rgba(201,162,39,0.15)' : 'transparent',
                color: activeTab === item.id ? '#C9A227' : '#8A7A5A',
              }}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-6 left-3 right-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200"
            style={{
              background: 'rgba(255, 107, 107, 0.1)',
              color: '#FF6B6B',
            }}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div
          className="border-b px-8 py-4 flex items-center justify-between"
          style={{ borderColor: 'rgba(201,162,39,0.15)' }}
        >
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: '#F5F0E8' }}>
              Painel Administrativo
            </h1>
            <p className="text-sm" style={{ color: '#8A7A5A' }}>
              Bem-vindo, {adminEmail}
            </p>
          </div>
          <div className="text-sm" style={{ color: '#8A7A5A' }}>
            {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'pedidos' && <PedidosTab />}
          {activeTab === 'cardapio' && <CardapioTab />}
          {activeTab === 'informacoes' && <InformacoesTab />}
          {activeTab === 'promocoes' && <PromocoesTab />}
        </div>
      </div>
    </div>
  );
}

function PedidosTab() {
  const { data: orders, isLoading } = trpc.orders.getAll.useQuery();
  const updateStatus = trpc.orders.updateStatus.useMutation();

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status: newStatus as any });
      toast.success('Status atualizado!', {
        duration: 2000,
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
    } catch (error) {
      toast.error('Erro ao atualizar status', {
        duration: 2000,
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
    }
  };

  const statusColors: Record<string, string> = {
    'pending': '#FF6B35',
    'confirmed': '#FFA500',
    'preparing': '#C9A227',
    'ready': '#4CAF50',
    'out_for_delivery': '#2196F3',
    'delivered': '#8BC34A',
    'cancelled': '#F44336',
  };

  const statusLabels: Record<string, string> = {
    'pending': 'Pendente',
    'confirmed': 'Confirmado',
    'preparing': 'Preparando',
    'ready': 'Pronto',
    'out_for_delivery': 'Saindo para Entrega',
    'delivered': 'Entregue',
    'cancelled': 'Cancelado',
  };

  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
        Gerenciar Pedidos
      </h2>
      
      {isLoading ? (
        <p style={{ color: '#8A7A5A' }}>Carregando pedidos...</p>
      ) : !orders || orders.length === 0 ? (
        <div
          className="rounded-lg p-6 text-center"
          style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}
        >
          <p style={{ color: '#8A7A5A' }}>Nenhum pedido recebido ainda</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="rounded-lg p-6"
              style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold" style={{ color: '#F5F0E8' }}>
                    {order.orderNumber}
                  </h3>
                  <p className="text-sm" style={{ color: '#8A7A5A' }}>
                    {order.customerName} • {order.customerPhone}
                  </p>
                  <p className="text-sm" style={{ color: '#8A7A5A' }}>
                    {new Date(order.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg" style={{ color: '#C9A227' }}>
                    R$ {parseFloat(order.finalAmount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(201,162,39,0.1)' }}>
                <p className="text-sm font-semibold mb-2" style={{ color: '#C9A227' }}>Itens:</p>
                {Array.isArray(order.items) && order.items.map((item: any, idx: number) => (
                  <p key={idx} className="text-sm" style={{ color: '#8A7A5A' }}>
                    • {item.name} x{item.quantity} - R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      background: `${statusColors[order.status]}20`,
                      color: statusColors[order.status],
                    }}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                  className="px-3 py-2 rounded text-sm"
                  style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
                >
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="preparing">Preparando</option>
                  <option value="ready">Pronto</option>
                  <option value="out_for_delivery">Saindo para Entrega</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                </select>
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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'hamburgers' as const,
    price: 0,
    imageUrl: '',
  });

  const handleAdd = async () => {
    if (!formData.name || formData.price <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await createItem.mutateAsync(formData as any);
      toast.success('Item adicionado!');
      setFormData({ name: '', description: '', category: 'hamburgers', price: 0, imageUrl: '' });
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
        className="rounded-lg p-6 mb-6"
        style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}
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
          className="rounded-lg p-6 text-center"
          style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}
        >
          <p style={{ color: '#8A7A5A' }}>Nenhum item no cardápio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item: any) => (
            <div
              key={item.id}
              className="rounded-lg overflow-hidden"
              style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}
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
                    {item.imageUrl && (
                      <button
                        onClick={() => handleOpenEditImageModal(item)}
                        disabled={updateItem.isPending}
                        className="p-2 rounded hover:opacity-80"
                        style={{ background: 'rgba(201,162,39,0.2)', color: '#C9A227' }}
                        title="Editar imagem"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
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
        className="rounded-lg p-6"
        style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}
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
        className="rounded-lg p-6 mb-6"
        style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}
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
          className="rounded-lg p-6 text-center"
          style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}
        >
          <p style={{ color: '#8A7A5A' }}>Nenhuma promoção cadastrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {promotions.map((promo: any) => (
            <div
              key={promo.id}
              className="rounded-lg p-4 flex items-center justify-between"
              style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}
            >
              <div>
                <h3 className="font-semibold" style={{ color: '#F5F0E8' }}>
                  {promo.title}
                </h3>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>
                  {promo.type === 'percentage' && `${promo.discountValue}% de desconto`}
                  {promo.type === 'fixed' && `R$ ${promo.discountValue.toFixed(2)} de desconto`}
                  {promo.type === 'combo' && `Combo especial`}
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
  
  const exportToPDF = async () => {
    try {
      toast.loading('Gerando PDF...');
      
      // Capturar o elemento do dashboard
      const dashboardElement = document.getElementById('dashboard-content');
      if (!dashboardElement) {
        toast.error('Erro ao gerar PDF');
        return;
      }
      
      // Converter para canvas
      const canvas = await html2canvas(dashboardElement, {
        backgroundColor: '#0A0A0A',
        scale: 2,
      });
      
      // Criar PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Adicionar imagem ao PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297; // A4 height
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }
      
      // Download do PDF
      const fileName = `relatorio-vendas-${startDate?.toISOString().split('T')[0]}-${endDate?.toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };
  
  return (
    <div>
      <h2 className="font-display text-xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
        Dashboard de Vendas
      </h2>
      
      {/* Seletor de Datas */}
      <div className="mb-6 flex gap-3 flex-wrap items-center">
        <div className="flex gap-2">
          <button
            onClick={() => handleDateRangeChange('today')}
            className="px-4 py-2 rounded text-sm font-semibold transition"
            style={{ background: '#C9A227', color: '#0A0A0A' }}
          >
            Hoje
          </button>
          <button
            onClick={() => handleDateRangeChange('7days')}
            className="px-4 py-2 rounded text-sm font-semibold transition"
            style={{ background: 'rgba(201,162,39,0.3)', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.5)' }}
          >
            Últimos 7 dias
          </button>
          <button
            onClick={() => handleDateRangeChange('30days')}
            className="px-4 py-2 rounded text-sm font-semibold transition"
            style={{ background: 'rgba(201,162,39,0.3)', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.5)' }}
          >
            Últimos 30 dias
          </button>
          <button
            onClick={() => handleDateRangeChange('month')}
            className="px-4 py-2 rounded text-sm font-semibold transition"
            style={{ background: 'rgba(201,162,39,0.3)', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.5)' }}
          >
            Este mês
          </button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
            className="px-3 py-2 rounded text-sm"
            style={{ background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' }}
          />
          <span style={{ color: '#8A7A5A' }}>a</span>
          <input
            type="date"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
            className="px-3 py-2 rounded text-sm"
            style={{ background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' }}
          />
        </div>
        
        <button
          onClick={exportToPDF}
          className="px-4 py-2 rounded text-sm font-semibold transition flex items-center gap-2 ml-auto"
          style={{ background: '#C9A227', color: '#0A0A0A' }}
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
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg p-6" style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>Vendas Hoje</p>
                <h3 className="text-2xl font-bold mt-2" style={{ color: '#C9A227' }}>R$ {stats.todaySales}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: parseFloat(stats.salesGrowth) >= 0 ? '#4CAF50' : '#FF6B6B' }}>
                  {parseFloat(stats.salesGrowth) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(stats.salesGrowth))}%
                </p>
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: '#8A7A5A' }}>vs período anterior</p>
          </div>
          <div className="rounded-lg p-6" style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>Pedidos Hoje</p>
                <h3 className="text-2xl font-bold mt-2" style={{ color: '#C9A227' }}>{stats.todayOrders}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: parseFloat(stats.ordersGrowth) >= 0 ? '#4CAF50' : '#FF6B6B' }}>
                  {parseFloat(stats.ordersGrowth) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(stats.ordersGrowth))}%
                </p>
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: '#8A7A5A' }}>vs período anterior</p>
          </div>
          <div className="rounded-lg p-6" style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>Ticket Médio</p>
                <h3 className="text-2xl font-bold mt-2" style={{ color: '#C9A227' }}>R$ {stats.avgTicket}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color: parseFloat(stats.avgTicketGrowth) >= 0 ? '#4CAF50' : '#FF6B6B' }}>
                  {parseFloat(stats.avgTicketGrowth) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(stats.avgTicketGrowth))}%
                </p>
              </div>
            </div>
            <p className="text-xs mt-2" style={{ color: '#8A7A5A' }}>vs período anterior</p>
          </div>
          <div className="rounded-lg p-6" style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}>
            <p className="text-sm" style={{ color: '#8A7A5A' }}>Total de Pedidos</p>
            <h3 className="text-2xl font-bold mt-2" style={{ color: '#C9A227' }}>{stats.totalOrders}</h3>
            <p className="text-xs mt-2" style={{ color: '#4CAF50' }}>Todos os tempos</p>
          </div>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Vendas por Dia */}
        <div className="rounded-lg p-6" style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#F5F0E8' }}>Vendas Últimos 7 Dias</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.2)" />
              <XAxis dataKey="day" stroke="#8A7A5A" />
              <YAxis stroke="#8A7A5A" />
              <Tooltip 
                contentStyle={{ background: '#0A0A0A', border: '1px solid rgba(201,162,39,0.3)' }}
                labelStyle={{ color: '#C9A227' }}
              />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#C9A227" strokeWidth={2} dot={{ fill: '#C9A227' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Horários de Pico */}
        <div className="rounded-lg p-6" style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}>
          <h3 className="font-semibold mb-4" style={{ color: '#F5F0E8' }}>Horários de Pico</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(201,162,39,0.2)" />
              <XAxis dataKey="hour" stroke="#8A7A5A" />
              <YAxis stroke="#8A7A5A" />
              <Tooltip 
                contentStyle={{ background: '#0A0A0A', border: '1px solid rgba(201,162,39,0.3)' }}
                labelStyle={{ color: '#C9A227' }}
              />
              <Bar dataKey="orders" fill="#C9A227" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Produtos Mais Vendidos */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg p-6" style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}>
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
                contentStyle={{ background: '#0A0A0A', border: '1px solid rgba(201,162,39,0.3)' }}
                labelStyle={{ color: '#C9A227' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Resumo de Produtos */}
        <div className="rounded-lg p-6" style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.15)' }}>
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
