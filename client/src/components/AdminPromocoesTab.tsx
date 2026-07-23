import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Power, Plus, Edit2, Trash2 } from 'lucide-react';
import MenuImageUpload from '@/components/MenuImageUpload';

export default function AdminPromocoesTab() {
  const { data: promotions = [], isLoading, refetch } = trpc.promotions.getAll.useQuery();
  
  const createPromotion = trpc.promotions.create.useMutation();
  const updatePromotion = trpc.promotions.update.useMutation();
  const deletePromotion = trpc.promotions.delete.useMutation();
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'combo' as 'percentage' | 'fixed' | 'combo',
    discountValue: 0,
    imageUrl: '',
    isActive: 1,
  });

  const handleSave = async () => {
    if (!formData.title || formData.discountValue <= 0) {
      toast.error('Preencha o título e o valor da promoção.');
      return;
    }
    
    try {
      if (editingItem) {
        await updatePromotion.mutateAsync({ id: editingItem.id, ...formData });
        toast.success('Promoção atualizada com sucesso!');
      } else {
        await createPromotion.mutateAsync(formData as any);
        toast.success('Promoção criada com sucesso!');
      }
      
      refetch();
      setEditingItem(null);
      setAddingNew(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar promoção.');
    }
  };

  const handleToggle = async (promo: any) => {
    const newActive = promo.isActive === 1 ? 0 : 1;
    try {
      await updatePromotion.mutateAsync({ id: promo.id, isActive: newActive });
      toast.success(newActive === 1 ? 'Promoção ativada!' : 'Promoção desativada!');
      refetch();
    } catch (e) {
      toast.error('Erro ao alterar status.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover esta promoção?')) return;
    try {
      await deletePromotion.mutateAsync({ id });
      toast.success('Promoção removida!');
      refetch();
    } catch (e) {
      toast.error('Erro ao remover promoção.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'combo',
      discountValue: 0,
      imageUrl: '',
      isActive: 1,
    });
  };

  const openEdit = (promo: any) => {
    setEditingItem(promo);
    setFormData({
      title: promo.title,
      description: promo.description || '',
      type: promo.type,
      discountValue: promo.discountValue,
      imageUrl: promo.imageUrl || '',
      isActive: promo.isActive,
    });
    setAddingNew(false);
  };

  const inputStyle = { background: '#0A0A0A', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.25)', borderRadius: 8, padding: '8px 12px', width: '100%' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#F5F0E8' }}>🎉 Promoções</h2>
          <p className="text-sm mt-1" style={{ color: '#8A7A5A' }}>Crie e gerencie as promoções que aparecem no banner rotativo do site.</p>
        </div>
        {!addingNew && !editingItem && (
          <button
            onClick={() => { resetForm(); setAddingNew(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all hover:opacity-90"
            style={{ background: '#C9A227', color: '#0A0A0A' }}
          >
            <Plus size={18} /> Nova Promoção
          </button>
        )}
      </div>

      {/* Formulário (Criar / Editar) */}
      {(addingNew || editingItem) && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'rgba(10,16,13,0.9)', border: '1px solid rgba(201,162,39,0.4)' }}>
          <h3 className="font-bold text-lg" style={{ color: '#C9A227' }}>
            {editingItem ? 'Editar Promoção' : 'Nova Promoção'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs text-[#8A7A5A] mb-1 block">Título Principal da Oferta (Ex: Combo Explosão + Fritas)</label>
              <input style={inputStyle} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Combo Explosão Burger" />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="text-xs text-[#8A7A5A] mb-1 block">Descrição Adicional (O que vem incluso?)</label>
              <textarea style={{...inputStyle, minHeight: '80px'}} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Dois hambúrgueres artesanais, queijo cheddar, bacon e fritas." />
            </div>

            <div>
              <label className="text-xs text-[#8A7A5A] mb-1 block">Tipo de Promoção</label>
              <select style={inputStyle} value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                <option value="combo">Preço Fixo (Combo)</option>
                <option value="fixed">Desconto Fixo (R$)</option>
                <option value="percentage">Desconto em Porcentagem (%)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#8A7A5A] mb-1 block">Valor / Preço Final Promocional</label>
              <input type="number" step="0.50" style={inputStyle} value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: parseFloat(e.target.value) || 0})} />
            </div>

            <div className="col-span-1 md:col-span-2 mt-2">
              <label className="text-xs text-[#8A7A5A] mb-2 block">Imagem da Promoção</label>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                  <MenuImageUpload 
                    currentImage={formData.imageUrl} 
                    onImageUploaded={(url) => setFormData({...formData, imageUrl: url})} 
                  />
                  <p className="text-xs mt-3 text-[#C9A227]">Ou cole a URL diretamente:</p>
                  <input style={{...inputStyle, marginTop: 4}} value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." />
                </div>
                {formData.imageUrl && (
                  <div className="w-full md:w-64 h-32 rounded-xl overflow-hidden border border-[#C9A227]/30 flex-shrink-0">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-[#C9A227]/20 mt-4">
            <button onClick={handleSave} disabled={createPromotion.isPending || updatePromotion.isPending} className="px-5 py-2.5 rounded-lg font-semibold" style={{ background: '#C9A227', color: '#0A0A0A' }}>
              {createPromotion.isPending || updatePromotion.isPending ? 'Salvando...' : '✓ Salvar Promoção'}
            </button>
            <button onClick={() => { setAddingNew(false); setEditingItem(null); }} className="px-5 py-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: '#8A7A5A' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Listagem */}
      {!addingNew && !editingItem && (
        isLoading ? (
          <p style={{ color: '#8A7A5A' }}>Carregando promoções...</p>
        ) : promotions.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-dashed border-[#C9A227]/30" style={{ background: 'rgba(10,16,13,0.5)' }}>
            <p style={{ color: '#8A7A5A' }}>Nenhuma promoção cadastrada ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.map((promo: any) => (
              <div 
                key={promo.id}
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{ 
                  background: 'rgba(10,16,13,0.85)', 
                  border: `1px solid ${promo.isActive === 1 ? 'rgba(201,162,39,0.3)' : 'rgba(255,60,60,0.2)'}`,
                  opacity: promo.isActive === 1 ? 1 : 0.65
                }}
              >
                <div className="h-36 relative bg-[#000]">
                  {promo.imageUrl ? (
                    <img src={promo.imageUrl} alt={promo.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#C9A227]/30 font-bold text-2xl bg-[#0A0A0A]">
                      SEM IMAGEM
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                     <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: promo.isActive === 1 ? 'rgba(74,222,128,0.2)' : 'rgba(255,60,60,0.2)', color: promo.isActive === 1 ? '#4ade80' : '#FF6B6B' }}>
                        {promo.isActive === 1 ? 'ATIVA' : 'INATIVA'}
                     </span>
                  </div>
                  <div className="absolute bottom-2 right-2 text-[12px] font-bold px-2 py-1 rounded-lg shadow-lg" style={{ background: '#8A1A1A', color: '#F5F0E8' }}>
                    R$ {parseFloat(promo.discountValue).toFixed(2)}
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-[#F5F0E8] text-lg leading-tight mb-1">{promo.title}</h4>
                  <p className="text-xs text-[#8A7A5A] line-clamp-2 mb-4 flex-1">{promo.description}</p>
                  
                  <div className="flex gap-2 mt-auto">
                    <button 
                      onClick={() => openEdit(promo)}
                      className="flex-1 py-2 text-xs rounded-lg font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-1"
                      style={{ background: 'rgba(201,162,39,0.15)', color: '#C9A227', border: '1px solid rgba(201,162,39,0.3)' }}
                    >
                      <Edit2 size={14} /> Editar
                    </button>
                    <button
                      onClick={() => handleToggle(promo)}
                      className="w-10 flex items-center justify-center rounded-lg transition-all hover:opacity-90"
                      style={{ background: promo.isActive === 1 ? 'rgba(255,60,60,0.1)' : 'rgba(74,222,128,0.1)', color: promo.isActive === 1 ? '#FF6B6B' : '#4ade80', border: `1px solid ${promo.isActive === 1 ? 'rgba(255,60,60,0.2)' : 'rgba(74,222,128,0.2)'}` }}
                      title={promo.isActive === 1 ? 'Desativar' : 'Ativar'}
                    >
                      <Power size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="w-10 flex items-center justify-center rounded-lg transition-all hover:opacity-90"
                      style={{ background: 'rgba(255,60,60,0.1)', color: '#FF6B6B', border: '1px solid rgba(255,60,60,0.2)' }}
                      title="Excluir Permanentemente"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
