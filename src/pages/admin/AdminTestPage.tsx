import { AdminTestList } from '@/features/admin-test';
import { useAdminGuard } from '@/hooks/useAuthGuard';

const AdminTestPage = () => {
  useAdminGuard();
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminTestList />
    </div>
  );
};

export default AdminTestPage;
