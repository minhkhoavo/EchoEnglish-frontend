import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';
import { useGuestGuard } from '@/hooks/useAuthGuard';

export default function ForgotPasswordPage() {
  useGuestGuard();
  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-100 flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
