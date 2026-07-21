import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const LOGO_URL = '/logo.png';

interface AdminLoginProps {
  onLogin: (user: any) => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const loginMutation = trpc.adminAuth.login.useMutation();
  const registerMutation = trpc.adminAuth.register.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      
      if (result.success) {
        localStorage.setItem('adminEmail', result.admin.email);
        localStorage.setItem('adminToken', 'logged_in_' + Date.now());
        onLogin(result.admin);
        toast.success('Login realizado com sucesso!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.email || !registerData.password || !registerData.name) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await registerMutation.mutateAsync(registerData);
      toast.success('Conta criada! Faça login para continuar');
      setShowRegister(false);
      setRegisterData({ email: '', password: '', name: '' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0A0A0A' }}>
      <div
        className="w-full max-w-md rounded-lg p-8 border"
        style={{ background: '#0D1A14', borderColor: 'rgba(201,162,39,0.2)' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="New S'Burguer" className="w-20 h-20 mx-auto mb-4 rounded-lg" />
          <h1 className="text-3xl font-bold" style={{ color: '#C9A227' }}>
            New S'Burguer
          </h1>
          <p className="text-sm mt-2" style={{ color: '#8A7A5A' }}>
            Painel de Administração
          </p>
        </div>

        {!showRegister ? (
          // Login Form
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#C9A227' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@newsburguer.com"
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  background: '#111111',
                  color: '#F5F0E8',
                  border: '1px solid rgba(201,162,39,0.2)',
                }}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#C9A227' }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  background: '#111111',
                  color: '#F5F0E8',
                  border: '1px solid rgba(201,162,39,0.2)',
                }}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-lg font-semibold transition-all"
              style={{
                background: '#C9A227',
                color: '#0D1A14',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="text-center pt-4" style={{ borderTop: '1px solid rgba(201,162,39,0.1)' }}>
              <p className="text-sm" style={{ color: '#8A7A5A' }}>
                Não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="font-semibold transition-colors"
                  style={{ color: '#C9A227' }}
                >
                  Criar conta
                </button>
              </p>
            </div>
          </form>
        ) : (
          // Register Form
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#C9A227' }}>
                Nome
              </label>
              <input
                type="text"
                value={registerData.name}
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                placeholder="Seu nome"
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  background: '#111111',
                  color: '#F5F0E8',
                  border: '1px solid rgba(201,162,39,0.2)',
                }}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#C9A227' }}>
                Email
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                placeholder="admin@newsburguer.com"
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  background: '#111111',
                  color: '#F5F0E8',
                  border: '1px solid rgba(201,162,39,0.2)',
                }}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#C9A227' }}>
                Senha
              </label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg"
                style={{
                  background: '#111111',
                  color: '#F5F0E8',
                  border: '1px solid rgba(201,162,39,0.2)',
                }}
                disabled={isLoading}
              />
              <p className="text-xs mt-1" style={{ color: '#8A7A5A' }}>
                Mínimo 6 caracteres
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-lg font-semibold transition-all"
              style={{
                background: '#C9A227',
                color: '#0D1A14',
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>

            <div className="text-center pt-4" style={{ borderTop: '1px solid rgba(201,162,39,0.1)' }}>
              <p className="text-sm" style={{ color: '#8A7A5A' }}>
                Já tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="font-semibold transition-colors"
                  style={{ color: '#C9A227' }}
                >
                  Fazer login
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Demo Info */}
        <div
          className="mt-6 p-4 rounded-lg text-xs"
          style={{ background: 'rgba(201,162,39,0.1)', color: '#8A7A5A' }}
        >
          <p className="font-semibold mb-2" style={{ color: '#C9A227' }}>
            💡 Primeira vez?
          </p>
          <p>Clique em "Criar conta" para registrar seu email e senha de administrador.</p>
        </div>
      </div>
    </div>
  );
}
