import { useState } from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

const LOGO_URL = '/logo.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const loginMutation = trpc.adminAuth.login.useMutation();
  const registerMutation = trpc.adminAuth.register.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Preencha email e senha');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      if (result.success) {
        localStorage.setItem('adminEmail', result.admin.email);
        localStorage.setItem('adminToken', 'token-' + Date.now());
        toast.success('Login realizado com sucesso!');
        window.location.reload();
      }
    } catch (error: any) {
      setError(error.message || 'Email ou senha incorretos');
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerName || !registerEmail || !registerPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (registerPassword.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      await registerMutation.mutateAsync({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
      });
      toast.success('Conta criada! Faça login para continuar');
      setShowRegister(false);
      setEmail(registerEmail);
      setPassword(registerPassword);
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
    } catch (error: any) {
      setError(error.message || 'Erro ao criar conta');
      toast.error('Erro ao criar conta');
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
        <form onSubmit={showRegister ? handleRegister : handleLogin} className="space-y-4">
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

          {!showRegister ? (
            <>
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
            </>
          ) : (
            <>
              <div>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#F5F0E8' }}
                >
                  Nome
                </label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="seu nome"
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
                  Email
                </label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
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
                  Senha (mín. 6 caracteres)
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="sua senha"
                  className="w-full px-4 py-3 rounded-sm text-sm transition-all duration-200"
                  style={{
                    background: '#0D1A14',
                    color: '#F5F0E8',
                    border: '1px solid rgba(201,162,39,0.2)',
                  }}
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            onClick={showRegister ? handleRegister : handleLogin}
            disabled={isLoading}
            className="w-full py-3 rounded-sm font-semibold text-sm transition-all duration-200 active:scale-95"
            style={{
              background: '#C9A227',
              color: '#0A0A0A',
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (showRegister ? 'Criando conta...' : 'Entrando...') : (showRegister ? 'Criar Conta' : 'Entrar')}
          </button>

          <div className="text-center pt-4" style={{ borderTop: '1px solid rgba(201,162,39,0.1)' }}>
            <p className="text-sm" style={{ color: '#8A7A5A' }}>
              {showRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setShowRegister(!showRegister);
                  setEmail('');
                  setPassword('');
                  setRegisterName('');
                  setRegisterEmail('');
                  setRegisterPassword('');
                  setError('');
                }}
                className="font-semibold transition-colors hover:opacity-80"
                style={{ color: '#C9A227' }}
              >
                {showRegister ? 'Fazer login' : 'Criar conta'}
              </button>
            </p>
          </div>
        </form>


      </div>
    </div>
  );
}
