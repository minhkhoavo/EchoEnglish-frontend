import RegisterForm from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
