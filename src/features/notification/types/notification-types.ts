export const mapType = (t: string): NotificationType => {
  const normalized = (t || '').toLowerCase();
  if (
    ['info', 'promotion', 'payment', 'warning', 'system'].includes(normalized)
  ) {
    return normalized as NotificationType;
  }
  return 'info';
};
export const NotificationType = {
  INFO: 'info',
  PROMOTION: 'promotion',
  PAYMENT: 'payment',
  WARNING: 'warning',
  SYSTEM: 'system',
} as const;

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
