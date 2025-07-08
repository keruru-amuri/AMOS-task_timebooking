'use client';

import { useState, useRef, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, X, Keyboard } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(true); // Auto-start scanning when component mounts
  const [useManualInput, setUseManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'html5qr-code-reader';

  const parseBarcodeValue = (rawValue: string): string => {
    // Apply parsing logic for work order codes
    if (rawValue.startsWith('WO')) {
      // Find the first 'R' character and remove everything from that point onwards
      const rIndex = rawValue.indexOf('R');
      if (rIndex !== -1) {
        return rawValue.substring(0, rIndex);
      }
    }

    // For barcodes that don't start with 'WO', pass through unchanged
    return rawValue;
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (error) {
        console.error('Failed to stop scanner:', error);
      }
    }
  };

  const handleScanSuccess = (result: string) => {
    const parsedValue = parseBarcodeValue(result);
    console.log(`Barcode scanned: "${result}" -> parsed: "${parsedValue}"`);

    // Stop the scanner first
    stopScanning();

    // Call the parent callback with parsed value
    onScan(parsedValue);

    // Close the scanning modal
    setIsScanning(false);
    setError(null);
  };

  useEffect(() => {
    console.log('useEffect triggered:', { isScanning, useManualInput, hasScanner: !!scannerRef.current });

    // Auto-start camera when isScanning becomes true
    if (isScanning && !scannerRef.current && !useManualInput) {
      const initializeScanner = async () => {
        try {
          console.log('Starting scanner initialization...');
          setError(null);

          // Wait for DOM element to be available
          await new Promise(resolve => setTimeout(resolve, 500));

          // Check if element exists
          const element = document.getElementById(scannerElementId);
          console.log('Scanner element found:', !!element);

          if (!element) {
            console.error('Scanner element not found');
            setUseManualInput(true);
            setError('Scanner element not available. Please enter barcode manually.');
            return;
          }

          console.log('Initializing Html5Qrcode...');
          // Initialize Html5Qrcode
          scannerRef.current = new Html5Qrcode(scannerElementId);

          // Configuration for scanning
          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.QR_CODE
            ]
          };

          console.log('Starting camera...');
          // Start camera directly with back camera preference
          await scannerRef.current.start(
            { facingMode: 'environment' }, // Camera constraints
            config,
            (decodedText) => {
              console.log('Barcode detected:', decodedText);
              handleScanSuccess(decodedText);
            },
            () => {
              // This is called for every frame where no barcode is detected
              // We don't want to log this as it's normal behavior
            }
          );

          console.log('Html5Qrcode camera started successfully');
        } catch (error) {
          console.error('Failed to initialize scanner:', error);
          setUseManualInput(true);
          setError('Camera not available. Please enter barcode manually.');
        }
      };

      initializeScanner();
    }

    return () => {
      // Cleanup when component unmounts
      if (scannerRef.current) {
        console.log('Cleaning up scanner...');
        scannerRef.current.stop().then(() => {
          if (scannerRef.current) {
            scannerRef.current.clear();
            scannerRef.current = null;
          }
        }).catch(error => {
          console.error('Failed to stop scanner:', error);
        });
      }
    };
  }, [isScanning, useManualInput]); // Run when isScanning or useManualInput changes





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

  const switchToManual = () => {
    stopScanning();
    setUseManualInput(true);
    setError(null);
  };

  const cancelScanning = () => {
    stopScanning();
    setIsScanning(false);
    setUseManualInput(false);
    setManualInput('');
    setError(null);
  };



  // Always show the scanning interface since we auto-start
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {useManualInput ? 'Enter Barcode' : 'Scanning Barcode'}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={cancelScanning}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!useManualInput ? (
          <>
            <div className="relative">
              {/* Html5Qrcode will inject its video element here */}
              <div
                id={scannerElementId}
                className="w-full h-64 bg-black rounded-lg overflow-hidden"
              />
              {/* Overlay for targeting */}
              <div className="absolute inset-0 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-16 border-2 border-green-400 bg-transparent rounded">
                  <div className="text-green-400 text-xs text-center mt-1 font-semibold bg-black bg-opacity-50 rounded px-1">
                    Position barcode here
                  </div>
                </div>
              </div>
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
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
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
