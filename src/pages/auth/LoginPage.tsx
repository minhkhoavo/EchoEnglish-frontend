import LoginForm from '@/features/auth/components/LoginForm';
import { useGuestGuard } from '@/hooks/useAuthGuard';

export default function LoginPage() {
  useGuestGuard();
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
