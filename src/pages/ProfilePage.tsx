import ProfileForm from '@/features/auth/components/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <ProfileForm />
      </div>
    </div>
  );
}
