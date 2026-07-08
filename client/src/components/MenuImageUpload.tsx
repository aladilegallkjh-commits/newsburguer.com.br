import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface MenuImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  itemName?: string;
}

export default function MenuImageUpload({ onImageUploaded, currentImage, itemName }: MenuImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.upload.menuItemImage.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande (máximo 5MB)');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const result = await uploadMutation.mutateAsync({
        file: Buffer.from(buffer),
        filename: file.name,
        contentType: file.type,
      });

      onImageUploaded(result.url);
      toast.success('Imagem enviada com sucesso!');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Erro ao enviar imagem');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium" style={{ color: '#C9A227' }}>
        Imagem do Item {itemName && `(${itemName})`}
      </label>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={handleRemove}
            disabled={isUploading}
            className="absolute top-2 right-2 p-2 rounded-lg hover:bg-opacity-80 transition-all"
            style={{ background: 'rgba(244, 67, 54, 0.9)', color: '#fff' }}
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:opacity-80 transition-opacity"
          style={{ borderColor: 'rgba(201,162,39,0.3)', background: 'rgba(201,162,39,0.05)' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon size={32} className="mx-auto mb-2" style={{ color: '#C9A227' }} />
          <p className="text-sm font-medium" style={{ color: '#F5F0E8' }}>
            Clique para enviar uma imagem
          </p>
          <p className="text-xs mt-1" style={{ color: '#8A7A5A' }}>
            PNG, JPG ou GIF (máximo 5MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading}
        className="hidden"
      />

      {isUploading && (
        <div className="flex items-center justify-center gap-2" style={{ color: '#C9A227' }}>
          <div className="animate-spin">
            <Upload size={16} />
          </div>
          <span className="text-sm">Enviando imagem...</span>
        </div>
      )}
    </div>
  );
}
