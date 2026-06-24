import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

// Detect test/live key mismatch at startup so it fails loud, not silently.
if (secretKey && publishableKey) {
  const secretIsTest = secretKey.startsWith('sk_test_')
  const pubIsTest = publishableKey.startsWith('pk_test_')
  if (secretIsTest !== pubIsTest) {
    throw new Error(
      '[stripe] Key mismatch: STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ' +
      'must both be test keys or both be live keys.'
    )
  }
}

if (!secretKey) {
  throw new Error('[stripe] STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(secretKey, {
  apiVersion: '2026-05-27.dahlia',
})

export const isTestMode = secretKey.startsWith('sk_test_')
