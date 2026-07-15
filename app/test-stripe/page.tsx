'use client';

import { useState } from 'react';

export default function TestStripe() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Sending request to /api/create-checkout-session');
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'test-user-123',
          email: 'test@example.com',
        }),
      });

      console.log('📥 Response status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('❌ Response error:', text);
        throw new Error(`Server responded with ${response.status}: ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      console.log('📦 Full response data:', data);  // 👈 Log the full response
      console.log('✅ Session ID:', data.sessionId);
      console.log('🔗 Checkout URL:', data.url);

      if (!data.url) {
        console.error('❌ No URL in response. Full data:', data);
        throw new Error('No checkout URL returned from server');
      }

      // ✅ Redirect directly to the Stripe Checkout URL
      console.log('🔄 Redirecting to Stripe Checkout URL:', data.url);
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('❌ Error:', error);
      setError(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center">Test Stripe Checkout</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
            <strong>Error:</strong> {error}
            <p className="mt-2 text-xs text-red-500">
              Check the console for more details (F12 → Console tab)
            </p>
          </div>
        )}
        
        <p className="text-center text-gray-600">
          Click the button below to test the Stripe integration.
          <br />
          <span className="text-sm text-gray-500">
            Use Stripe test card: 4242 4242 4242 4242
          </span>
        </p>
        
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Subscribe for $19/month'}
        </button>
      </div>
    </div>
  );
}