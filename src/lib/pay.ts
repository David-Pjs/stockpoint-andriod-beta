// lib/pay.ts
export async function startPayment(
  plan: "small" | "large",
  billing: "monthly" | "yearly",
  email: string
) {
  const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;

  // Calculate amount in kobo based on plan and billing
  const PRICES = {
    small: { monthly: 300000, yearly: 3000000 },   // ₦3k or ₦30k
    large: { monthly: 500000, yearly: 5000000 }    // ₦5k or ₦50k
  };

  const amount = PRICES[plan][billing];
  const months = billing === "yearly" ? 12 : 1;

  return new Promise<void>((resolve, reject) => {
    // @ts-ignore
    const handler = window.PaystackPop.setup({
      key,
      email,
      amount,
      metadata: {
        app: "StockPoint",
        plan,
        billing,
        months
      },
      callback: async (resp: { reference: string }) => {
        try {
          const base = import.meta.env.VITE_API_BASE as string;
          const verify = await fetch(`${base}/payment/verify?ref=${encodeURIComponent(resp.reference)}`);
          const data = await verify.json();
          if (!data.ok) throw new Error(data.error || "Verify failed");

          // Activate paid plan locally
          const { activatePaid } = await import("../index");
          activatePaid(data.plan, data.months ?? months, data.ref);

          // Clear backend license cache to force refresh
          const { clearLicenseCache } = await import("../hooks/useBackendLicense");
          clearLicenseCache();

          const planName = plan === "small" ? "Pro" : "Enterprise";
          const duration = billing === "yearly" ? "year" : "month";
          alert(`Payment successful! ${planName} plan activated for 1 ${duration}.`);
          resolve();
        } catch (e: any) {
          alert(e?.message || "Verification failed");
          reject(e);
        }
      },
      onClose: () => reject(new Error("Payment cancelled"))
    });
    handler.openIframe();
  });
}
