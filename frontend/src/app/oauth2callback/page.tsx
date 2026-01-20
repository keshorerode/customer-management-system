"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      // Send the code to the backend
      axios.get(`http://localhost:3001/api/gmail/callback?code=${code}`)
        .then(() => {
          setStatus('Authentication successful! Redirecting...');
          setTimeout(() => {
            router.push('/leads');
          }, 1500);
        })
        .catch((err) => {
          console.error(err);
          setStatus('Authentication failed. Please try again.');
        });
    } else {
      setStatus('No authentication code found.');
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen text-white">
      <div className="p-8 rounded-lg bg-white/5 border border-[#2a2a2a] text-center">
        <h1 className="text-xl font-bold mb-4">Gmail Integration</h1>
        <p className="text-gray-300">{status}</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
