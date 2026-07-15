'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, ChevronDown, ChevronUp, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface Meeting {
  id: string;
  meetingName: string;
  summary: string;
  createdAt: string;
  status: string;
}

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

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchMeetings = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'meetings'),
          where('email', '==', user.email),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const meetingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Meeting[];
        setMeetings(meetingsData);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setLoadingMeetings(false);
      }
    };

    fetchMeetings();
  }, [user]);

  const toggleSummary = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading || loadingMeetings) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Meeting History</h1>
            <p className="text-gray-500 dark:text-gray-400">All your summarized meetings in one place</p>
          </div>
          <Button onClick={() => router.push('/dashboard/upload')}>
            + New Meeting
          </Button>
        </motion.div>

        {meetings.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 dark:text-gray-400">No meetings yet</p>
                <Button
                  variant="link"
                  onClick={() => router.push('/dashboard/upload')}
                  className="mt-2"
                >
                  Upload your first meeting →
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={fadeInUp} className="space-y-4">
            {meetings.map((meeting) => (
              <motion.div
                key={meeting.id}
                variants={fadeInUp}
                className="group"
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {meeting.meetingName}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(meeting.createdAt).toLocaleDateString()}
                          </div>
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-medium">
                            {meeting.status}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSummary(meeting.id)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
                      >
                        {expandedId === meeting.id ? (
                          <>Hide Summary <ChevronUp className="ml-1 w-4 h-4" /></>
                        ) : (
                          <>View Summary <ChevronDown className="ml-1 w-4 h-4" /></>
                        )}
                      </Button>
                    </div>

                    {expandedId === meeting.id && meeting.summary && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
                      >
                        <div className="flex items-start gap-2">
                          <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {meeting.summary}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}