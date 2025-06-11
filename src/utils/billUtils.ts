import Decimal from 'decimal.js';
import { BillForm, BillItem, Person } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getTotal = (billForm: BillForm): Decimal => {
  const itemsTotal = billForm.billItems.reduce(
    (sum, item) => sum.plus(item.price),
    new Decimal(0)
  );
  return itemsTotal.plus(billForm.tax).plus(billForm.tip);
};

export const calculateSplitAmounts = (billForm: BillForm): Decimal[] => {
  const { people, billItems, tax, tip, splitEvenly } = billForm;
  
  if (people.length === 0) return [];
  
  const total = getTotal(billForm);
  
  if (people.length === 1) {
    return [total];
  }
  
  if (splitEvenly) {
    const amountPerPerson = total.dividedBy(people.length).toDecimalPlaces(2);
    const remainder = total.minus(amountPerPerson.times(people.length));
    
    return people.map((_, index) => 
      index === 0 ? amountPerPerson.plus(remainder) : amountPerPerson
    );
  }
  
  // Calculate individual splits
  const itemTotals = new Array(people.length).fill(new Decimal(0));
  
  billItems.forEach((item) => {
    const assignedPeople = item.assignedTo || [];
    if (assignedPeople.length > 0) {
      const pricePerPerson = item.price.dividedBy(assignedPeople.length).toDecimalPlaces(2);
      const remainder = item.price.minus(pricePerPerson.times(assignedPeople.length));
      
      assignedPeople.forEach((personId, index) => {
        const personIndex = people.findIndex((p) => p.id === personId);
        if (personIndex !== -1) {
          itemTotals[personIndex] = itemTotals[personIndex].plus(
            index === 0 ? pricePerPerson.plus(remainder) : pricePerPerson
          );
        }
      });
    }
  });
  
  // Split tax and tip evenly
  const extraCharges = tax.plus(tip);
  const extraChargesPerPerson = extraCharges.dividedBy(people.length).toDecimalPlaces(2);
  const extraChargesRemainder = extraCharges.minus(extraChargesPerPerson.times(people.length));
  
  return itemTotals.map((amount, index) => 
    amount.plus(
      index === 0 
        ? extraChargesPerPerson.plus(extraChargesRemainder)
        : extraChargesPerPerson
    )
  );
};

export const formatCurrency = (amount: Decimal, currencySymbol: string): string => {
  return `${currencySymbol}${amount.toFixed(2)}`;
}; 