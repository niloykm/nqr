import React, { useState } from 'react';
import { Check, Sparkles, Shield, Rocket, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

const Billing = ({ user, isPro, onUpgrade, addAlert }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (plan) => {
    if (!user) {
      addAlert('Please sign in with Google to subscribe', 'info');
      return;
    }
    if (plan === 'free') return;

    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: 'price_pro_subscription',
          email: user.email,
          userId: user.sub || user.id || 'mock-id',
        }),
      });

      const data = await res.json();
      if (data.url) {
        addAlert('Redirecting to Checkout...', 'success');
        // Trigger confetti for premium feel before redirect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          window.location.href = data.url;
        }, 1000);
      } else {
        throw new Error('Failed to create session');
      }
    } catch (err) {
      console.error(err);
      addAlert('Checkout failed. Using mock activation.', 'error');
      // Simulated mock activation if API fails
      onUpgrade(true);
      confetti({
        particleCount: 150,
        spread: 80,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
          Upgrade to NQR <span className="text-blue-600 dark:text-blue-400">Pro</span>
        </h2>
        <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
          Unlock dynamic routing, analytics, bulk operations, and high-fidelity customization.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {/* Free Plan */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between transition-transform hover:scale-[1.01]">
          <div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-semibold mb-4">
              <Rocket className="h-5 w-5 text-slate-500" />
              <span>Starter</span>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">$0</span>
              <span className="text-slate-500 dark:text-slate-400">/ forever</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                'Standard static QR codes',
                'Basic plain-text QR generation',
                'PNG format export',
                'Local history (up to 5 codes)',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm">
                  <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            disabled
            className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed text-center"
          >
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 rounded-3xl p-8 border-2 border-blue-500 shadow-2xl flex flex-col justify-between transition-transform hover:scale-[1.02] text-white">
          <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
            <Sparkles className="h-3 w-3 fill-white" />
            POPULAR
          </div>

          <div>
            <div className="flex items-center gap-2 text-blue-400 font-semibold mb-4">
              <Shield className="h-5 w-5" />
              <span>Pro Member</span>
            </div>
            <div className="mb-6">
              <span className="text-5xl font-extrabold">$9</span>
              <span className="text-blue-300">/ month</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                'Unlimited Dynamic QR Codes (Edit URL anytime)',
                'Complete Scan Analytics (Devices & Countries)',
                'Bulk/Batch QR Generation (CSV/List paste)',
                'High-res Vector Exports (SVG, PDF, high-dpi PNG)',
                'Center Logo & Icon embedding',
                'Custom dot styles & corner designs',
                'Vibrant gradient backgrounds & styling',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-200 text-sm">
                  <Check className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={() => handleCheckout('pro')}
            disabled={loading || isPro}
            className={`w-full py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${
              isPro
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-default'
                : 'bg-blue-600 hover:bg-blue-500 active:scale-95 text-white hover:shadow-blue-500/20'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            {loading ? 'Processing...' : isPro ? 'You are Pro!' : 'Upgrade Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
