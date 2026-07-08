import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Star } from 'lucide-react';

export default function Ratings() {
  const [phone, setPhone] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [orderId, setOrderId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: stats } = trpc.ratings.getStats.useQuery();
  const { data: customerRatings } = trpc.ratings.getCustomerRatings.useQuery(
    { phone },
    { enabled: !!phone }
  );

  const createRatingMutation = trpc.ratings.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setComment('');
      setRating(5);
      setOrderId('');
      setTimeout(() => setSubmitted(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !orderId) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    createRatingMutation.mutate({
      orderId: parseInt(orderId),
      customerId: phone,
      customerName: 'Cliente',
      customerPhone: phone,
      rating,
      comment: comment || undefined,
    });
  };

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-black mb-2" style={{ color: '#F5F0E8' }}>
            ⭐ Avaliações
          </h1>
          <p className="text-sm" style={{ color: '#8A7A5A' }}>
            Sua opinião é muito importante para nós!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rating Form */}
          <div
            className="rounded-sm p-8"
            style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
          >
            <h2 className="font-display text-2xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
              Deixe sua Avaliação
            </h2>

            {submitted && (
              <div
                className="p-4 rounded-sm mb-6 text-sm"
                style={{ background: 'rgba(45, 95, 46, 0.2)', color: '#2D5F2E' }}
              >
                ✅ Avaliação enviada com sucesso!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#C9A227' }}>
                  Seu Telefone *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-2 rounded-sm"
                  style={{ background: '#1a1a1a', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
                />
              </div>

              {/* Order ID */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#C9A227' }}>
                  Número do Pedido *
                </label>
                <input
                  type="number"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Ex: 1001"
                  className="w-full px-4 py-2 rounded-sm"
                  style={{ background: '#1a1a1a', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
                />
              </div>

              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: '#C9A227' }}>
                  Nota (1-5 estrelas) *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-all"
                    >
                      <Star
                        size={32}
                        fill={star <= rating ? '#C9A227' : 'none'}
                        stroke={star <= rating ? '#C9A227' : '#8A7A5A'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#C9A227' }}>
                  Comentário (Opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Compartilhe sua experiência..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-sm"
                  style={{ background: '#1a1a1a', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createRatingMutation.isPending}
                className="w-full py-3 rounded-sm font-bold transition-all"
                style={{
                  background: '#C9A227',
                  color: '#0A0A0A',
                  opacity: createRatingMutation.isPending ? 0.6 : 1,
                }}
              >
                {createRatingMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
            </form>
          </div>

          {/* Stats and Recent Ratings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overall Stats */}
            {stats && (
              <div
                className="rounded-sm p-8"
                style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
              >
                <h3 className="font-display text-2xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
                  Avaliação Geral
                </h3>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Average Rating */}
                  <div>
                    <p className="text-sm" style={{ color: '#8A7A5A' }}>
                      Nota Média
                    </p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-display text-4xl font-black" style={{ color: '#C9A227' }}>
                        {stats.averageRating.toFixed(1)}
                      </span>
                      <span style={{ color: '#8A7A5A' }}>/5.0</span>
                    </div>
                  </div>

                  {/* Total Ratings */}
                  <div>
                    <p className="text-sm" style={{ color: '#8A7A5A' }}>
                      Total de Avaliações
                    </p>
                    <p className="font-display text-4xl font-black mt-2" style={{ color: '#C9A227' }}>
                      {stats.totalRatings}
                    </p>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star, idx) => (
                    <div key={`rating-${idx}`} className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[...Array(star)].map((_, i) => (
                          <Star key={i} size={16} fill="#C9A227" stroke="#C9A227" />
                        ))}
                      </div>
                      <div className="flex-1 h-2 rounded-full" style={{ background: '#1a1a1a' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            background: '#C9A227',
                            width: `${stats.totalRatings > 0 ? (stats.ratingDistribution[star as keyof typeof stats.ratingDistribution] / stats.totalRatings) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span style={{ color: '#8A7A5A' }}>
                        {stats.ratingDistribution[star as keyof typeof stats.ratingDistribution]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Ratings */}
            {stats && stats.recentRatings.length > 0 && (
              <div
                className="rounded-sm p-8"
                style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
              >
                <h3 className="font-display text-2xl font-bold mb-6" style={{ color: '#F5F0E8' }}>
                  Avaliações Recentes
                </h3>

                <div className="space-y-4">
                  {stats.recentRatings.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-sm"
                      style={{ background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.1)' }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold" style={{ color: '#F5F0E8' }}>
                            {r.customerName}
                          </p>
                          <p className="text-sm" style={{ color: '#8A7A5A' }}>
                            Pedido #{r.orderId}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} size={16} fill="#C9A227" stroke="#C9A227" />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-sm" style={{ color: '#8A7A5A' }}>
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
