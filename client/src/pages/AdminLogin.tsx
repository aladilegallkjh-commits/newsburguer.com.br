import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Lock, AlertCircle } from 'lucide-react';

const LOGO_URL = '/logo.png';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.adminAuth.login.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      
      if (result && result.success) {
        localStorage.setItem('adminEmail', result.admin.email);
        localStorage.setItem('adminName', result.admin.name);
        
        // Em vez de recarregar a pgina interia, fora atualizao do status logado
        localStorage.setItem('adminToken', 'logged_in_' + Date.now());
        
        toast.success('Login realizado com sucesso!');
        setLocation('/admin');
        window.location.reload(); // Forar reload completo para atualizar as rotas se necessrio
      } else {
        setError('Login invlido');
      }
    } catch (error: any) {
      setError(error.message || 'Email ou senha incorretos');
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0A0A0A' }}
    >
      <div
        className="w-full max-w-md rounded-lg p-8 shadow-2xl"
        style={{ background: '#111111', border: '1px solid rgba(201,162,39,0.2)' }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={LOGO_URL} alt="New S'Burguer" className="w-16 h-16 object-contain" />
        </div>

        {/* Title */}
        <h1
          className="font-display text-2xl font-bold text-center mb-2"
          style={{ color: '#F5F0E8' }}
        >
          Painel Admin
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: '#8A7A5A' }}>
          Acesso restrito para administradores
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Error message */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-sm text-sm"
              style={{ background: 'rgba(255, 107, 107, 0.1)', color: '#FF6B6B', border: '1px solid rgba(255, 107, 107, 0.3)' }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: '#F5F0E8' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-4 py-3 rounded-sm text-sm transition-all duration-200"
              style={{
                background: '#0D1A14',
                color: '#F5F0E8',
                border: '1px solid rgba(201,162,39,0.2)',
              }}
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: '#F5F0E8' }}
            >
              Senha
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: '#C9A227' }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="sua senha"
                className="w-full pl-10 pr-4 py-3 rounded-sm text-sm transition-all duration-200"
                style={{
                  background: '#0D1A14',
                  color: '#F5F0E8',
                  border: '1px solid rgba(201,162,39,0.2)',
                }}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 rounded-sm font-semibold text-sm transition-all duration-200 active:scale-95"
            style={{
              background: '#C9A227',
              color: '#0A0A0A',
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
