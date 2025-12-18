import { AdminTestDetail } from '@/features/admin-test';
import { useAdminGuard } from '@/hooks/useAuthGuard';

const AdminTestDetailPage = () => {
  useAdminGuard();
  return <AdminTestDetail />;
};

export default AdminTestDetailPage;
