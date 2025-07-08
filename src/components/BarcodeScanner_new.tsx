'use client';

import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, X, Keyboard } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [useManualInput, setUseManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef<boolean>(false);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    // Single useEffect to handle all initialization
    const initializeAndStart = async () => {
      if (isInitialized) return; // Prevent multiple initializations

      // Initialize the code reader
      codeReader.current = new BrowserMultiFormatReader();
      setIsInitialized(true);

      // Auto-start camera
      setError(null);
      setUseManualInput(false);
      setIsScanning(true);

      try {
        const stream = await startCamera();
        if (stream && mountedRef.current) {
          // Wait for video to be ready before starting detection
          setTimeout(() => {
            if (mountedRef.current) {
              startBarcodeDetection();
            }
          }, 1000);
        }
      } catch (error) {
        if (mountedRef.current) {
          console.log('Auto-start camera failed, switching to manual input:', error);
          setUseManualInput(true);
          setError('Camera not available. Please enter barcode manually.');
        }
      }
    };

    initializeAndStart();

    return () => {
      // Cleanup when component unmounts
      mountedRef.current = false;
      stopCamera();
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []); // Empty dependency array - only run once

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    scanningRef.current = false;
  };

  const startCamera = async (): Promise<MediaStream | null> => {
    try {
      console.log('Requesting camera access...');

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      console.log('Camera access granted, setting up video stream...');
      setCameraStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be properly loaded with dimensions
        return new Promise((resolve, reject) => {
          const video = videoRef.current;
          if (!video) {
            reject(new Error('Video element not available'));
            return;
          }

          const onLoadedMetadata = () => {
            console.log('Video stream started successfully');
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            resolve(stream);
          };

          const onError = (error: Event) => {
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('error', onError);
            reject(new Error('Video failed to load'));
          };

          video.addEventListener('loadedmetadata', onLoadedMetadata);
          video.addEventListener('error', onError);
        });
      }

      return stream;
    } catch (error) {
      console.error('Failed to start camera:', error);
      throw error;
    }
  };

  const parseBarcodeValue = (rawValue: string): string => {
    // Apply parsing logic for work order codes
    if (rawValue.startsWith('WO')) {
      const rIndex = rawValue.indexOf('R');
      if (rIndex !== -1) {
        // Extract portion from beginning up to (but not including) the first 'R'
        return rawValue.substring(0, rIndex);
      }
      // If no 'R' found, use the entire barcode value
      return rawValue;
    }

    // For barcodes that don't start with 'WO', pass through unchanged
    return rawValue;
  };

  const handleScanSuccess = (result: string) => {
    const parsedValue = parseBarcodeValue(result);
    console.log(`Barcode scanned: "${result}" -> parsed: "${parsedValue}"`);
    onScan(parsedValue);
    setIsScanning(false);
    setError(null);
    stopCamera();
  };

  const handleScanError = (error: Error | string) => {
    const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to access camera';

    // Don't show "not found" errors as they're normal when no barcode is visible
    if (error instanceof NotFoundException) {
      return;
    }

    // Don't switch to manual input for temporary interruption errors
    if (typeof error === 'object' && error.name === 'AbortError') {
      console.log('Video play interrupted, but camera may still work');
      return;
    }

    console.error('Barcode scan error:', errorMessage);
    setError(errorMessage);
    if (onError) {
      onError(errorMessage);
    }
    // Only switch to manual input for serious camera errors
    if (errorMessage.includes('denied') || errorMessage.includes('not found') || errorMessage.includes('not supported')) {
      setUseManualInput(true);
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      const parsedValue = parseBarcodeValue(manualInput.trim());
      console.log(`Manual input: "${manualInput.trim()}" -> parsed: "${parsedValue}"`);
      onScan(parsedValue);
      setManualInput('');
      setIsScanning(false);
      setUseManualInput(false);
    }
  };

  const startBarcodeDetection = async () => {
    if (!codeReader.current || !videoRef.current) return;

    // Ensure video has proper dimensions before starting detection
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.log('Video not ready, waiting for dimensions...');
      setTimeout(() => startBarcodeDetection(), 500);
      return;
    }

    console.log(`Starting barcode detection on video: ${video.videoWidth}x${video.videoHeight}`);
    scanningRef.current = true;

    const detectBarcode = async () => {
      if (!scanningRef.current || !codeReader.current || !videoRef.current) return;

      // Double-check video dimensions before each detection attempt
      const video = videoRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.log('Video lost dimensions, retrying...');
        setTimeout(detectBarcode, 300);
        return;
      }

      try {
        const result = await codeReader.current.decodeOnceFromVideoDevice(undefined, videoRef.current);
        if (result && scanningRef.current) {
          handleScanSuccess(result.getText());
          return;
        }
      } catch (error) {
        // NotFoundException is normal when no barcode is visible
        if (!(error instanceof NotFoundException)) {
          console.error('Barcode detection error:', error);
        }
      }

      // Continue scanning if still active
      if (scanningRef.current) {
        setTimeout(detectBarcode, 300); // Scan every 300ms
      }
    };

    detectBarcode();
  };

  const startScanning = async () => {
    setError(null);
    setUseManualInput(false);
    setIsScanning(true);

    // Automatically start camera when modal opens
    try {
      const stream = await startCamera();
      if (stream) {
        // Wait a bit for the video to be ready
        setTimeout(() => {
          startBarcodeDetection();
        }, 1000);
      }
    } catch (error) {
      handleScanError(error as Error);
    }
  };

  const stopScanning = () => {
    scanningRef.current = false;
    stopCamera();
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setIsScanning(false);
    setUseManualInput(false);
    setManualInput('');
    setError(null);
  };

  const switchToManual = () => {
    stopCamera();
    setUseManualInput(true);
    setError(null);
  };

  if (isScanning) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {useManualInput ? 'Enter Barcode' : 'Scanning Barcode'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={stopScanning}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!useManualInput ? (
            <>
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg object-cover"
                  autoPlay
                  playsInline
                  muted
                  controls={false}
                />
                <div className="absolute inset-0 rounded-lg pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-16 border-2 border-green-400 bg-transparent rounded">
                    <div className="text-green-400 text-xs text-center mt-1 font-semibold bg-black bg-opacity-50 rounded px-1">
                      Position barcode here
                    </div>
                  </div>
                </div>
                {!cameraStream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 rounded-lg">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Starting camera...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600 text-center">
                <p>📱 Point camera at Code128 or Code39 barcode</p>
                <p>Make sure barcode is well-lit and in focus</p>
              </div>
              {error && (
                <div className="text-sm text-red-600">
                  <p>{error}</p>
                  <p className="mt-1">Switching to manual input...</p>
                </div>
              )}
              <Button
                onClick={switchToManual}
                variant="outline"
                className="w-full"
              >
                <Keyboard className="mr-2 h-4 w-4" />
                Enter Manually Instead
              </Button>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-600">
                {error ? 'Camera access failed. Please enter the barcode manually:' : 'Enter the barcode manually:'}
              </div>
              <div className="space-y-2">
                <Input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter barcode (e.g., WO4320474)"
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                  autoFocus
                />
                <Button onClick={handleManualSubmit} className="w-full">
                  Use This Barcode
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
