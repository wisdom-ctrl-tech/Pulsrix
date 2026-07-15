'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, History, CreditCard, FileText, TrendingUp, Clock, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [meetingCount, setMeetingCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState('No recent activity');

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'meetings'),
          where('email', '==', user.email)
        );
        const snapshot = await getDocs(q);
        setMeetingCount(snapshot.size);
        
        if (snapshot.size > 0) {
          const lastMeeting = snapshot.docs[0]?.data();
          const date = lastMeeting?.createdAt 
            ? new Date(lastMeeting.createdAt).toLocaleDateString()
            : 'recently';
          setRecentActivity(`Last meeting: ${date}`);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-8"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* ✅ FIXED: Welcome Section with Clean Spacing */}
        <motion.div 
          variants={fadeInUp}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-xl shadow-blue-600/20"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
          </div>
          <div className="relative z-10">
            <motion.h1 
              className="text-3xl font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
            </motion.h1>
            <motion.p 
              className="mt-2 text-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              You've summarized <span className="font-semibold text-white">{meetingCount}</span> meetings so far
            </motion.p>
            <motion.div 
              className="mt-4 flex items-center gap-2 text-sm text-blue-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Clock className="w-4 h-4" />
              <span>{recentActivity}</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Meetings</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{meetingCount}</p>
                  </div>
                  <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-3">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Ready for more</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscription</p>
                    <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">Active</p>
                  </div>
                  <div className="rounded-full bg-green-100 dark:bg-green-950 p-3">
                    <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Pro Plan - $19/month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Actions</p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Upload or view history</p>
                  </div>
                  <div className="rounded-full bg-purple-100 dark:bg-purple-950 p-3">
                    <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <a
                    href="/dashboard/upload"
                    className="flex-1 text-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                  >
                    Upload
                  </a>
                  <a
                    href="/dashboard/history"
                    className="flex-1 text-center px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition"
                  >
                    History
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Quick Action Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => window.location.href = '/dashboard/upload'}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-400/20 blur-2xl" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex rounded-xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-600/30">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Upload Meeting</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Get an AI summary of your meeting recording
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                Start now →
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            onClick={() => window.location.href = '/dashboard/history'}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-400/20 blur-2xl" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex rounded-xl bg-purple-600 p-3 text-white shadow-lg shadow-purple-600/30">
                <History className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">View History</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Browse all your past meeting summaries
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                Browse now →
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        {meetingCount > 0 && (
          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="rounded-full bg-blue-100 dark:bg-blue-950 p-2">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Meeting summarized</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Your last meeting was processed successfully</p>
                    </div>
                    <span className="text-xs text-gray-400">Just now</span>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}