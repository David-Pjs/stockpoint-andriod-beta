import { useEffect, useState, useCallback } from 'react';

/**
 * Backend License Response (from GET /api/auth/license)
 * This is the SINGLE SOURCE OF TRUTH for license/subscription status
 */
export interface BackendLicense {
  plan: 'free' | 'small' | 'large';
  planDisplay: string; // "Free", "Pro", "Enterprise"
  status: 'active' | 'trial' | 'past_due' | 'canceled';
  subscription_ends_at: string | null;
  grace_until: string | null;
  days_left: number;
  is_expired: boolean;
  in_grace_period: boolean;
  limits: {
    products: number;
    users: number;
    daily_sales: number;
    daily_receipts: number;
  };
  warnings: {
    expiring_soon: boolean;
    in_grace: boolean;
    blocked: boolean;
  };
}

const CACHE_KEY = 'sp_license_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedLicense {
  data: BackendLicense;
  timestamp: number;
}

/**
 * useBackendLicense Hook
 *
 * Fetches license status from backend (single source of truth)
 * - Caches for 5 minutes to reduce API calls
 * - Auto-refreshes on focus/visibility change
 * - Falls back to safe defaults if offline
 *
 * IMPORTANT: Never trust localStorage for authorization - always verify with backend
 */
export function useBackendLicense() {
  const [license, setLicense] = useState<BackendLicense | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLicense = useCallback(async (forceRefresh = false) => {
    try {
      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed: CachedLicense = JSON.parse(cached);
          const age = Date.now() - parsed.timestamp;
          if (age < CACHE_DURATION) {
            setLicense(parsed.data);
            setLoading(false);
            return; // Use cache
          }
        }
      }

      // Fetch from backend
      // TODO: Add proper token authentication when backend auth is fully integrated
      const token = localStorage.getItem('sp_auth_token') || null;

      if (!token) {
        // Not logged in - use free plan
        const freeLicense: BackendLicense = {
          plan: 'free',
          planDisplay: 'Free',
          status: 'active',
          subscription_ends_at: null,
          grace_until: null,
          days_left: 0,
          is_expired: false,
          in_grace_period: false,
          limits: {
            products: 80,
            users: 1,
            daily_sales: 25,
            daily_receipts: 15,
          },
          warnings: {
            expiring_soon: false,
            in_grace: false,
            blocked: false,
          },
        };
        setLicense(freeLicense);
        setLoading(false);
        return;
      }

      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';
      const response = await fetch(`${apiBase}/auth/license`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch license');
      }

      const data: BackendLicense = await response.json();

      // Cache the response
      const cached: CachedLicense = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached));

      setLicense(data);
      setError(null);
    } catch (err: any) {
      console.error('useBackendLicense error:', err);
      setError(err.message || 'Failed to load license');

      // Fallback to cached data if available (with warning)
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedLicense = JSON.parse(cached);
        setLicense(parsed.data);
        console.warn('Using cached license due to fetch error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLicense();
  }, [fetchLicense]);

  // Auto-refresh on focus
  useEffect(() => {
    const handleFocus = () => fetchLicense();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLicense();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchLicense]);

  // Refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLicense();
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchLicense]);

  return {
    license,
    loading,
    error,
    isExpired: license?.is_expired ?? false,
    isBlocked: license?.warnings.blocked ?? false,
    daysLeft: license?.days_left ?? 0,
    refresh: () => fetchLicense(true),
  };
}

/**
 * Clear license cache (call after payment success)
 */
export function clearLicenseCache() {
  localStorage.removeItem(CACHE_KEY);
}
