import { CurrencyInfo } from '../types';

export const CURRENCIES: CurrencyInfo[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'ABD Doları'
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro'
  },
  {
    code: 'TL',
    symbol: '₺',
    name: 'Türk Lirası'
  }
];

export const DEFAULT_CURRENCY: CurrencyInfo =
  CURRENCIES.find((c) => c.code === 'TL') ?? CURRENCIES[0]; 