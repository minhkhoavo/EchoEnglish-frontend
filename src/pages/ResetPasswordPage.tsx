import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-100 flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
