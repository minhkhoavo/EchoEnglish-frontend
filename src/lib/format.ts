/**
 * Format amount to Vietnamese currency
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "1.000.000 ₫")
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format date to Vietnamese format (dd/mm/yyyy)
 * @param dateString - ISO date string
 * @returns Formatted date string (e.g., "28/11/2025")
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';

    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return 'Unknown';
  }
};

/**
 * Format date with seconds (dd/mm/yyyy HH:mm:ss)
 * @param dateString - ISO date string
 * @returns Formatted date string with seconds (e.g., "28/11/2025 14:30:59")
 */
export const formatDateWithSeconds = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';

    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch {
    return 'Unknown';
  }
};
