import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Bell, Library, CreditCard, Tag } from 'lucide-react';

export type AdminNavItem = {
  path: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const adminNavigationItems: AdminNavItem[] = [
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Analytics',
  },
  {
    path: '/admin/notification',
    name: 'Notifications',
    icon: Bell,
    description: 'Push Notifications',
  },
  {
    path: '/admin/resources',
    name: 'Resources',
    icon: Library,
    description: 'Content Management',
  },
  {
    path: '/admin/payments',
    name: 'Payments',
    icon: CreditCard,
    description: 'Transaction Management',
  },
  {
    path: '/admin/promotions',
    name: 'Promotions',
    icon: Tag,
    description: 'Promo Code Management',
  },
];

export const AdminSidebar = ({
  sidebarOpen,
  setSidebarOpen,
}: AdminSidebarProps) => {
  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-card border-r border-border transition-all duration-300 ease-in-out lg:translate-x-0 group',
          // Desktop: always show, hover to expand
          'hidden lg:block lg:w-16 lg:hover:w-72',
          // Mobile: slide in/out based on sidebarOpen
          sidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full',
          'fixed lg:sticky lg:top-16 h-[calc(100vh-4rem)] z-40'
        )}
      >
        <nav className="p-4 space-y-2 lg:group-hover:px-4 lg:px-2">
          {/* Header - hidden on collapsed, shown on hover */}
          <div
            className={cn(
              'mb-6 transition-all duration-300',
              'lg:opacity-0 lg:group-hover:opacity-100',
              'block lg:hidden lg:group-hover:block'
            )}
          >
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Admin Panel
            </h2>
          </div>

          {adminNavigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  'w-full flex items-center text-left transition-all duration-200 rounded-lg',
                  // Desktop: collapsed by default, expand on sidebar hover
                  'lg:px-2 lg:py-3 lg:justify-center lg:group-hover:space-x-3 lg:group-hover:px-4 lg:group-hover:py-3 lg:group-hover:justify-start',
                  // Mobile: always expanded
                  'space-x-3 px-4 py-1 lg:space-x-0',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />

              {/* Text content - hidden on desktop collapsed, shown on hover and mobile */}
              <div
                className={cn(
                  'flex-1 transition-all duration-300',
                  'block lg:hidden lg:group-hover:block'
                )}
              >
                <span className="font-medium block leading-none">
                  {item.name}
                </span>
                <span className="text-xs opacity-75 leading-none">
                  {item.description}
                </span>
              </div>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};
