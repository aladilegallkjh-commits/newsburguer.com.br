import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { MenuItem, Extra, calculateCustomizationPrice } from '@/lib/menuData';
import { CartItemCustomization } from '@/contexts/CartContext';

interface ProductCustomizerProps {
  product: MenuItem;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customization: CartItemCustomization, customizationPrice: number) => void;
  onAddAndGoToCart?: (customization: CartItemCustomization, customizationPrice: number) => void;
}

export default function ProductCustomizer({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onAddAndGoToCart,
}: ProductCustomizerProps) {
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([]);
  const [addedExtras, setAddedExtras] = useState<Extra[]>([]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const toggleIngredient = (ingredient: string) => {
    setRemovedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const toggleExtra = (extra: Extra) => {
    setAddedExtras(prev =>
      prev.find(e => e.id === extra.id)
        ? prev.filter(e => e.id !== extra.id)
        : [...prev, extra]
    );
  };

  const customizationPrice = calculateCustomizationPrice(addedExtras);
  const totalPrice = product.price + customizationPrice;

  const handleAddToCart = () => {
    const customization: CartItemCustomization = {
      removedIngredients,
      addedExtras,
      notes,
    };
    onAddToCart(customization, customizationPrice);
    handleClose();
  };

  const handleAddAndGoToCart = () => {
    const customization: CartItemCustomization = {
      removedIngredients,
      addedExtras,
      notes,
    };
    if (onAddAndGoToCart) {
      onAddAndGoToCart(customization, customizationPrice);
    }
    handleClose();
  };

  const handleClose = () => {
    setRemovedIngredients([]);
    setAddedExtras([]);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative w-full md:w-full md:max-w-2xl rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between p-4 md:p-6 border-b"
          style={{ borderColor: 'rgba(201,162,39,0.15)', background: '#111111' }}
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl">{product.emoji}</span>
            <h2 className="font-display font-bold text-lg" style={{ color: '#F5F0E8' }}>
              {product.name}
            </h2>
          </div>
          {onAddAndGoToCart && (
            <button
              onClick={handleAddAndGoToCart}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors active:scale-95 whitespace-nowrap"
              style={{
                background: 'rgba(201,162,39,0.2)',
                color: '#C9A227',
                border: '1px solid rgba(201,162,39,0.4)',
              }}
            >
              🛒 Ir ao Carrinho
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: '#8A7A5A' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-6">
          {/* Descrição */}
          <div>
            <p className="text-sm" style={{ color: '#8A7A5A' }}>
              {product.description}
            </p>
          </div>

          {/* Remover Ingredientes */}
          {product.ingredients && product.ingredients.length > 0 && product.hasRemovableIngredients !== false && (
            <div>
              <h3 className="font-display font-semibold mb-3" style={{ color: '#F5F0E8' }}>
                Remover Ingredientes
              </h3>
              <div className="space-y-2">
                {product.ingredients.map(ingredient => (
                  <label
                    key={ingredient}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                    style={{
                      background: removedIngredients.includes(ingredient)
                        ? 'rgba(201,162,39,0.1)'
                        : '#0D1A14',
                      border: `1px solid ${
                        removedIngredients.includes(ingredient)
                          ? 'rgba(201,162,39,0.3)'
                          : 'rgba(201,162,39,0.15)'
                      }`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={removedIngredients.includes(ingredient)}
                      onChange={() => toggleIngredient(ingredient)}
                      className="w-4 h-4 rounded"
                      style={{
                        accentColor: '#C9A227',
                      }}
                    />
                    <span style={{ color: '#F5F0E8' }}>{ingredient}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar Extras */}
          {product.availableExtras && product.availableExtras.length > 0 && (
            <div>
              <h3 className="font-display font-semibold mb-3" style={{ color: '#F5F0E8' }}>
                Adicionar Extras
              </h3>
              <div className="space-y-2">
                {product.availableExtras.map(extra => {
                  const isSelected = addedExtras.find(e => e.id === extra.id);
                  return (
                    <label
                      key={extra.id}
                      className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors"
                      style={{
                        background: isSelected ? 'rgba(201,162,39,0.1)' : '#0D1A14',
                        border: `1px solid ${
                          isSelected ? 'rgba(201,162,39,0.3)' : 'rgba(201,162,39,0.15)'
                        }`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => toggleExtra(extra)}
                          className="w-4 h-4 rounded"
                          style={{
                            accentColor: '#C9A227',
                          }}
                        />
                        <span style={{ color: '#F5F0E8' }}>{extra.name}</span>
                      </div>
                      <span style={{ color: '#C9A227' }} className="font-semibold">
                        +R$ {extra.price.toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <h3 className="font-display font-semibold mb-3" style={{ color: '#F5F0E8' }}>
              Observações (Opcional)
            </h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={200}
              placeholder="Ex: Carne bem passada, pouco molho..."
              className="w-full p-3 rounded-lg text-sm resize-none"
              style={{
                background: '#0D1A14',
                border: '1px solid rgba(201,162,39,0.15)',
                color: '#F5F0E8',
              }}
              rows={3}
            />
            <p className="text-xs mt-2" style={{ color: '#4A3A2A' }}>
              {notes.length}/200 caracteres
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="sticky bottom-0 p-4 md:p-6 border-t flex gap-3 flex-col md:flex-row"
          style={{ borderColor: 'rgba(201,162,39,0.15)', background: '#111111' }}
        >
          <button
            onClick={handleClose}
            className="flex-1 py-3 rounded-lg font-semibold transition-colors"
            style={{
              background: '#0D1A14',
              color: '#8A7A5A',
              border: '1px solid rgba(201,162,39,0.15)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 rounded-lg font-semibold transition-colors active:scale-95"
            style={{
              background: '#C9A227',
              color: '#0A0A0A',
            }}
          >
            Adicionar - R$ {totalPrice.toFixed(2)}
          </button>
          {onAddAndGoToCart && (
            <button
              onClick={handleAddAndGoToCart}
              className="flex-1 py-3 rounded-lg font-semibold transition-colors active:scale-95"
              style={{
                background: 'rgba(201,162,39,0.2)',
                color: '#C9A227',
                border: '1px solid rgba(201,162,39,0.4)',
              }}
            >
              Ir ao Carrinho
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
