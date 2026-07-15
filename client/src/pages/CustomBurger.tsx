import { useState, useMemo } from 'react';
import { Plus, Minus, ShoppingCart, Trash2, ChevronDown, ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/menuData';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const CATEGORY_ORDER = ['paes', 'carnes', 'queijos', 'molhos', 'vegetais', 'extras'];

const CATEGORY_EMOJI: Record<string, string> = {
  paes: '🍞',
  carnes: '🥩',
  queijos: '🧀',
  molhos: '🫙',
  vegetais: '🥬',
  extras: '🍟',
};

type DbIngredient = {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string | null;
  price: number;
  category: string;
  categoryLabel: string;
};

interface SelectedIngredient {
  ingredient: DbIngredient;
  quantity: number;
}

export default function CustomBurger() {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    CATEGORY_ORDER.reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  );
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const [, navigate] = useLocation();

  // Load from DB
  const { data: dbIngredients = [], isLoading: isLoadingIngredients } = trpc.customIngredients.getAll.useQuery();

  // Group them by category
  const ingredientsByCategory = useMemo(() => {
    return (dbIngredients as DbIngredient[]).reduce<Record<string, { label: string; emoji: string; items: DbIngredient[] }>>(
      (acc, ing) => {
        if (!acc[ing.category]) {
          acc[ing.category] = { label: ing.categoryLabel, emoji: CATEGORY_EMOJI[ing.category] || '🍴', items: [] };
        }
        acc[ing.category].items.push(ing);
        return acc;
      },
      {}
    );
  }, [dbIngredients]);

  const selectedList = useMemo<SelectedIngredient[]>(() => {
    return (dbIngredients as DbIngredient[])
      .filter(ing => (selected[ing.id] || 0) > 0)
      .map(ing => ({ ingredient: ing, quantity: selected[ing.id] }));
  }, [selected, dbIngredients]);

  const total = useMemo(() => {
    return selectedList.reduce((sum, { ingredient, quantity }) => sum + ingredient.price * quantity, 0);
  }, [selectedList]);

  const itemCount = useMemo(() => {
    return selectedList.reduce((sum, { quantity }) => sum + quantity, 0);
  }, [selectedList]);

  function setQuantity(id: string, qty: number) {
    setSelected(prev => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: qty };
    });
  }

  function toggleCategory(cat: string) {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  }

  function clearAll() {
    setSelected({});
    setNotes('');
  }

  function handleAddToCart(goToCart = false) {
    if (selectedList.length === 0) {
      toast.error('Adicione pelo menos um ingrediente!', {
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
      return;
    }

    setIsAdding(true);

    const ingredientSummary = selectedList
      .map(({ ingredient, quantity }) => `${quantity > 1 ? `${quantity}x ` : ''}${ingredient.name}`)
      .join(', ');

    const customItemId = `custom-burger-${Date.now()}`;

    addItem({
      id: customItemId,
      name: '🛠️ Meu Lanche Especial',
      price: total,
      emoji: '🛠️',
      customization: {
        removedIngredients: [],
        addedExtras: selectedList.map(({ ingredient, quantity }) => ({
          id: ingredient.id,
          name: `${quantity > 1 ? `${quantity}x ` : ''}${ingredient.name}`,
          price: ingredient.price * quantity,
        })),
        notes: notes,
      },
      customizationPrice: 0,
    });

    toast.success('Lanche especial adicionado ao carrinho! 🎉', {
      style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
    });

    setTimeout(() => {
      setIsAdding(false);
      if (goToCart) {
        navigate('/cart');
      } else {
        clearAll();
      }
    }, 400);
  }

  return (
    <div className="min-h-screen text-[#F5F0E8]" style={{ background: '#070b08' }}>
      <Navbar />

      {/* Hero Header */}
      <div
        className="relative pt-24 pb-10 px-4 overflow-hidden flex flex-col items-center justify-center"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(201,162,39,0.12) 0%, #070b08 70%)' }}
      >
        {/* Decorative glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A227, transparent 70%)' }}
        />

        <div className="relative z-10 text-center max-w-xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)', color: '#C9A227' }}>
            <Sparkles size={12} />
            Exclusivo
          </div>
          <p className="text-xs font-serif uppercase tracking-widest text-[#C9A227] mb-1">MONTE DO SEU JEITO</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-3 text-[#F5F0E8]">
            Crie Seu Lanche
          </h1>
          <div className="flex items-center gap-3 justify-center w-40 mx-auto mb-4">
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, #C9A227)' }} />
            <div className="w-1.5 h-1.5 rotate-45 bg-[#C9A227]" />
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, transparent, #C9A227)' }} />
          </div>
          <p className="text-sm text-[#8A7A5A] leading-relaxed">
            Escolha seus ingredientes favoritos, monte seu lanche ideal e veja o valor em tempo real.
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container max-w-6xl mx-auto px-4 pb-40 lg:pb-20">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">

          {/* LEFT — Ingredient Picker */}
          <div className="flex-1 space-y-4">
            {isLoadingIngredients ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={36} className="animate-spin" style={{ color: '#C9A227' }} />
                <p style={{ color: '#8A7A5A' }}>Carregando ingredientes...</p>
              </div>
            ) : (
            <>{CATEGORY_ORDER.map(catKey => {
              const cat = ingredientsByCategory[catKey];
              if (!cat) return null;
              const isOpen = expandedCategories[catKey];

              return (
                <div
                  key={catKey}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(201,162,39,0.2)', background: 'linear-gradient(135deg, rgba(13,38,25,0.6) 0%, rgba(7,11,8,0.9) 100%)' }}
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(catKey)}
                    className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.emoji}</span>
                      <h2 className="font-serif font-bold text-base text-[#F5F0E8]">{cat.label}</h2>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(201,162,39,0.15)', color: '#C9A227' }}
                      >
                        {cat.items.filter(i => (selected[i.id] || 0) > 0).length} selecionado(s)
                      </span>
                    </div>
                    {isOpen ? <ChevronUp size={18} style={{ color: '#C9A227' }} /> : <ChevronDown size={18} style={{ color: '#8A7A5A' }} />}
                  </button>

                  {/* Ingredients */}
                  {isOpen && (
                    <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.items.map(ing => {
                        const qty = selected[ing.id] || 0;
                        const isSelected = qty > 0;

                        return (
                          <div
                            key={ing.id}
                            className="flex items-center justify-between p-3 rounded-xl transition-all duration-200"
                            style={{
                              background: isSelected ? 'rgba(201,162,39,0.08)' : 'rgba(13,38,25,0.5)',
                              border: `1px solid ${isSelected ? 'rgba(201,162,39,0.4)' : 'rgba(201,162,39,0.1)'}`,
                              boxShadow: isSelected ? '0 0 12px rgba(201,162,39,0.1)' : 'none',
                            }}
                          >
                            {/* Info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {ing.image ? (
                                <img src={ing.image} alt={ing.name} className="w-12 h-12 rounded-lg object-cover shadow-sm" style={{ border: '1px solid rgba(201,162,39,0.3)' }} />
                              ) : (
                                <span className="text-2xl flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>{ing.emoji}</span>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-[#F5F0E8] truncate">{ing.name}</p>
                                <p className="text-xs font-bold" style={{ color: '#C9A227' }}>
                                  {formatPrice(ing.price)}
                                </p>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              {qty > 0 ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setQuantity(ing.id, qty - 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-red-900/30 active:scale-90"
                                    style={{ border: '1px solid rgba(201,162,39,0.3)', color: '#C9A227' }}
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="w-5 text-center text-sm font-bold text-[#F5F0E8]">{qty}</span>
                                  <button
                                    onClick={() => setQuantity(ing.id, qty + 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-[#C9A227]/20 active:scale-90"
                                    style={{ background: '#C9A227', color: '#0A0A0A' }}
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setQuantity(ing.id, 1)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-110 active:scale-90"
                                  style={{ background: '#C9A227', color: '#0A0A0A' }}
                                >
                                  <Plus size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}</>
            )}

            {/* Notes */}
            <div
              className="rounded-2xl p-5"
              style={{ border: '1px solid rgba(201,162,39,0.2)', background: 'linear-gradient(135deg, rgba(13,38,25,0.6) 0%, rgba(7,11,8,0.9) 100%)' }}
            >
              <h2 className="font-serif font-bold text-base text-[#F5F0E8] mb-3 flex items-center gap-2">
                📝 Observações
              </h2>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                maxLength={200}
                placeholder="Ex: Carne bem passada, pouco molho, sem sal..."
                className="w-full p-3 rounded-xl text-sm resize-none transition-colors focus:outline-none"
                style={{
                  background: 'rgba(13,38,25,0.8)',
                  border: '1px solid rgba(201,162,39,0.15)',
                  color: '#F5F0E8',
                }}
                rows={3}
              />
              <p className="text-xs mt-1" style={{ color: '#4A3A2A' }}>{notes.length}/200 caracteres</p>
            </div>
          </div>

          {/* RIGHT — Summary Panel (sticky on desktop) */}
          <div className="lg:w-80 lg:sticky lg:top-24 space-y-4">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(201,162,39,0.3)', background: 'linear-gradient(145deg, rgba(20,50,30,0.9) 0%, rgba(10,14,11,0.95) 100%)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
            >
              {/* Panel Header */}
              <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(201,162,39,0.15)' }}>
                <div className="flex items-center justify-between">
                  <h2 className="font-serif font-bold text-base text-[#F5F0E8] flex items-center gap-2">
                    🛠️ Seu Lanche
                    {itemCount > 0 && (
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: '#C9A227', color: '#0A0A0A' }}
                      >
                        {itemCount} item(s)
                      </span>
                    )}
                  </h2>
                  {selectedList.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-1 text-xs transition-colors hover:text-red-400"
                      style={{ color: '#8A7A5A' }}
                    >
                      <Trash2 size={12} />
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Selected Items */}
              <div className="px-5 py-4 min-h-[120px]">
                {selectedList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <span className="text-4xl mb-2 opacity-30">🍔</span>
                    <p className="text-sm" style={{ color: '#8A7A5A' }}>
                      Nenhum ingrediente ainda.<br />Comece adicionando ao lado!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
                    {selectedList.map(({ ingredient, quantity }) => (
                      <div key={ingredient.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-sm">{ingredient.emoji}</span>
                          <span className="text-sm text-[#F5F0E8] truncate">
                            {quantity > 1 && <span className="font-bold text-[#C9A227]">{quantity}x </span>}
                            {ingredient.name}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#C9A227] flex-shrink-0">
                          {formatPrice(ingredient.price * quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total & Buttons */}
              <div className="px-5 py-4 border-t" style={{ borderColor: 'rgba(201,162,39,0.15)' }}>
                {/* Divider line with total */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-[#8A7A5A] uppercase tracking-wider">Total</span>
                  <span
                    className="text-2xl font-bold font-serif"
                    style={{ color: '#C9A227' }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>

                {selectedList.length > 0 && (
                  <p className="text-xs text-center mb-3" style={{ color: '#8A7A5A' }}>
                    {selectedList.length} ingrediente(s) selecionado(s)
                  </p>
                )}

                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToCart(false)}
                    disabled={selectedList.length === 0 || isAdding}
                    className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: '#C9A227', color: '#0A0A0A' }}
                  >
                    <ShoppingCart size={16} />
                    {isAdding ? 'Adicionando...' : 'Adicionar ao Carrinho'}
                  </button>
                  <button
                    onClick={() => handleAddToCart(true)}
                    disabled={selectedList.length === 0 || isAdding}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{
                      background: 'rgba(201,162,39,0.12)',
                      color: '#C9A227',
                      border: '1px solid rgba(201,162,39,0.35)',
                    }}
                  >
                    🛒 Adicionar e Ir ao Carrinho
                  </button>
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div
              className="rounded-2xl p-4"
              style={{ border: '1px solid rgba(201,162,39,0.15)', background: 'rgba(201,162,39,0.04)' }}
            >
              <p className="text-xs font-bold text-[#C9A227] mb-2 uppercase tracking-wider">💡 Dicas</p>
              <ul className="space-y-1.5 text-xs" style={{ color: '#8A7A5A' }}>
                <li>• Use o botão <span className="text-[#C9A227]">+</span> para adicionar mais de um do mesmo ingrediente</li>
                <li>• Adicione observações para personalizar ainda mais</li>
                <li>• Pode montar combos misturando hambúrguer e hot dog!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 lg:hidden p-4 z-40"
        style={{
          background: 'linear-gradient(to top, #070b08 80%, transparent)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            onClick={() => handleAddToCart(false)}
            disabled={selectedList.length === 0 || isAdding}
            className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: '#C9A227', color: '#0A0A0A' }}
          >
            <ShoppingCart size={16} />
            <span>
              {isAdding ? 'Adicionando...' : selectedList.length === 0 ? 'Monte seu lanche' : `Adicionar · ${formatPrice(total)}`}
            </span>
          </button>
          {selectedList.length > 0 && (
            <button
              onClick={() => handleAddToCart(true)}
              disabled={isAdding}
              className="py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95"
              style={{
                background: 'rgba(201,162,39,0.12)',
                color: '#C9A227',
                border: '1px solid rgba(201,162,39,0.35)',
              }}
            >
              🛒
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
