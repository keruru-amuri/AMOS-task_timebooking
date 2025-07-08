'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarcodeScanner } from './BarcodeScanner';
import { TimeBookingData } from '@/types/timebooking';

const timeBookingSchema = z.object({
  userSign: z.string().min(1, 'User sign is required'),
  barcode: z.string().min(1, 'Barcode is required'),
  entryStart: z.string().min(1, 'Start time is required'),
  entryEnd: z.string().min(1, 'End time is required'),
});

type TimeBookingFormData = z.infer<typeof timeBookingSchema>;

interface TimeBookingFormProps {
  onSubmit: (data: TimeBookingData) => void;
  isLoading?: boolean;
}

export function TimeBookingForm({ onSubmit, isLoading = false }: TimeBookingFormProps) {
  const [showScanner, setShowScanner] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TimeBookingFormData>({
    resolver: zodResolver(timeBookingSchema),
    defaultValues: {
      userSign: '',
      barcode: '',
      entryStart: '',
      entryEnd: '',
    },
  });

  const barcodeValue = watch('barcode');

  const handleBarcodeScanned = (scannedCode: string) => {
    setValue('barcode', scannedCode);
    setShowScanner(false);
  };

  const handleFormSubmit = (data: TimeBookingFormData) => {
    // Add the hardcoded entity code to the form data
    const formDataWithEntityCode = {
      ...data,
      entityCode: '330R',
    };
    onSubmit(formDataWithEntityCode);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return format(now, "yyyy-MM-dd'T'HH:mm");
  };

  const adjustTime = (currentTime: string, hoursToAdd: number): string => {
    const now = new Date();
    let baseTime: Date;

    if (currentTime) {
      baseTime = new Date(currentTime);
    } else {
      baseTime = now;
    }

    const adjustedTime = new Date(baseTime.getTime() + (hoursToAdd * 60 * 60 * 1000));

    // Ensure the adjusted time is not in the future
    if (adjustedTime > now) {
      return format(now, "yyyy-MM-dd'T'HH:mm");
    }

    return format(adjustedTime, "yyyy-MM-dd'T'HH:mm");
  };

  const setCurrentStartTime = () => {
    setValue('entryStart', getCurrentDateTime());
  };

  const setCurrentEndTime = () => {
    setValue('entryEnd', getCurrentDateTime());
  };

  const adjustStartTime = (hours: number) => {
    const currentStartTime = watch('entryStart');
    const newTime = adjustTime(currentStartTime, hours);
    setValue('entryStart', newTime);
  };

  const adjustEndTime = (hours: number) => {
    const currentEndTime = watch('entryEnd');
    const newTime = adjustTime(currentEndTime, hours);
    setValue('entryEnd', newTime);
  };

  // Helper function to format datetime for display (dd/mm/yy hh:mm)
  const formatDateTimeForDisplay = (isoDateTime: string): string => {
    if (!isoDateTime) return '';
    try {
      const date = new Date(isoDateTime);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Helper function to convert display format back to ISO format
  const parseDisplayDateTime = (displayDateTime: string): string => {
    if (!displayDateTime) return '';
    try {
      // Parse dd/mm/yy hh:mm format
      const [datePart, timePart] = displayDateTime.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');

      // Convert 2-digit year to 4-digit year (assuming 20xx)
      const fullYear = `20${year}`;

      // Create ISO format: yyyy-MM-ddTHH:mm
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Barcode Scanner Section */}
      <Card>
        <CardHeader>
          <CardTitle>Barcode Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  {...register('barcode')}
                  placeholder="Enter or scan barcode (e.g., WO4320474)"
                  value={barcodeValue}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScanner(!showScanner)}
                >
                  {showScanner ? 'Cancel' : 'Scan'}
                </Button>
              </div>
              {errors.barcode && (
                <p className="text-sm text-red-600">{errors.barcode.message}</p>
              )}
            </div>

            {/* Barcode Scanner */}
            {showScanner && (
              <div className="space-y-2">
                <BarcodeScanner
                  onScan={handleBarcodeScanned}
                  onError={(error) => console.error('Scanner error:', error)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Booking Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle>Time Booking Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* User Sign */}
            <div className="space-y-2">
              <Label htmlFor="userSign">User Sign</Label>
              <Input
                id="userSign"
                {...register('userSign')}
                placeholder="Enter user sign (e.g., 2352191)"
              />
              {errors.userSign && (
                <p className="text-sm text-red-600">{errors.userSign.message}</p>
              )}
            </div>

            {/* Entity Code - Hidden (hardcoded to 330R in form submission) */}

            {/* Entry Start Time */}
            <div className="space-y-2">
              <Label htmlFor="entryStart">Entry Start Time</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="entryStart"
                  type="text"
                  placeholder="dd/mm/yy hh:mm"
                  value={formatDateTimeForDisplay(watch('entryStart'))}
                  onChange={(e) => {
                    const isoValue = parseDisplayDateTime(e.target.value);
                    setValue('entryStart', isoValue);
                  }}
                  className="flex-1 h-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => adjustStartTime(-1)}
                  className="px-3 h-10"
                >
                  -1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={setCurrentStartTime}
                  className="h-10"
                >
                  Now
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => adjustStartTime(1)}
                  className="px-3 h-10"
                >
                  +1
                </Button>
              </div>
              {errors.entryStart && (
                <p className="text-sm text-red-600">{errors.entryStart.message}</p>
              )}
            </div>

            {/* Entry End Time */}
            <div className="space-y-2">
              <Label htmlFor="entryEnd">Entry End Time</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="entryEnd"
                  type="text"
                  placeholder="dd/mm/yy hh:mm"
                  value={formatDateTimeForDisplay(watch('entryEnd'))}
                  onChange={(e) => {
                    const isoValue = parseDisplayDateTime(e.target.value);
                    setValue('entryEnd', isoValue);
                  }}
                  className="flex-1 h-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => adjustEndTime(-1)}
                  className="px-3 h-10"
                >
                  -1
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={setCurrentEndTime}
                  className="h-10"
                >
                  Now
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => adjustEndTime(1)}
                  className="px-3 h-10"
                >
                  +1
                </Button>
              </div>
              {errors.entryEnd && (
                <p className="text-sm text-red-600">{errors.entryEnd.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Time Booking'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
