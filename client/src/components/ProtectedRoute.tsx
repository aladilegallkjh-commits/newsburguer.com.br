import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAdmin } from '@/contexts/AdminContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAdmin();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated && location !== '/admin/login') {
      setLocation('/admin/login');
    }
  }, [isAuthenticated, location, setLocation]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
