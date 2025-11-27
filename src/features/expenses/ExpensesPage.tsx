import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getExpenses,
  addExpense,
  deleteExpense,
  getTotalExpenses,
  getTodayExpenses,
  getCategoryBreakdown,
  type Expense,
  getCurrentUser,
  money,
} from '../../index';
import { useBackendLicense } from '../../hooks/useBackendLicense';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import InputRow from '../../ui/InputRow';
import { DollarSign, TrendingUp, Calendar, Trash2 } from 'lucide-react';

export default function ExpensesPage() {
  const { license, isBlocked } = useBackendLicense();
  const user = getCurrentUser();

  // Check if plan allows expenses tracking (Pro/Enterprise only)
  const isPro = license?.plan === 'small' || license?.plan === 'large';

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    category: 'other' as Expense['category'],
    amount: 0,
    description: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash' as Expense['payment_method'],
    receipt_number: '',
    vendor_name: '',
    vendor_phone: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadExpenses();
  }, []);

  function loadExpenses() {
    const data = getExpenses();
    // Sort by date, newest first
    const sorted = data.sort((a, b) =>
      new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
    );
    setExpenses(sorted);
  }

  function handleAddExpense() {
    setError('');
    setSuccess('');

    if (!form.description.trim()) {
      setError('Description is required');
      return;
    }

    if (form.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      addExpense({
        category: form.category,
        amount: Number(form.amount),
        description: form.description.trim(),
        expense_date: form.expense_date,
        payment_method: form.payment_method,
        receipt_number: form.receipt_number.trim() || undefined,
        vendor_name: form.vendor_name.trim() || undefined,
        vendor_phone: form.vendor_phone.trim() || undefined,
        notes: form.notes.trim() || undefined,
        created_by: user?.username || 'unknown',
      });

      setSuccess('Expense added successfully!');
      setForm({
        category: 'other',
        amount: 0,
        description: '',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        receipt_number: '',
        vendor_name: '',
        vendor_phone: '',
        notes: '',
      });
      setShowForm(false);
      loadExpenses();
    } catch (e: any) {
      setError(e.message || 'Failed to add expense');
    }
  }

  function handleDeleteExpense(id: string) {
    if (!confirm('Delete this expense? This cannot be undone.')) return;

    try {
      deleteExpense(id);
      setSuccess('Expense deleted successfully!');
      loadExpenses();
    } catch (e: any) {
      setError(e.message || 'Failed to delete expense');
    }
  }

  const totalExpenses = getTotalExpenses();
  const todayExpenses = getTodayExpenses();
  const categoryBreakdown = getCategoryBreakdown();

  // Block access if not Pro/Enterprise
  if (!isPro || isBlocked) {
    return (
      <div className="grid gap-6">
        <Card>
          <div className="flex items-start gap-4 p-6">
            <DollarSign size={48} className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[var(--ink)] mb-2">
                Expenses Tracking (Pro Feature)
              </h2>
              <p className="text-[var(--muted)] mb-4">
                Track all business expenses including rent, utilities, transport, stock purchases, salaries, and more.
                This feature is only available on Pro and Enterprise plans.
              </p>
              <Link
                to="/settings"
                className="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const categoryEmojis: Record<Expense['category'], string> = {
    rent: '🏠',
    utilities: '💡',
    transport: '🚗',
    stock_purchase: '📦',
    salary: '💰',
    marketing: '📢',
    maintenance: '🔧',
    other: '📋',
  };

  return (
    <div className="grid gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3 p-4">
            <div className="p-3 rounded-lg bg-red-500/10">
              <DollarSign size={24} className="text-red-500" />
            </div>
            <div>
              <div className="text-sm text-[var(--muted)]">Total Expenses</div>
              <div className="text-2xl font-bold text-[var(--ink)]">{money(totalExpenses)}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 p-4">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <Calendar size={24} className="text-orange-500" />
            </div>
            <div>
              <div className="text-sm text-[var(--muted)]">Today's Expenses</div>
              <div className="text-2xl font-bold text-[var(--ink)]">{money(todayExpenses)}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 p-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <TrendingUp size={24} className="text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-[var(--muted)]">Total Records</div>
              <div className="text-2xl font-bold text-[var(--ink)]">{expenses.length}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">Expenses by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(categoryBreakdown).map(([category, amount]) => (
            <div key={category} className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--line)]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{categoryEmojis[category as Expense['category']]}</span>
                <span className="text-xs text-[var(--muted)] capitalize">{category.replace('_', ' ')}</span>
              </div>
              <div className="text-lg font-bold text-[var(--ink)]">{money(amount)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Expense Button */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--ink)]">Expense Records</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Expense'}
          </Button>
        </div>

        {/* Add Expense Form */}
        {showForm && (
          <div className="mt-6 p-6 rounded-xl bg-[var(--bg)] border-2 border-[var(--line)]">
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">New Expense</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <InputRow label="Category *">
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Expense['category'] })}
                  className="control"
                >
                  <option value="rent">Rent</option>
                  <option value="utilities">Utilities</option>
                  <option value="transport">Transport</option>
                  <option value="stock_purchase">Stock Purchase</option>
                  <option value="salary">Salary</option>
                  <option value="marketing">Marketing</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </InputRow>

              <InputRow label="Amount *">
                <input
                  type="number"
                  value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                  className="control"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </InputRow>

              <InputRow label="Description *">
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="control"
                  placeholder="What was the expense for?"
                />
              </InputRow>

              <InputRow label="Date *">
                <input
                  type="date"
                  value={form.expense_date}
                  onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
                  className="control"
                />
              </InputRow>

              <InputRow label="Payment Method *">
                <select
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value as Expense['payment_method'] })}
                  className="control"
                >
                  <option value="cash">Cash</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="pos">POS</option>
                </select>
              </InputRow>

              <InputRow label="Receipt Number">
                <input
                  type="text"
                  value={form.receipt_number}
                  onChange={(e) => setForm({ ...form, receipt_number: e.target.value })}
                  className="control"
                  placeholder="Optional"
                />
              </InputRow>

              <InputRow label="Vendor Name">
                <input
                  type="text"
                  value={form.vendor_name}
                  onChange={(e) => setForm({ ...form, vendor_name: e.target.value })}
                  className="control"
                  placeholder="Optional"
                />
              </InputRow>

              <InputRow label="Vendor Phone">
                <input
                  type="tel"
                  value={form.vendor_phone}
                  onChange={(e) => setForm({ ...form, vendor_phone: e.target.value })}
                  className="control"
                  placeholder="Optional"
                />
              </InputRow>

              <InputRow label="Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="control"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </InputRow>
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            {success && <p className="mt-4 text-sm text-green-500">{success}</p>}

            <div className="mt-4 flex gap-2">
              <Button onClick={handleAddExpense}>Save Expense</Button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg bg-[var(--ghost)] hover:bg-[var(--line)] text-[var(--ink)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Expenses List */}
      <Card>
        <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">All Expenses</h3>

        {expenses.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
            <p>No expenses recorded yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Vendor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td data-label="Date">{new Date(e.expense_date).toLocaleDateString()}</td>
                    <td data-label="Category">
                      <span className="flex items-center gap-2">
                        <span>{categoryEmojis[e.category]}</span>
                        <span className="capitalize">{e.category.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td data-label="Description">{e.description}</td>
                    <td data-label="Amount">
                      <span className="font-bold text-red-600 dark:text-red-400">{money(e.amount)}</span>
                    </td>
                    <td data-label="Payment">
                      <span className="capitalize">{e.payment_method}</span>
                    </td>
                    <td data-label="Vendor">{e.vendor_name || '—'}</td>
                    <td data-label="Actions">
                      <button
                        onClick={() => handleDeleteExpense(e.id)}
                        className="text-sm px-2 py-1 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
