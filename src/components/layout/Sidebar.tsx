// src/components/layout/Sidebar.tsx
import { cn } from '@/lib/utils';
import type { ComponentType, SVGProps } from 'react';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type NavItem = {
  id: string;
  name: string;
  icon: IconType;
  description: string;
};

type ActiveTab = 'dashboard' | 'content' | 'flashcards' | 'analytics';

interface SidebarProps {
  sidebarOpen: boolean;
  activeTab: ActiveTab;
  navigation: NavItem[];
  onTabClick: (tabId: ActiveTab) => void;
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
        'w-72 bg-card border-r border-border min-h-[calc(100vh-4rem)] transition-all lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'fixed lg:relative lg:block z-40'
      )}
    >
      <nav className="p-4 space-y-2">
        <div className="mb-6">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Study Tools
          </h2>
        </div>
        {navigation.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabClick(item.id as ActiveTab)}
            className={cn(
              'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all',
              activeTab === item.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            <item.icon className="h-5 w-5" />
            <div className="flex-1">
              <span className="font-medium block">{item.name}</span>
              <span className="text-xs opacity-75">{item.description}</span>
            </div>
          </button>
        ))}
      </nav>
    </aside>
  );
};
