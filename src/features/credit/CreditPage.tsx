import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCreditTransactions,
  addCreditTransaction,
  addCreditPayment,
  getTotalOutstandingCredit,
  getOverdueCredits,
  type CreditTransaction,
  getCurrentUser,
  money,
  getProducts,
} from '../../index';
import { useBackendLicense } from '../../hooks/useBackendLicense';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import InputRow from '../../ui/InputRow';
import { AlertTriangle, CreditCard, TrendingDown, Users } from 'lucide-react';

export default function CreditPage() {
  const { license, isBlocked } = useBackendLicense();
  const user = getCurrentUser();

  // Check if plan allows credit tracking (Pro/Enterprise only)
  const isPro = license?.plan === 'small' || license?.plan === 'large';

  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null);

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    amount: 0,
    due_date: '',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    payment_method: 'cash' as 'cash' | 'transfer' | 'pos',
    notes: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  function loadTransactions() {
    const data = getCreditTransactions();
    // Sort by date, newest first
    const sorted = data.sort((a, b) =>
      new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()
    );
    setTransactions(sorted);
  }

  function handleAddCredit() {
    setError('');
    setSuccess('');

    if (!form.customer_name.trim()) {
      setError('Customer name is required');
      return;
    }

    if (form.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    try {
      addCreditTransaction({
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim() || undefined,
        amount: Number(form.amount),
        amount_paid: 0,
        items: [],
        sale_date: new Date().toISOString(),
        due_date: form.due_date || undefined,
        status: 'pending',
        notes: form.notes.trim() || undefined,
        created_by: user?.username || 'unknown',
      });

      setSuccess('Credit transaction added successfully!');
      setForm({
        customer_name: '',
        customer_phone: '',
        amount: 0,
        due_date: '',
        notes: '',
      });
      setShowForm(false);
      loadTransactions();
    } catch (e: any) {
      setError(e.message || 'Failed to add credit transaction');
    }
  }

  function handleRecordPayment(creditId: string) {
    setError('');
    setSuccess('');

    if (paymentForm.amount <= 0) {
      setError('Payment amount must be greater than 0');
      return;
    }

    try {
      addCreditPayment({
        credit_id: creditId,
        amount: Number(paymentForm.amount),
        payment_date: new Date().toISOString(),
        payment_method: paymentForm.payment_method,
        received_by: user?.username || 'unknown',
        notes: paymentForm.notes.trim() || undefined,
      });

      setSuccess('Payment recorded successfully!');
      setPaymentForm({
        amount: 0,
        payment_method: 'cash',
        notes: '',
      });
      setShowPaymentForm(null);
      loadTransactions();
    } catch (e: any) {
      setError(e.message || 'Failed to record payment');
    }
  }

  const totalOutstanding = getTotalOutstandingCredit();
  const overdueCount = getOverdueCredits().length;
  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  // Block access if not Pro/Enterprise
  if (!isPro || isBlocked) {
    return (
      <div className="grid gap-6">
        <Card>
          <div className="flex items-start gap-4 p-6">
            <CreditCard size={48} className="text-blue-500 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[var(--ink)] mb-2">
                Credit Tracking (Pro Feature)
              </h2>
              <p className="text-[var(--muted)] mb-4">
                Track goods sold on credit to customers, manage payments, and monitor outstanding debts.
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

  return (
    <div className="grid gap-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3 p-4">
            <div className="p-3 rounded-lg bg-orange-500/10">
              <TrendingDown size={24} className="text-orange-500" />
            </div>
            <div>
              <div className="text-sm text-[var(--muted)]">Total Outstanding</div>
              <div className="text-2xl font-bold text-[var(--ink)]">{money(totalOutstanding)}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 p-4">
            <div className="p-3 rounded-lg bg-red-500/10">
              <AlertTriangle size={24} className="text-red-500" />
            </div>
            <div>
              <div className="text-sm text-[var(--muted)]">Overdue Credits</div>
              <div className="text-2xl font-bold text-[var(--ink)]">{overdueCount}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 p-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Users size={24} className="text-blue-500" />
            </div>
            <div>
              <div className="text-sm text-[var(--muted)]">Pending Payments</div>
              <div className="text-2xl font-bold text-[var(--ink)]">{pendingCount}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Credit Button */}
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--ink)]">Credit Transactions</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Credit Sale'}
          </Button>
        </div>

        {/* Add Credit Form */}
        {showForm && (
          <div className="mt-6 p-6 rounded-xl bg-[var(--bg)] border-2 border-[var(--line)]">
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">New Credit Sale</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <InputRow label="Customer Name *">
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="control"
                  placeholder="Customer full name"
                />
              </InputRow>

              <InputRow label="Customer Phone">
                <input
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  className="control"
                  placeholder="080XXXXXXXX"
                />
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

              <InputRow label="Due Date">
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="control"
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
              <Button onClick={handleAddCredit}>Save Credit Sale</Button>
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

      {/* Transactions List */}
      <Card>
        <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">All Credit Transactions</h3>

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-[var(--muted)]">
            <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
            <p>No credit transactions yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td data-label="Customer">{t.customer_name}</td>
                    <td data-label="Phone">{t.customer_phone || '—'}</td>
                    <td data-label="Amount">{money(t.amount)}</td>
                    <td data-label="Paid">{money(t.amount_paid)}</td>
                    <td data-label="Remaining">
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        {money(t.amount_remaining)}
                      </span>
                    </td>
                    <td data-label="Due Date">
                      {t.due_date ? new Date(t.due_date).toLocaleDateString() : '—'}
                    </td>
                    <td data-label="Status">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          t.status === 'paid'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                            : t.status === 'overdue'
                            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : t.status === 'partial'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-gray-500/10 text-gray-600 dark:text-gray-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td data-label="Actions">
                      {t.status !== 'paid' && (
                        <button
                          onClick={() => setShowPaymentForm(t.id)}
                          className="text-sm px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                        >
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payment Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">Record Payment</h3>

            <div className="grid gap-4">
              <InputRow label="Payment Amount *">
                <input
                  type="number"
                  value={paymentForm.amount || ''}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="control"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </InputRow>

              <InputRow label="Payment Method *">
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value as any })}
                  className="control"
                >
                  <option value="cash">Cash</option>
                  <option value="transfer">Bank Transfer</option>
                  <option value="pos">POS</option>
                </select>
              </InputRow>

              <InputRow label="Notes">
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="control"
                  rows={2}
                  placeholder="Payment notes..."
                />
              </InputRow>
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            <div className="mt-6 flex gap-2">
              <Button onClick={() => handleRecordPayment(showPaymentForm)}>
                Record Payment
              </Button>
              <button
                onClick={() => setShowPaymentForm(null)}
                className="px-4 py-2 rounded-lg bg-[var(--ghost)] hover:bg-[var(--line)] text-[var(--ink)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
