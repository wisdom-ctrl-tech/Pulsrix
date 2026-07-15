import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-06-24.dahlia',  // ← Updated to your version
});

export const PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;