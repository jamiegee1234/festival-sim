import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Number formatting utilities
export const formatNumber = (num: number, compact = false): string => {
  if (compact) {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(num);
  }
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatCurrency = (amount: number, compact = false): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  });
  return formatter.format(amount);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

// Date and time formatting utilities
export const formatDateTime = (dateString: string): string => {
  return format(new Date(dateString), 'PPpp');
};

export const formatTime = (dateString: string): string => {
  return format(new Date(dateString), 'HH:mm');
};

export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), 'PP');
};

export const formatRelativeTime = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

export const isCurrentTime = (startTime: string, endTime: string): boolean => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  return isAfter(now, start) && isBefore(now, end);
};

// Status and severity utilities
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    // Festival statuses
    'Planning': 'bg-blue-500',
    'Setup': 'bg-yellow-500',
    'Pre-Event': 'bg-orange-500',
    'Active': 'bg-green-500',
    'Intermission': 'bg-yellow-500',
    'Closing': 'bg-orange-500',
    'Cleanup': 'bg-gray-500',
    'Completed': 'bg-green-600',
    'Cancelled': 'bg-red-500',
    'Emergency': 'bg-red-600',
    
    // Incident statuses
    'Open': 'bg-red-500',
    'In Progress': 'bg-yellow-500',
    'Resolved': 'bg-green-500',
    'Escalated': 'bg-purple-500',
    
    // Generic statuses
    'Operational': 'bg-green-500',
    'Maintenance': 'bg-yellow-500',
    'Closed': 'bg-gray-500',
    'Overcrowded': 'bg-red-500',
    'Online': 'bg-green-500',
    'Offline': 'bg-red-500',
    'Warning': 'bg-yellow-500',
  };
  
  return statusColors[status] || 'bg-gray-500';
};

export const getSeverityColor = (severity: string): string => {
  const severityColors: Record<string, string> = {
    'Low': 'text-green-400 bg-green-400/10',
    'Medium': 'text-yellow-400 bg-yellow-400/10',
    'High': 'text-orange-400 bg-orange-400/10',
    'Critical': 'text-red-400 bg-red-400/10',
  };
  
  return severityColors[severity] || 'text-gray-400 bg-gray-400/10';
};

export const getIncidentIcon = (type: string): string => {
  const incidentIcons: Record<string, string> = {
    'Medical': '🏥',
    'Security': '🚔',
    'Technical': '⚡',
    'Weather': '🌧️',
    'Crowd': '👥',
    'Artist': '🎤',
    'Vendor': '🛍️',
    'Fire': '🔥',
    'Safety': '⚠️',
  };
  
  return incidentIcons[type] || '📋';
};

// Data processing utilities
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const calculateGrowthRate = (values: number[]): number => {
  if (values.length < 2) return 0;
  
  const start = values[0];
  const end = values[values.length - 1];
  const periods = values.length - 1;
  
  if (start === 0) return 0;
  
  return (Math.pow(end / start, 1 / periods) - 1) * 100;
};

export const getAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

export const getMedian = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
};

// Color utilities
export const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast color calculation
  const rgb = backgroundColor.match(/\d+/g);
  if (!rgb || rgb.length < 3) return '#ffffff';
  
  const [r, g, b] = rgb.map(Number);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128 ? '#000000' : '#ffffff';
};

// Chart data utilities
export const prepareChartData = (data: any[], xKey: string, yKey: string) => {
  return data.map(item => ({
    ...item,
    [xKey]: item[xKey],
    [yKey]: typeof item[yKey] === 'number' ? item[yKey] : 0,
  }));
};

export const generateTimeSeriesData = (
  startTime: string,
  endTime: string,
  interval: number, // in minutes
  generator: (timestamp: Date) => number
): Array<{ timestamp: string; value: number }> => {
  const data = [];
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  let current = new Date(start);
  
  while (current <= end) {
    data.push({
      timestamp: current.toISOString(),
      value: generator(current),
    });
    
    current = new Date(current.getTime() + interval * 60 * 1000);
  }
  
  return data;
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Local storage utilities
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const getLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to read from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Array utilities
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Export all utilities as a namespace for easier importing
export const utils = {
  cn,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatDateTime,
  formatTime,
  formatDate,
  formatRelativeTime,
  isCurrentTime,
  getStatusColor,
  getSeverityColor,
  getIncidentIcon,
  calculatePercentageChange,
  calculateGrowthRate,
  getAverage,
  getMedian,
  generateColorFromString,
  getContrastColor,
  prepareChartData,
  generateTimeSeriesData,
  isValidEmail,
  isValidUrl,
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  debounce,
  throttle,
  chunk,
  groupBy,
  unique,
  sortBy,
};