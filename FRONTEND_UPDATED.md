# ✅ Frontend Updated - Monthly & Yearly Billing

## What Changed

Updated the React frontend to support monthly and yearly billing cycles with correct pricing.

### Updated Files

1. ✅ `src/lib/pay.ts` - New signature: `startPayment(plan, billing, email)`
2. ✅ `src/features/settings/SettingsPage.tsx` - Added billing period selector

---

## New Payment Structure

### Updated Pricing (matching backend)

| Plan | Monthly | Yearly | Savings |
|------|---------|--------|---------|
| **Pro (small)** | ₦3,000 | ₦30,000 | Save ₦6,000 |
| **Enterprise (large)** | ₦5,000 | ₦50,000 | Save ₦10,000 |

### Settings Page UI Changes

**Before:**
- Tier: Small (₦2,500) / Large (₦5,000)
- Billing type: One-time / Subscription

**After:**
- Plan: Pro / Enterprise
- Billing Period: Monthly / Yearly (with savings displayed)
- Payment Type: One-time payment / Subscription

---

## Code Changes

### 1. Updated `pay.ts`

**Old function:**
```typescript
startPayment(amountKobo: number, email: string)
```

**New function:**
```typescript
startPayment(
  plan: "small" | "large",
  billing: "monthly" | "yearly",
  email: string
)
```

**Features:**
- Calculates amount automatically based on plan + billing
- Sets correct months (1 for monthly, 12 for yearly)
- Sends billing info to backend in metadata
- Shows success message with plan name and duration

### 2. Updated SettingsPage

**New state:**
```typescript
const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
```

**New pricing constants:**
```typescript
const TIER_AMOUNTS = {
  small: { monthly: 300000, yearly: 3000000 },
  large: { monthly: 500000, yearly: 5000000 }
};
```

**UI improvements:**
- Clear "Pro" and "Enterprise" labels
- Billing period selector with prices
- Shows savings for yearly plans
- Dynamic price display based on selection

---

## How to Use

### User Flow

1. **Navigate to Settings** → Scroll to "Upgrade to Pro"
2. **Enter email** for receipt
3. **Select Plan:** Pro or Enterprise
4. **Select Billing Period:**
   - Monthly (billed monthly)
   - Yearly (save ₦6k-10k)
5. **Select Payment Type:** One-time or Subscription
6. **Click "Go Pro"**
7. Complete payment on Paystack
8. Redirect back with activated plan

### Example States

**Pro Monthly:**
- Plan: Pro
- Billing: Monthly (₦3,000)
- Amount charged: ₦3,000
- Duration: 1 month

**Enterprise Yearly:**
- Plan: Enterprise
- Billing: Yearly (₦50,000)
- Amount charged: ₦50,000
- Duration: 12 months
- Savings: ₦10,000

---

## Testing

### 1. Test Monthly Payment
```
Plan: Pro
Billing: Monthly
Expected: ₦3,000 charge for 1 month
```

### 2. Test Yearly Payment
```
Plan: Enterprise
Billing: Yearly
Expected: ₦50,000 charge for 12 months
```

### 3. Verify Savings Display
- Select yearly → Should show "Save ₦6,000" for Pro
- Select yearly → Should show "Save ₦10,000" for Enterprise

### 4. Test Payment Flow
1. Enter email: `test@example.com`
2. Select Pro + Yearly
3. Click "Go Pro"
4. Should redirect to Paystack with ₦30,000
5. Complete with test card: `4084 0840 8408 4081`
6. Should redirect back with plan activated

---

## Migration Notes

### If Using Old `startPayment`

**Before:**
```typescript
import { startPayment } from './lib/pay';

// Old way
startPayment(250000, 'user@example.com');
```

**After:**
```typescript
import { startPayment } from './lib/pay';

// New way - monthly
startPayment('small', 'monthly', 'user@example.com');

// New way - yearly (save money!)
startPayment('large', 'yearly', 'user@example.com');
```

---

## Benefits

✅ Clear pricing structure matching backend
✅ Yearly discount clearly displayed
✅ Better UX with plan names (Pro/Enterprise)
✅ Automatic amount calculation
✅ Correct metadata sent to backend
✅ Success messages show plan details

---

## Next Steps

1. Test payment flow with Paystack test cards
2. Verify plan activation after payment
3. Check billing callback page works
4. Ensure local license updates correctly
5. Test both monthly and yearly flows

---

## Environment Variables

Make sure these are set in `.env.local`:

```env
VITE_API_BASE=http://localhost:3001/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key
VITE_BACKEND_URL=http://localhost:3001
```

---

All done! Frontend now matches the backend pricing structure. 🎉
