export const NotificationType = {
  INFO: 'info',
  PROMOTION: 'promotion',
  PAYMENT: 'payment',
  WARNING: 'warning',
  SYSTEM: 'system',
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export interface NotificationFormData {
  title: string;
  body?: string;
  deepLink?: string;
  type: NotificationType;
  userIds: string[];
}
