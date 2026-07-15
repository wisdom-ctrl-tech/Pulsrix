'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle, Crown, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function SubscriptionPage() {
  return (
    <DashboardLayout>
      <motion.div
        initial="initial"
        animate="animate"
        className="max-w-3xl mx-auto"
        variants={fadeInUp}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your plan and billing</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Current Plan
            </CardTitle>
            <CardDescription>Your subscription details and billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-700 dark:text-green-300">Active</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Pro Plan - $19/month</p>
                </div>
              </div>
              <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950">
                Manage
              </Button>
            </div>

            <div className="border rounded-xl p-4 space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Billing Information</h4>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <CreditCard className="w-4 h-4" />
                <span>•••• •••• •••• 4242</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <CalendarDays className="w-4 h-4" />
                <span>Next billing date: August 15, 2026</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button variant="outline" className="w-full">
                Update Payment Method
              </Button>
              <Button variant="destructive" className="w-full">
                Cancel Subscription
              </Button>
            </div>

            <p className="text-xs text-center text-gray-400 dark:text-gray-600">
              Your subscription will remain active until the end of your billing period
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}