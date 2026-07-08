import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
  isAuthenticated: boolean;
  adminPassword: string;
  login: (password: string) => boolean;
  logout: () => void;
  setAdminPassword: (password: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const DEFAULT_PASSWORD = 'admin123'; // Padrão - o usuário pode mudar no painel

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState(DEFAULT_PASSWORD);

  // Carregar estado do localStorage ao montar
  useEffect(() => {
    const stored = localStorage.getItem('adminAuth');
    const storedPassword = localStorage.getItem('adminPassword');
    
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
    
    if (storedPassword) {
      setAdminPassword(storedPassword);
    }
  }, []);

  const login = (password: string): boolean => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  const updatePassword = (newPassword: string) => {
    setAdminPassword(newPassword);
    localStorage.setItem('adminPassword', newPassword);
  };

  return (
    <AdminContext.Provider
      value={{
        isAuthenticated,
        adminPassword,
        login,
        logout,
        setAdminPassword: updatePassword,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin deve ser usado dentro de AdminProvider');
  }
  return context;
}
