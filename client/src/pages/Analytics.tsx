import { trpc } from '@/lib/trpc';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, ShoppingCart, DollarSign, Clock, Zap } from 'lucide-react';

const COLORS = ['#C9A227', '#FF6B35', '#8A7A5A', '#2D5F2E', '#D4A574'];

export default function Analytics() {
  const { data: metrics, isLoading } = trpc.analytics.getMetrics.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p style={{ color: '#8A7A5A' }}>Carregando análises...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p style={{ color: '#8A7A5A' }}>Erro ao carregar dados</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-black mb-2" style={{ color: '#F5F0E8' }}>
            📊 Dashboard de Análises
          </h1>
          <p className="text-sm" style={{ color: '#8A7A5A' }}>
            Métricas em tempo real do seu negócio
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Total Orders */}
          <div
            className="rounded-sm p-6"
            style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>
                  Total de Pedidos
                </p>
                <h3 className="font-display text-3xl font-bold" style={{ color: '#F5F0E8' }}>
                  {metrics.totalOrders}
                </h3>
              </div>
              <ShoppingCart size={40} style={{ color: '#C9A227' }} />
            </div>
            <p className="text-xs" style={{ color: '#8A7A5A' }}>
              Todos os pedidos entregues
            </p>
          </div>

          {/* Total Revenue */}
          <div
            className="rounded-sm p-6"
            style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>
                  Receita Total
                </p>
                <h3 className="font-display text-3xl font-bold" style={{ color: '#F5F0E8' }}>
                  R$ {parseFloat(metrics.totalRevenue).toFixed(2)}
                </h3>
              </div>
              <DollarSign size={40} style={{ color: '#C9A227' }} />
            </div>
            <p className="text-xs" style={{ color: '#8A7A5A' }}>
              Faturamento total
            </p>
          </div>

          {/* Average Ticket */}
          <div
            className="rounded-sm p-6"
            style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>
                  Ticket Médio
                </p>
                <h3 className="font-display text-3xl font-bold" style={{ color: '#F5F0E8' }}>
                  R$ {parseFloat(metrics.averageTicket).toFixed(2)}
                </h3>
              </div>
              <TrendingUp size={40} style={{ color: '#C9A227' }} />
            </div>
            <p className="text-xs" style={{ color: '#8A7A5A' }}>
              Valor médio por pedido
            </p>
          </div>

          {/* Today Orders */}
          <div
            className="rounded-sm p-6"
            style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>
                  Pedidos Hoje
                </p>
                <h3 className="font-display text-3xl font-bold" style={{ color: '#F5F0E8' }}>
                  {metrics.ordersToday}
                </h3>
              </div>
              <Zap size={40} style={{ color: '#FF6B35' }} />
            </div>
            <p className="text-xs" style={{ color: '#8A7A5A' }}>
              Receita: R$ {parseFloat(metrics.revenueToday).toFixed(2)}
            </p>
          </div>

          {/* This Week */}
          <div
            className="rounded-sm p-6"
            style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>
                  Pedidos Esta Semana
                </p>
                <h3 className="font-display text-3xl font-bold" style={{ color: '#F5F0E8' }}>
                  {metrics.ordersThisWeek}
                </h3>
              </div>
              <Users size={40} style={{ color: '#C9A227' }} />
            </div>
            <p className="text-xs" style={{ color: '#8A7A5A' }}>
              Receita: R$ {parseFloat(metrics.revenueThisWeek).toFixed(2)}
            </p>
          </div>

          {/* Average Delivery Time */}
          <div
            className="rounded-sm p-6"
            style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm" style={{ color: '#8A7A5A' }}>
                  Tempo Médio
                </p>
                <h3 className="font-display text-3xl font-bold" style={{ color: '#F5F0E8' }}>
                  {metrics.averageDeliveryTime}m
                </h3>
              </div>
              <Clock size={40} style={{ color: '#C9A227' }} />
            </div>
            <p className="text-xs" style={{ color: '#8A7A5A' }}>
              Tempo de entrega médio
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Orders by Day */}
          <div
            className="rounded-sm p-6"
            style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <h3 className="font-display text-xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
              📈 Pedidos por Dia (Últimos 30 dias)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.ordersByDay}>
                <CartesianGrid stroke="rgba(201,162,39,0.1)" />
                <XAxis stroke="#8A7A5A" tick={{ fontSize: 12 }} />
                <YAxis stroke="#8A7A5A" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #C9A227' }}
                  labelStyle={{ color: '#C9A227' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#C9A227"
                  name="Pedidos"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Hour */}
          <div
            className="rounded-sm p-6"
            style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <h3 className="font-display text-xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
              ⏰ Pedidos por Hora
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.ordersByHour}>
                <CartesianGrid stroke="rgba(201,162,39,0.1)" />
                <XAxis stroke="#8A7A5A" tick={{ fontSize: 12 }} />
                <YAxis stroke="#8A7A5A" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #C9A227' }}
                  labelStyle={{ color: '#C9A227' }}
                />
                <Bar dataKey="count" fill="#C9A227" name="Pedidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Orders by Status */}
          <div
            className="rounded-sm p-6"
            style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <h3 className="font-display text-xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
              📊 Pedidos por Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.ordersByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {metrics.ordersByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #C9A227' }}
                  labelStyle={{ color: '#C9A227' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Day */}
          <div
            className="rounded-sm p-6"
            style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <h3 className="font-display text-xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
              💰 Receita por Dia
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.ordersByDay}>
                <CartesianGrid stroke="rgba(201,162,39,0.1)" />
                <XAxis stroke="#8A7A5A" tick={{ fontSize: 12 }} />
                <YAxis stroke="#8A7A5A" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #C9A227' }}
                  labelStyle={{ color: '#C9A227' }}
                  formatter={(value) => `R$ ${parseFloat(value as string).toFixed(2)}`}
                />
                <Bar dataKey="revenue" fill="#FF6B35" name="Receita" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers */}
        <div
          className="rounded-sm p-6"
          style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
        >
          <h3 className="font-display text-xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
            👥 Top 5 Clientes
          </h3>
          <div className="space-y-3">
            {metrics.topCustomers.map((customer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-sm"
                style={{
                  background: 'rgba(201,162,39,0.05)',
                  border: '1px solid rgba(201,162,39,0.1)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                    style={{ background: '#C9A227', color: '#0A0A0A' }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: '#F5F0E8' }}>
                      {customer.name}
                    </p>
                    <p className="text-sm" style={{ color: '#8A7A5A' }}>
                      {customer.phone}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: '#C9A227' }}>
                    {customer.orderCount} pedidos
                  </p>
                  <p className="text-sm" style={{ color: '#8A7A5A' }}>
                    R$ {parseFloat(customer.totalSpent).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
