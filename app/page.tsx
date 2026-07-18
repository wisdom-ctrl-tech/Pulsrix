'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-gray-900 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl"
      >
        <div className="text-6xl mb-6">📝</div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Pulsrix
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          AI-powered meeting summaries in minutes. Upload, transcribe, and get insights instantly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => router.push('/login')}
            className="text-lg"
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/signup')}
            className="text-lg"
          >
            Create Account
          </Button>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-2xl mb-2">🎙️</div>
            <p className="font-medium">Transcribe</p>
            <p className="text-xs">Audio to text</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-2xl mb-2">🤖</div>
            <p className="font-medium">Summarize</p>
            <p className="text-xs">AI-powered insights</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <div className="text-2xl mb-2">📧</div>
            <p className="font-medium">Deliver</p>
            <p className="text-xs">In your inbox</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}