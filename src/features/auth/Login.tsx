// src/components/Login.tsx
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getUsers, login } from "../../index";
import { getAvatar } from "../../lib/avatars";
import { useNavigate } from "react-router-dom";

type Role = "admin" | "accountant" | "staff";
type Profile = { id: string; username: string; role: Role };

function initials(name: string) {
  const parts = name.split(/\s+|_/g).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase() || name.slice(0, 2).toUpperCase();
}
function colorFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h} 60% 55%)`;
}

// simple client-side throttle per user
const FAIL_KEY = (u: string) => `sp_fail:${u}`;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 30_000;

function readFail(u: string) {
  try {
    const raw = localStorage.getItem(FAIL_KEY(u));
    return raw ? (JSON.parse(raw) as { count: number; until?: number }) : { count: 0 };
  } catch {
    return { count: 0 };
  }
}
function writeFail(u: string, v: { count: number; until?: number }) {
  try {
    localStorage.setItem(FAIL_KEY(u), JSON.stringify(v));
  } catch {}
}
function clearFail(u: string) {
  try {
    localStorage.removeItem(FAIL_KEY(u));
  } catch {}
}

export default function Login() {
  const navigate = useNavigate();

  // original profiles list (unchanged)
  const profiles = useMemo<Profile[]>(
    () =>
      getUsers().map((u) => ({
        id: u.id,
        username: u.username,
        role: u.role as Role,
      })),
    []
  );

  // NEW: simple search filter (does not change any business logic)
  const [query, setQuery] = useState("");
  const filteredProfiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        p.username.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
    );
  }, [profiles, query]);

  const [selected, setSelected] = useState<Profile | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lockedFor, setLockedFor] = useState<number>(0); // ms remaining if locked

  // redirect to onboarding if no users exist
  useEffect(() => {
    if (profiles.length === 0) navigate("/register", { replace: true });
  }, [profiles.length, navigate]);

  // when switching profile, reset UI and check lock status
  useEffect(() => {
    setPin("");
    setError(null);
    if (!selected) return;
    const f = readFail(selected.username);
    const now = Date.now();
    setLockedFor(f.until && f.until > now ? f.until - now : 0);

    const t = setInterval(() => {
      const now2 = Date.now();
      const remain = f.until && f.until > now2 ? f.until - now2 : 0;
      setLockedFor(remain > 0 ? remain : 0);
      if (remain <= 0) clearInterval(t);
    }, 200);
    return () => clearInterval(t);
  }, [selected]);

  // SUBMIT
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected || busy) return;

    // lock check
    const f = readFail(selected.username);
    const now = Date.now();
    if (f.until && f.until > now) {
      setLockedFor(f.until - now);
      setError("Too many attempts. Try again shortly.");
      return;
    }

    setError(null);
    setBusy(true);
    try {
      await login(selected.username, pin);
      clearFail(selected.username);

      // At this point setSession() inside login() already calls signalChange()
      // which notifies same-tab subscribers and writes __sp_changed__ for other tabs.
      // Additionally dispatch a DOM event for compatibility with components listening to window.
      try { window.dispatchEvent(new CustomEvent("sp:changed")); } catch {}

      navigate("/", { replace: true });
    } catch (err: any) {
      // bump failures, set lock if needed
      const next = { count: (f.count || 0) + 1 } as { count: number; until?: number };
      if (next.count >= MAX_ATTEMPTS) {
        next.until = Date.now() + LOCK_MS;
      }
      writeFail(selected.username, next);
      setError(err?.message || "Invalid credentials");
      const left = Math.max(0, MAX_ATTEMPTS - next.count);
      if (!next.until) {
        setError(
          `Invalid credentials. ${left} attempt${left === 1 ? "" : "s"} remaining before temporary lock.`
        );
      } else {
        setLockedFor(LOCK_MS);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-10 flex flex-col items-center bg-gradient-to-b from-[var(--bg)] to-[var(--panel)]">
      {/* Hero Section - Nigerian Business Focused */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🏪</div>
        <h1 className="text-2xl font-bold text-[var(--ink)] mb-1">
          Welcome to Your Shop
        </h1>
        <p className="text-[var(--muted)] text-sm max-w-md mx-auto">
          Manage your business easily. Track sales, stock, and profit all in one place.
        </p>
      </div>

      {/* Search filter */}
      <div className="w-full max-w-lg mt-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Search staff or role..."
          className="w-full px-4 py-3 rounded-xl bg-[var(--panel)] border-2 border-[var(--line)] text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none transition-colors"
          aria-label="Search profiles"
        />
      </div>

      {/* Profiles grid - Improved for Nigerian traders */}
      <div className="w-full max-w-3xl mt-6">
        <p className="text-xs text-[var(--muted)] mb-3 text-center">
          👤 Select who's working today
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filteredProfiles.map((p) => {
            const avatarUrl = getAvatar(p.id);
            const isSelected = selected?.id === p.id;
            const roleEmoji = p.role === 'admin' ? '👑' : p.role === 'accountant' ? '📊' : '🧑‍💼';
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className={`group w-full min-h-[120px] p-3 rounded-xl border-2 transition-all duration-200
                  bg-[var(--panel)] hover:bg-[var(--ghost)]
                  ${isSelected
                    ? 'border-green-500 shadow-lg shadow-green-500/20'
                    : 'border-[var(--line)] hover:border-[var(--accent)]'
                  }`}
                type="button"
              >
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="flex items-center justify-center w-16 h-16 overflow-hidden rounded-full ring-2 ring-[var(--line)]">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`${p.username} avatar`}
                          className="object-cover w-16 h-16"
                        />
                      ) : (
                        <div
                          className="grid w-16 h-16 text-lg font-bold rounded-full place-items-center text-slate-900"
                          style={{ background: colorFor(p.username) }}
                          aria-hidden
                        >
                          {initials(p.username)}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm font-semibold truncate max-w-full text-[var(--ink)]">
                    {p.username}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] mt-1 px-2 py-0.5 rounded-full bg-[var(--bg)]">
                    {roleEmoji} {p.role}
                  </div>
                </div>
              </button>
            );
          })}
          {filteredProfiles.length === 0 && (
            <div className="text-sm text-center col-span-full text-[var(--muted)] py-8">
              No staff found. Try a different search.
            </div>
          )}
        </div>
      </div>

      {/* PIN form - Nigerian business friendly */}
      {selected && (
        <form
          onSubmit={onSubmit}
          className="mt-8 w-full max-w-md rounded-2xl bg-[var(--panel)] border-2 border-[var(--line)] p-6 shadow-lg"
          autoComplete="off"
        >
          {/* decoy fields to soak up password managers */}
          <input
            type="text"
            name="fake_user"
            autoComplete="username"
            tabIndex={-1}
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: 0, height: 0, opacity: 0 }}
          />
          <input
            type="password"
            name="fake_pass"
            autoComplete="new-password"
            tabIndex={-1}
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: 0, height: 0, opacity: 0 }}
          />

          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🔐</div>
            <p className="text-base text-[var(--ink)] font-medium">
              Enter PIN for <span className="font-bold text-green-600">{selected.username}</span>
            </p>
            <p className="text-sm text-[var(--muted)] mt-1">Your 4-6 digit security code</p>
          </div>

          <div className="relative">
            <input
              className="w-full rounded-xl bg-[var(--bg)] border-2 border-[var(--line)] px-4 py-4 text-[var(--ink)] text-center text-2xl outline-none tracking-[0.5em] font-bold focus:border-green-500 transition-colors"
              type="password"
              inputMode="numeric"
              pattern="\d*"
              name="pin_code"
              autoComplete="one-time-code"
              autoCapitalize="off"
              autoCorrect="off"
              placeholder="••••••"
              maxLength={6}
              minLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^\d]/g, ""))}
              disabled={lockedFor > 0}
              autoFocus
            />
            {lockedFor > 0 && (
              <div className="absolute text-sm font-bold -translate-y-1/2 right-4 top-1/2 text-orange-500 bg-[var(--panel)] px-2 py-1 rounded-lg">
                🔒 {Math.ceil(lockedFor / 1000)}s
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">⚠️ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={busy || lockedFor > 0 || pin.length < 4}
            className="w-full px-6 py-4 mt-5 text-lg font-bold rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {busy ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>Start Working</span>
                <span>→</span>
              </span>
            )}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setPin('');
                setError(null);
              }}
              className="text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
            >
              ← Choose different person
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
