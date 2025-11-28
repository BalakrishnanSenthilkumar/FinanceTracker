import { atom } from 'jotai';

export interface Transaction {
  id: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

export const transactionsAtom = atom<Transaction[]>([]);

// Derived atoms for calculations
export const totalBalanceAtom = atom(get => {
  const transactions = get(transactionsAtom);
  return transactions.reduce((total, transaction) => {
    if (transaction.type === 'income') {
      return total + transaction.amount;
    } else {
      return total - transaction.amount;
    }
  }, 0);
});

export const totalIncomeAtom = atom(get => {
  const transactions = get(transactionsAtom);
  return transactions
    .filter(t => t.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);
});

export const totalExpenseAtom = atom(get => {
  const transactions = get(transactionsAtom);
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);
});
