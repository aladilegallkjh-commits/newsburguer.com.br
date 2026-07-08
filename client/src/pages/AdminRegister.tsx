import { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

export default function AdminRegister() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const registerMutation = trpc.auth.registerAdmin.useMutation({
    onSuccess: () => {
      toast.success('Admin registrado com sucesso! Faça login agora.', {
        duration: 3000,
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
      setLocation('/admin/login');
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`, {
        duration: 3000,
        style: { background: '#111111', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.3)' },
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await registerMutation.mutateAsync({
        email,
        password,
        name,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A0A0A' }}>
      <div
        className="w-full max-w-md p-8 rounded-sm"
        style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
      >
        <h1 className="font-display text-3xl font-black mb-2" style={{ color: '#F5F0E8' }}>
          Registrar Admin
        </h1>
        <p className="text-sm mb-6" style={{ color: '#8A7A5A' }}>
          Crie uma nova conta de administrador
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#C9A227' }}>
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
              className="w-full px-4 py-2 rounded-sm"
              style={{ background: '#1a1a1a', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#C9A227' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@newsburguer.com"
              required
              className="w-full px-4 py-2 rounded-sm"
              style={{ background: '#1a1a1a', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#C9A227' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="w-full px-4 py-2 rounded-sm"
              style={{ background: '#1a1a1a', color: '#F5F0E8', border: '1px solid rgba(201,162,39,0.2)' }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || registerMutation.isPending}
            className="w-full py-3 rounded-sm font-bold transition-all mt-6"
            style={{
              background: '#C9A227',
              color: '#0A0A0A',
              opacity: loading || registerMutation.isPending ? 0.6 : 1,
            }}
          >
            {loading || registerMutation.isPending ? 'Registrando...' : 'Registrar'}
          </button>

          {/* Login Link */}
          <p className="text-center text-sm" style={{ color: '#8A7A5A' }}>
            Já tem conta?{' '}
            <button
              type="button"
              onClick={() => setLocation('/admin/login')}
              className="font-bold"
              style={{ color: '#C9A227' }}
            >
              Faça login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
