import {
  Info,
  Gift,
  CreditCard,
  AlertTriangle,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { NotificationType } from '../types/notification-types';

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
}

const iconMap: Record<NotificationType, LucideIcon> = {
  [NotificationType.INFO]: Info,
  [NotificationType.PROMOTION]: Gift,
  [NotificationType.PAYMENT]: CreditCard,
  [NotificationType.WARNING]: AlertTriangle,
  [NotificationType.SYSTEM]: Settings,
};

export const NotificationIcon = ({
  type,
  className,
}: NotificationIconProps) => {
  const Icon = iconMap[type];
  return <Icon className={className} />;
};
