import { AdminTestEdit } from '@/features/admin-test';
import { useAdminGuard } from '@/hooks/useAuthGuard';

const AdminTestEditPage = () => {
  useAdminGuard();
  return <AdminTestEdit />;
};

export default AdminTestEditPage;
