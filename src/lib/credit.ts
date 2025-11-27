/**
 * Credit/Debt tracking system for customers buying on credit
 * Pro/Enterprise feature only
 */

export interface CreditTransaction {
  id: string;
  customer_name: string;
  customer_phone?: string;
  amount: number;
  amount_paid: number; // Amount already paid back
  amount_remaining: number; // Outstanding debt
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
  }>;
  sale_date: string; // ISO date when credit was given
  due_date?: string; // Expected payment date
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  notes?: string;
  created_by: string; // User who created this credit sale
  created_at: string;
  updated_at: string;
}

export interface CreditPayment {
  id: string;
  credit_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'transfer' | 'pos';
  received_by: string;
  notes?: string;
  created_at: string;
}

const CREDIT_KEY = 'sp_credit_transactions:v1';
const CREDIT_PAYMENTS_KEY = 'sp_credit_payments:v1';

// Helper functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function loadFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('sp:changed'));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
}

// Credit Transactions
export function getCreditTransactions(): CreditTransaction[] {
  return loadFromStorage<CreditTransaction>(CREDIT_KEY);
}

export function getCreditTransaction(id: string): CreditTransaction | undefined {
  const transactions = getCreditTransactions();
  return transactions.find(t => t.id === id);
}

export function addCreditTransaction(data: Omit<CreditTransaction, 'id' | 'created_at' | 'updated_at' | 'amount_remaining'>): CreditTransaction {
  const transactions = getCreditTransactions();
  const now = new Date().toISOString();

  const transaction: CreditTransaction = {
    ...data,
    id: generateId(),
    amount_remaining: data.amount - data.amount_paid,
    status: data.amount_paid === 0 ? 'pending' : data.amount_paid >= data.amount ? 'paid' : 'partial',
    created_at: now,
    updated_at: now,
  };

  // Check if overdue
  if (transaction.due_date && new Date(transaction.due_date) < new Date() && transaction.status !== 'paid') {
    transaction.status = 'overdue';
  }

  transactions.push(transaction);
  saveToStorage(CREDIT_KEY, transactions);
  return transaction;
}

export function updateCreditTransaction(id: string, updates: Partial<CreditTransaction>): void {
  const transactions = getCreditTransactions();
  const index = transactions.findIndex(t => t.id === id);

  if (index === -1) {
    throw new Error('Credit transaction not found');
  }

  const updated = {
    ...transactions[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Recalculate remaining amount and status
  updated.amount_remaining = updated.amount - updated.amount_paid;

  if (updated.amount_paid >= updated.amount) {
    updated.status = 'paid';
  } else if (updated.amount_paid > 0) {
    updated.status = 'partial';
  } else if (updated.due_date && new Date(updated.due_date) < new Date()) {
    updated.status = 'overdue';
  } else {
    updated.status = 'pending';
  }

  transactions[index] = updated;
  saveToStorage(CREDIT_KEY, transactions);
}

export function deleteCreditTransaction(id: string): void {
  const transactions = getCreditTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  saveToStorage(CREDIT_KEY, filtered);
}

// Credit Payments
export function getCreditPayments(): CreditPayment[] {
  return loadFromStorage<CreditPayment>(CREDIT_PAYMENTS_KEY);
}

export function addCreditPayment(payment: Omit<CreditPayment, 'id' | 'created_at'>): void {
  const payments = getCreditPayments();

  const newPayment: CreditPayment = {
    ...payment,
    id: generateId(),
    created_at: new Date().toISOString(),
  };

  payments.push(newPayment);
  saveToStorage(CREDIT_PAYMENTS_KEY, payments);

  // Update the credit transaction
  const transaction = getCreditTransaction(payment.credit_id);
  if (transaction) {
    updateCreditTransaction(payment.credit_id, {
      amount_paid: transaction.amount_paid + payment.amount,
    });
  }
}

export function getCustomerCreditTransactions(customerName: string): CreditTransaction[] {
  const transactions = getCreditTransactions();
  return transactions.filter(t =>
    t.customer_name.toLowerCase().includes(customerName.toLowerCase())
  );
}

export function getTotalOutstandingCredit(): number {
  const transactions = getCreditTransactions();
  return transactions
    .filter(t => t.status !== 'paid')
    .reduce((sum, t) => sum + t.amount_remaining, 0);
}

export function getOverdueCredits(): CreditTransaction[] {
  const transactions = getCreditTransactions();
  return transactions.filter(t => t.status === 'overdue');
}
