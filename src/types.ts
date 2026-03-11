export type Expense = {
  id: string;
  amount: number;
  note: string;
  categoryId: string;
  paymentMethod: 'card' | 'cash';
  date: string;
};

export type Loan = {
  id: string;
  type: 'owes_me' | 'i_owe';
  name: string;
  amount: number;
  date: string;
  isPaid: boolean;
};
