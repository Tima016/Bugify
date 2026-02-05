import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getSeverityColor(severity: string) {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-red-500 hover:bg-red-600 text-white';
    case 'HIGH':
      return 'bg-orange-500 hover:bg-orange-600 text-white';
    case 'MEDIUM':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    case 'LOW':
      return 'bg-blue-500 hover:bg-blue-600 text-white';
    default:
      return 'bg-gray-500 hover:bg-gray-600 text-white';
  }
}
