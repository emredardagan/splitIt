import { CurrencyInfo } from '../types';

export const CURRENCIES: CurrencyInfo[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar'
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro'
  },
  {
    code: 'TL',
    symbol: '₺',
    name: 'Turkish Lira'
  }
];

export const DEFAULT_CURRENCY: CurrencyInfo = CURRENCIES[0]; 