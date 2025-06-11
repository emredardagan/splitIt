import Decimal from 'decimal.js';

export interface BillItem {
  id: string;
  name: string;
  price: Decimal;
  assignedTo: string[];
}

export interface Person {
  id: string;
  name: string;
}

export interface BillForm {
  billItems: BillItem[];
  people: Person[];
  tax: Decimal;
  tip: Decimal;
  splitEvenly: boolean;
  currency: CurrencyInfo;
}

export type Currency = 'USD' | 'EUR' | 'TL';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
}

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Manual: undefined;
  ReceiptItems: undefined;
  PeopleAndSplit: undefined;
  AdScreen: undefined;
  SplitSummary: undefined;
  CurrencySelector: undefined;
}; 