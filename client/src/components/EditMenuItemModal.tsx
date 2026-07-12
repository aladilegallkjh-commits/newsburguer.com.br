import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

export default function EditMenuItemModal({
  isOpen,
  onClose,
  item,
  onUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  onUpdated: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'hamburgers',
    price: 0,
    ingredients: '',
  });

  const updateItem = trpc.menu.update.useMutation();

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        category: item.category || 'hamburgers',
        price: item.price || 0,
        ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : '',
      });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = async () => {
    if (!formData.name || formData.price <= 0) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const ingredientsArray = formData.ingredients
        .split(',')
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      await updateItem.mutateAsync({
        id: item.id,
        name: formData.name,
        description: formData.description,
        category: formData.category as any,
        price: formData.price,
        ingredients: ingredientsArray,
      });

      toast.success('Item atualizado com sucesso!');
      onUpdated();
      onClose();
    } catch (error) {
      toast.error('Erro ao atualizar item');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg rounded-2xl p-6 relative"
        style={{ background: 'rgba(10,16,13,0.95)', border: '1px solid rgba(201,162,39,0.3)', boxShadow: '0 0 40px rgba(201,162,39,0.2)' }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition-colors text-[#8A7A5A] hover:text-[#C9A227]"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6" style={{ color: '#F5F0E8' }}>Editar Item: {item.name}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: '#8A7A5A' }}>Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#8A7A5A' }}>Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm h-20 resize-none focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1" style={{ color: '#8A7A5A' }}>Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
              >
                <option value="hamburgers">Hambúrgueres</option>
                <option value="hotdogs">Hot Dogs</option>
                <option value="combos">Combos</option>
                <option value="drinks">Bebidas</option>
                <option value="extras">Extras</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: '#8A7A5A' }}>Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
                style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: '#8A7A5A' }}>Ingredientes (separados por vírgula)</label>
            <textarea
              value={formData.ingredients}
              onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
              className="w-full px-3 py-2 rounded text-sm h-20 resize-none focus:outline-none focus:ring-1 focus:ring-[#C9A227]"
              placeholder="Ex: Pão brioche, Hambúrguer 180g, Queijo cheddar, Bacon"
              style={{ background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={updateItem.isPending}
            className="w-full mt-4 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2"
            style={{ 
              background: 'linear-gradient(90deg, #C9A227 0%, #D4B242 100%)',
              color: '#0A100D',
              boxShadow: '0 4px 15px rgba(201,162,39,0.3)'
            }}
          >
            {updateItem.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
