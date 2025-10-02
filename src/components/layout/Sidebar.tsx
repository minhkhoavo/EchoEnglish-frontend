// src/components/layout/Sidebar.tsx
import { cn } from '@/lib/utils';
import type { ComponentType, SVGProps } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type NavItem = {
  id: string;
  name: string;
  icon: IconType;
  description: string;
};

type ActiveTab =
  | 'dashboard'
  | 'content'
  | 'resources'
  | 'flashcards'
  | 'analytics'
  | 'tests';

interface SidebarProps {
  sidebarOpen: boolean;
  activeTab: ActiveTab;
  navigation: NavItem[];
  onTabClick: (tabId: string) => void;
}

export const Sidebar = ({
  sidebarOpen,
  activeTab,
  navigation,
  onTabClick,
}: SidebarProps) => {
  return (
    <aside
      className={cn(
        'bg-card border-r border-border min-h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out lg:translate-x-0 group',
        // Desktop: always show, hover to expand
        'hidden lg:block lg:w-16 lg:hover:w-72',
        // Mobile: slide in/out based on sidebarOpen
        sidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full',
        'fixed lg:relative z-40'
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
            Study Tools
          </h2>
        </div>

        {navigation.map((item) => (
          <div key={item.id} className="relative group/item">
            <button
              onClick={() => onTabClick(item.id)}
              className={cn(
                'w-full flex items-center text-left transition-all duration-200 rounded-lg',
                // Desktop: collapsed by default, expand on sidebar hover
                'lg:px-2 lg:py-3 lg:justify-center lg:group-hover:space-x-3 lg:group-hover:px-4 lg:group-hover:py-3 lg:group-hover:justify-start',
                // Mobile: always expanded
                'space-x-3 px-4 py-3 lg:space-x-0',
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />

              {/* Text content - hidden on desktop collapsed, shown on hover and mobile */}
              <div
                className={cn(
                  'flex-1 transition-all duration-300',
                  'block lg:hidden lg:group-hover:block'
                )}
              >
                <span className="font-medium block">{item.name}</span>
                <span className="text-xs opacity-75">{item.description}</span>
              </div>
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
};
