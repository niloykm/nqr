import { readDB, writeDB } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { priceId, email, userId } = req.body;
  const isProd = process.env.NODE_ENV === 'production';

  // Stripe official integration if env variable exists
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId || 'price_dummy_pro', // Price ID from Stripe Dashboard
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${req.headers.origin || 'http://localhost:5173'}/?session_id={CHECKOUT_SESSION_ID}&success=true`,
        cancel_url: `${req.headers.origin || 'http://localhost:5173'}/?cancelled=true`,
        customer_email: email,
        client_reference_id: userId,
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      console.error('Stripe actual session creation failed, falling back to mock flow:', err);
    }
  }

  // Fallback / Mock stripe payment session
  const mockSessionId = 'cs_test_' + Math.random().toString(36).substring(2, 15);
  const redirectUrl = `${req.headers.origin || 'http://localhost:5173'}/?session_id=${mockSessionId}&success=true&mock=true`;

  return res.status(200).json({ url: redirectUrl });
}
