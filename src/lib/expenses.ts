/**
 * Expenses tracking system for business expenses
 * Pro/Enterprise feature only
 */

export interface Expense {
  id: string;
  category: 'rent' | 'utilities' | 'transport' | 'stock_purchase' | 'salary' | 'marketing' | 'maintenance' | 'other';
  amount: number;
  description: string;
  expense_date: string; // ISO date
  payment_method: 'cash' | 'transfer' | 'pos';
  receipt_number?: string;
  vendor_name?: string;
  vendor_phone?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const EXPENSES_KEY = 'sp_expenses:v1';

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

// Expense CRUD operations
export function getExpenses(): Expense[] {
  return loadFromStorage<Expense>(EXPENSES_KEY);
}

export function getExpense(id: string): Expense | undefined {
  const expenses = getExpenses();
  return expenses.find(e => e.id === id);
}

export function addExpense(data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Expense {
  const expenses = getExpenses();
  const now = new Date().toISOString();

  const expense: Expense = {
    ...data,
    id: generateId(),
    created_at: now,
    updated_at: now,
  };

  expenses.push(expense);
  saveToStorage(EXPENSES_KEY, expenses);
  return expense;
}

export function updateExpense(id: string, updates: Partial<Expense>): void {
  const expenses = getExpenses();
  const index = expenses.findIndex(e => e.id === id);

  if (index === -1) {
    throw new Error('Expense not found');
  }

  expenses[index] = {
    ...expenses[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  saveToStorage(EXPENSES_KEY, expenses);
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses();
  const filtered = expenses.filter(e => e.id !== id);
  saveToStorage(EXPENSES_KEY, filtered);
}

// Analytics functions
export function getExpensesByDateRange(startDate: string, endDate: string): Expense[] {
  const expenses = getExpenses();
  return expenses.filter(e => {
    const expenseDate = new Date(e.expense_date);
    return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
  });
}

export function getExpensesByCategory(category: Expense['category']): Expense[] {
  const expenses = getExpenses();
  return expenses.filter(e => e.category === category);
}

export function getTotalExpenses(): number {
  const expenses = getExpenses();
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function getTotalExpensesForMonth(year: number, month: number): number {
  const expenses = getExpenses();
  return expenses
    .filter(e => {
      const date = new Date(e.expense_date);
      return date.getFullYear() === year && date.getMonth() === month;
    })
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getTodayExpenses(): number {
  const expenses = getExpenses();
  const today = new Date().toDateString();
  return expenses
    .filter(e => new Date(e.expense_date).toDateString() === today)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function getExpensesByPaymentMethod(method: Expense['payment_method']): Expense[] {
  const expenses = getExpenses();
  return expenses.filter(e => e.payment_method === method);
}

export function getCategoryBreakdown(): Record<Expense['category'], number> {
  const expenses = getExpenses();
  const breakdown: Record<string, number> = {};

  expenses.forEach(e => {
    if (!breakdown[e.category]) {
      breakdown[e.category] = 0;
    }
    breakdown[e.category] += e.amount;
  });

  return breakdown as Record<Expense['category'], number>;
}
