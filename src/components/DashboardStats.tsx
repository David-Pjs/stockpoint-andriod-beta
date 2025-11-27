import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Package, AlertTriangle, Calendar, Crown, Users } from 'lucide-react';
import { getSales, getProducts, money, getUsers } from '../index';
import { useBackendLicense } from '../hooks/useBackendLicense';

interface DashboardData {
  todaySales: number;
  todayCount: number;
  lowStockCount: number;
  totalProducts: number;
}

export default function DashboardStats() {
  const [data, setData] = useState<DashboardData>({
    todaySales: 0,
    todayCount: 0,
    lowStockCount: 0,
    totalProducts: 0,
  });

  const { license, loading: licenseLoading } = useBackendLicense();

  useEffect(() => {
    loadStats();
  }, []);

  function loadStats() {
    try {
      // Get today's sales
      const sales = getSales();
      const today = new Date().toDateString();
      const todaySales = sales.filter(s => new Date((s as any).created_at || (s as any).createdAt).toDateString() === today);
      const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);

      // Get products
      const products = getProducts();
      const activeProducts = products;
      const lowStock = activeProducts.filter(p =>
        p.qty_in_stock <= (p.alert_threshold || 5)
      );

      setData({
        todaySales: todayTotal,
        todayCount: todaySales.length,
        lowStockCount: lowStock.length,
        totalProducts: activeProducts.length,
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero Stats - Today's Sales */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold opacity-90">Today's Sales</h2>
          <Calendar size={24} className="opacity-75" />
        </div>
        <div className="text-4xl font-bold mb-1">{money(data.todaySales)}</div>
        <div className="text-sm opacity-90">{data.todayCount} {data.todayCount === 1 ? 'sale' : 'sales'} completed</div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Products */}
        <Link
          to="/products"
          className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--ghost)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Package size={24} className="text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--ink)]">{data.totalProducts}</div>
              <div className="text-sm text-[var(--muted)]">Products in Stock</div>
            </div>
          </div>
        </Link>

        {/* Low Stock Alert */}
        <Link
          to="/products"
          className={`p-4 rounded-xl border transition-colors ${
            data.lowStockCount > 0
              ? 'border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10'
              : 'border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--ghost)]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${
              data.lowStockCount > 0 ? 'bg-orange-500/10' : 'bg-gray-500/10'
            }`}>
              <AlertTriangle size={24} className={data.lowStockCount > 0 ? 'text-orange-500' : 'text-gray-500'} />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--ink)]">{data.lowStockCount}</div>
              <div className="text-sm text-[var(--muted)]">
                {data.lowStockCount > 0 ? 'Low Stock Items' : 'All Stock OK'}
              </div>
            </div>
          </div>
        </Link>

        {/* Today's Activity */}
        <Link
          to="/transactions"
          className="p-4 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--ghost)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <TrendingUp size={24} className="text-green-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--ink)]">{data.todayCount}</div>
              <div className="text-sm text-[var(--muted)]">Sales Today</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link
          to="/sales"
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors shadow-md"
        >
          <div className="text-3xl">💰</div>
          <span className="font-semibold">Make Sale</span>
        </Link>

        <Link
          to="/products"
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors shadow-md"
        >
          <div className="text-3xl">📦</div>
          <span className="font-semibold">Add Stock</span>
        </Link>

        <Link
          to="/reports"
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-colors shadow-md"
        >
          <div className="text-3xl">📊</div>
          <span className="font-semibold">View Reports</span>
        </Link>

        <Link
          to="/transactions"
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-md"
        >
          <div className="text-3xl">📝</div>
          <span className="font-semibold">Sales Records</span>
        </Link>
      </div>

      {/* Low Stock Warning */}
      {data.lowStockCount > 0 && (
        <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle size={24} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--ink)] mb-1">Low Stock Alert!</h3>
              <p className="text-sm text-[var(--muted)] mb-2">
                {data.lowStockCount} {data.lowStockCount === 1 ? 'product is' : 'products are'} running low.
                Restock soon to avoid running out.
              </p>
              <Link
                to="/products"
                className="text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                View Low Stock Items →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Plan Limits Card */}
      {!licenseLoading && license && (
        <div className="p-6 rounded-2xl border-2 border-[var(--line)] bg-[var(--panel)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Crown size={24} className="text-yellow-500" />
              <h3 className="text-lg font-bold text-[var(--ink)]">
                {license.planDisplay} Plan
              </h3>
            </div>
            <Link
              to="/settings"
              className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 hover:underline"
            >
              {license.plan === 'free' ? 'Upgrade Plan' : 'Manage Plan'} →
            </Link>
          </div>

          {/* Plan Status */}
          {license.days_left > 0 && license.days_left <= 7 && (
            <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                ⚠️ Your plan expires in {license.days_left} {license.days_left === 1 ? 'day' : 'days'}
              </p>
            </div>
          )}

          {license.is_expired && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                ⛔ Your subscription has expired. Please renew to continue using premium features.
              </p>
            </div>
          )}

          {/* Limits Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Products Limit */}
            <LimitCard
              icon={<Package size={20} />}
              label="Products"
              current={data.totalProducts}
              limit={license.limits.products}
              color="blue"
            />

            {/* Users Limit */}
            <LimitCard
              icon={<Users size={20} />}
              label="Users"
              current={getUsers().length}
              limit={license.limits.users}
              color="purple"
            />

            {/* Daily Sales Limit */}
            <LimitCard
              icon={<TrendingUp size={20} />}
              label="Daily Sales"
              current={data.todayCount}
              limit={license.limits.daily_sales}
              color="green"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for limit cards
interface LimitCardProps {
  icon: React.ReactNode;
  label: string;
  current: number;
  limit: number;
  color: 'blue' | 'purple' | 'green';
}

function LimitCard({ icon, label, current, limit, color }: LimitCardProps) {
  const percentage = Math.round((current / limit) * 100);
  const isNearLimit = percentage >= 75;
  const isAtLimit = percentage >= 90;

  const colorClasses = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    green: 'text-green-500',
  };

  return (
    <div className={`p-4 rounded-xl border ${isAtLimit ? 'border-red-500/30 bg-red-500/5' : isNearLimit ? 'border-orange-500/30 bg-orange-500/5' : 'border-[var(--line)] bg-[var(--bg)]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={colorClasses[color]}>{icon}</span>
        <span className="text-sm font-semibold text-[var(--muted)]">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold text-[var(--ink)]">{current}</span>
        <span className="text-sm text-[var(--muted)]">/ {limit}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-[var(--line)] overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-[var(--muted)]">
        {percentage}% used
        {isAtLimit && ' - Limit reached!'}
        {isNearLimit && !isAtLimit && ' - Nearly full'}
      </div>
    </div>
  );
}
