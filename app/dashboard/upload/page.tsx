'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, Loader2, FileAudio, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

export default function UploadPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [meetingName, setMeetingName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!meetingName) {
        setMeetingName(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !meetingName) {
      alert('Please select a file and enter a meeting name');
      return;
    }

    setUploading(true);
    setStatus('📤 Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('meetingName', meetingName);
      formData.append('email', user.email || '');

      const response = await fetch('/api/meetings/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setStatus('✅ Processing complete! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard/history');
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setStatus('❌ Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial="initial"
        animate="animate"
        className="max-w-2xl mx-auto"
        variants={fadeInUp}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Upload Meeting</CardTitle>
            <CardDescription>
              Upload a recording and get an AI-powered summary in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Meeting Name</label>
                <Input
                  type="text"
                  value={meetingName}
                  onChange={(e) => setMeetingName(e.target.value)}
                  placeholder="e.g., Team Sync - July 15"
                  required
                  className="border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Recording File</label>
                <div className={`
                  border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
                  ${file 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-blue-500'
                  }
                `}>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a"
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    {file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileAudio className="w-8 h-8 text-green-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    ) : (
                      <div>
                        <div className="text-5xl mb-3">📁</div>
                        <p className="text-gray-600 dark:text-gray-400">
                          Click to select or drag and drop
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Supported: MP3, MP4, WAV, M4A (Max 100MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {status && (
                <div className={`p-3 rounded-lg text-sm ${
                  status.includes('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
                  status.includes('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {status}
                </div>
              )}

              <Button
                type="submit"
                disabled={uploading || !file}
                className="w-full"
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 w-4 h-4" />
                    Upload & Summarize
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
}