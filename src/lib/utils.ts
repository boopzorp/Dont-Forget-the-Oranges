import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Currency } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: Currency, fractionDigits = 2) {
  const exchangeRates: { [key: string]: number } = {
    USD: 1,
    INR: 83.5,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 157,
  }

  const convertedAmount = amount * (exchangeRates[currency.code] || 1);

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(convertedAmount);
}
