import { loadStripe } from '@stripe/stripe-js';

let stripePromise: any;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
  }
  return stripePromise;
};

// ✅ NEW: Redirect to Stripe Checkout using URL
export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await getStripe();
  if (!stripe) {
    throw new Error('Failed to load Stripe');
  }
  
  // ✅ Use the new method: redirectToCheckout with sessionId
  const result = await stripe.redirectToCheckout({ sessionId });
  
  // If there's an error, throw it
  if (result.error) {
    console.error('Stripe redirect error:', result.error);
    throw new Error(result.error.message);
  }
  
  // If we get here, redirect was successful
  return result;
};