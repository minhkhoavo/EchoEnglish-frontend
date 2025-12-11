import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/core/store/store';

// Use in pages/components that should be accessible only to guests (unauthenticated users)
// For example: login, registration pages, etc.
export function useGuestGuard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      const isAdmin = user.role === 'ADMIN';
      navigate(isAdmin ? '/admin/dashboard' : '/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  return { isAuthenticated };
}
