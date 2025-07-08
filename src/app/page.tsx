'use client';

import { useState } from 'react';
import { TimeBookingForm } from '@/components/TimeBookingForm';
import { XMLDisplay } from '@/components/XMLDisplay';
import { TimeBookingData } from '@/types/timebooking';

export default function Home() {
  const [generatedXML, setGeneratedXML] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: TimeBookingData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/timebooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit time booking');
      }

      const result = await response.json();

      if (result.success) {
        setGeneratedXML(result.xml);
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error submitting time booking:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewEntry = () => {
    setGeneratedXML(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Time Booking System
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Collect time booking information and generate XML transfer data
          </p>
        </div>

        <div className="space-y-8">
          {!generatedXML ? (
            <TimeBookingForm onSubmit={handleSubmit} isLoading={isLoading} />
          ) : (
            <div className="space-y-6">
              <XMLDisplay xml={generatedXML} title="Generated Transfer Booking XML" />
              <div className="text-center">
                <button
                  onClick={handleNewEntry}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create New Entry
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
