import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import MenuImageUpload from './MenuImageUpload';

interface EditMenuItemImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: number;
  itemName: string;
  currentImageUrl?: string;
  onImageUpdated: () => void;
}

export default function EditMenuItemImageModal({
  isOpen,
  onClose,
  itemId,
  itemName,
  currentImageUrl,
  onImageUpdated,
}: EditMenuItemImageModalProps) {
  const [newImageUrl, setNewImageUrl] = useState<string | null>(currentImageUrl || null);
  const updateItem = trpc.menu.update.useMutation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveImage = async () => {
    if (!newImageUrl) {
      toast.error('Selecione uma imagem');
      return;
    }

    setIsLoading(true);
    try {
      await updateItem.mutateAsync({
        id: itemId,
        imageUrl: newImageUrl,
      });
      toast.success('Imagem atualizada com sucesso!');
      onImageUpdated();
      onClose();
    } catch (error) {
      toast.error('Erro ao atualizar imagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!confirm('Tem certeza que deseja remover a imagem?')) {
      return;
    }

    setIsLoading(true);
    try {
      await updateItem.mutateAsync({
        id: itemId,
        imageUrl: '',
      });
      toast.success('Imagem removida com sucesso!');
      setNewImageUrl(null);
      onImageUpdated();
      onClose();
    } catch (error) {
      toast.error('Erro ao remover imagem');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg p-6 w-full max-w-md"
        style={{ background: '#0D1A14', border: '1px solid rgba(201,162,39,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold" style={{ color: '#F5F0E8' }}>
            Editar Imagem
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 hover:opacity-80 transition-opacity"
            style={{ color: '#8A7A5A' }}
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-sm mb-4" style={{ color: '#8A7A5A' }}>
          {itemName}
        </p>

        {/* Current Image Preview */}
        {currentImageUrl && (
          <div className="mb-4">
            <p className="text-xs font-medium mb-2" style={{ color: '#C9A227' }}>
              Imagem Atual:
            </p>
            <img
              src={currentImageUrl}
              alt="Current"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Image Upload */}
        <div className="mb-4">
          <MenuImageUpload
            onImageUploaded={(url) => setNewImageUrl(url)}
            currentImage={newImageUrl || undefined}
            itemName={itemName}
          />
        </div>

        {/* New Image Preview */}
        {newImageUrl && newImageUrl !== currentImageUrl && (
          <div className="mb-4">
            <p className="text-xs font-medium mb-2" style={{ color: '#C9A227' }}>
              Nova Imagem:
            </p>
            <img
              src={newImageUrl}
              alt="New"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveImage}
            disabled={isLoading || !newImageUrl}
            className="flex-1 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: '#C9A227',
              color: '#0D1A14',
              opacity: isLoading || !newImageUrl ? 0.5 : 1,
            }}
          >
            {isLoading ? 'Salvando...' : 'Salvar Imagem'}
          </button>

          {currentImageUrl && (
            <button
              onClick={handleRemoveImage}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg font-semibold transition-all"
              style={{
                background: 'rgba(244, 67, 54, 0.2)',
                color: '#F44336',
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              <Trash2 size={18} />
            </button>
          )}

          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2 rounded-lg font-semibold transition-all"
            style={{
              background: 'rgba(201,162,39,0.1)',
              color: '#C9A227',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
