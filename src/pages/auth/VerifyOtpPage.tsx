import VerifyOtpForm from '@/features/auth/components/VerifyOtpForm';
import { useGuestGuard } from '@/hooks/useGuestGuard';

export default function VerifyOtpPage() {
  useGuestGuard();
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-100 flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <VerifyOtpForm />
      </div>
    </div>
  );
}
