import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface MenuImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  itemName?: string;
}

// Comprime a imagem no browser antes de salvar (evita payloads grandes)
function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MenuImageUpload({ onImageUploaded, currentImage, itemName }: MenuImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Imagem muito grande (máximo 10MB)');
      return;
    }

    setIsUploading(true);
    try {
      // Comprime no browser e retorna dataUrl (~100-200kb)
      const compressed = await compressImage(file);
      setPreview(compressed);
      onImageUploaded(compressed);
      toast.success('Imagem pronta para salvar!');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Erro ao processar imagem');
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
            PNG, JPG ou GIF (máximo 10MB) — comprimido automaticamente
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
          <span className="text-sm">Processando imagem...</span>
        </div>
      )}
    </div>
  );
}
