import RegisterForm from '@/features/auth/components/RegisterForm';
import { useGuestGuard } from '@/hooks/useAuthGuard';

export default function RegisterPage() {
  useGuestGuard();
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <RegisterForm />
      </div>
    </div>
  );
}
