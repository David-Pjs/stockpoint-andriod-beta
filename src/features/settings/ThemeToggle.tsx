import { useTheme } from '../../hooks/useTheme';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const options = [
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--panel-2)] border border-[var(--line)]">
      {options.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`
              flex items-center gap-2 px-3 py-2 text-sm rounded-lg font-medium
              transition-all duration-200
              ${isActive
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--ghost)]'
              }
            `}
            title={value === 'system' ? `System (currently ${effectiveTheme})` : label}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
