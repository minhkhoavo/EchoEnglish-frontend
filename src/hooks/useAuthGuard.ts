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

// Use in pages/components that should be accessible only to admin users
// For example: admin dashboard, admin management pages, etc.
export function useAdminGuard() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      navigate('/login');
    } else if (user && !isAdmin) {
      // Authenticated but not admin, redirect to user dashboard
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, isAdmin, navigate]);

  // Return loading true if we don't have user data yet or if not admin
  // This prevents API calls before redirect happens
  const isLoading = !user || !isAdmin;

  return { isAuthenticated, isAdmin, isLoading };
}
