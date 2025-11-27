import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

/**
 * ReportsHelper - Educational component for Nigerian traders
 * Explains what each metric means in simple, relatable terms
 */
export default function ReportsHelper() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
      >
        <HelpCircle size={18} />
        <span className="text-sm font-medium">📚 Understanding Your Reports</span>
      </button>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--ink)] flex items-center gap-2">
            📚 Understanding Your Business Numbers
          </h3>
          <p className="text-sm text-[var(--muted)] mt-1">
            Simple explanations to help you make better decisions
          </p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-[var(--ghost)] rounded-lg transition-colors"
          aria-label="Close helper"
        >
          <X size={20} className="text-[var(--muted)]" />
        </button>
      </div>

      {/* Explanations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Income */}
        <div className="p-4 rounded-xl bg-[var(--panel)] border border-[var(--line)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💰</span>
            <h4 className="font-bold text-[var(--ink)]">Income</h4>
          </div>
          <p className="text-sm text-[var(--muted)]">
            <strong>What it is:</strong> Total money coming into your shop from sales and other sources.
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            💡 <strong>Tip:</strong> Higher income = more customers or higher prices
          </p>
        </div>

        {/* Expenses */}
        <div className="p-4 rounded-xl bg-[var(--panel)] border border-[var(--line)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💸</span>
            <h4 className="font-bold text-[var(--ink)]">Expenses</h4>
          </div>
          <p className="text-sm text-[var(--muted)]">
            <strong>What it is:</strong> Money you spent on stock, rent, transport, staff, etc.
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
            ⚠️ <strong>Watch:</strong> Keep expenses lower than income to stay profitable
          </p>
        </div>

        {/* Net Profit */}
        <div className="p-4 rounded-xl bg-[var(--panel)] border border-[var(--line)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📈</span>
            <h4 className="font-bold text-[var(--ink)]">Net (Profit)</h4>
          </div>
          <p className="text-sm text-[var(--muted)]">
            <strong>Formula:</strong> Income - Expenses = Your actual profit
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            ✅ <strong>Goal:</strong> This should always be positive (making money!)
          </p>
        </div>

        {/* Orders */}
        <div className="p-4 rounded-xl bg-[var(--panel)] border border-[var(--line)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🛒</span>
            <h4 className="font-bold text-[var(--ink)]">Orders</h4>
          </div>
          <p className="text-sm text-[var(--muted)]">
            <strong>What it is:</strong> Number of customers who bought from you
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            📊 <strong>Track:</strong> More orders = busier shop, more customers
          </p>
        </div>

        {/* Items Sold */}
        <div className="p-4 rounded-xl bg-[var(--panel)] border border-[var(--line)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📦</span>
            <h4 className="font-bold text-[var(--ink)]">Items Sold</h4>
          </div>
          <p className="text-sm text-[var(--muted)]">
            <strong>What it is:</strong> Total number of products sold (quantity)
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
            💡 <strong>Example:</strong> If you sold 5 bags of rice and 3 cartons of drinks = 8 items
          </p>
        </div>

        {/* AOV */}
        <div className="p-4 rounded-xl bg-[var(--panel)] border border-[var(--line)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">💵</span>
            <h4 className="font-bold text-[var(--ink)]">AOV (Average Order Value)</h4>
          </div>
          <p className="text-sm text-[var(--muted)]">
            <strong>Formula:</strong> Total Income ÷ Number of Orders
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
            🎯 <strong>Use it:</strong> Try to increase this by suggesting add-ons to customers
          </p>
        </div>
      </div>

      {/* Nigerian Business Tips */}
      <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
        <h4 className="font-bold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
          🇳🇬 Tips for Nigerian Traders
        </h4>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="text-sm text-[var(--muted)]">
            <strong className="text-[var(--ink)]">✓ Compare yesterday vs today:</strong> Are you selling more or less?
          </div>
          <div className="text-sm text-[var(--muted)]">
            <strong className="text-[var(--ink)]">✓ Check weekday trends:</strong> Mondays slow? Fridays busy?
          </div>
          <div className="text-sm text-[var(--muted)]">
            <strong className="text-[var(--ink)]">✓ Watch your top products:</strong> Always keep them in stock!
          </div>
          <div className="text-sm text-[var(--muted)]">
            <strong className="text-[var(--ink)]">✓ Know payment methods:</strong> Cash, transfer, POS - which do customers prefer?
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
        <h4 className="font-bold text-orange-600 dark:text-orange-400 mb-3">🎯 What to Do Daily</h4>
        <ul className="space-y-2 text-sm text-[var(--muted)]">
          <li className="flex items-start gap-2">
            <span className="text-green-500 flex-shrink-0">1.</span>
            <span><strong className="text-[var(--ink)]">Morning:</strong> Check yesterday's sales - did you hit your target?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 flex-shrink-0">2.</span>
            <span><strong className="text-[var(--ink)]">Afternoon:</strong> Check today's progress - are you on track?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 flex-shrink-0">3.</span>
            <span><strong className="text-[var(--ink)]">Evening:</strong> Count cash, match with records, note any shortages</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 flex-shrink-0">4.</span>
            <span><strong className="text-[var(--ink)]">Weekly:</strong> Compare this week vs last week - growing or shrinking?</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
