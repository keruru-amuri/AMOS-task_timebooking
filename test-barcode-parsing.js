// Test script for barcode parsing logic

const parseBarcodeValue = (rawValue) => {
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

// Test cases
const testCases = [
  // Work order codes with 'R'
  { input: 'WO4664285R2', expected: 'WO4664285' },
  { input: 'WO1234567R1', expected: 'WO1234567' },
  { input: 'WO999R999', expected: 'WO999' },
  { input: 'WO123RABC', expected: 'WO123' },
  
  // Work order codes without 'R'
  { input: 'WO4664285', expected: 'WO4664285' },
  { input: 'WO1234567', expected: 'WO1234567' },
  { input: 'WO999', expected: 'WO999' },
  
  // Non-work order codes (should pass through unchanged)
  { input: '123456789', expected: '123456789' },
  { input: 'ABC123', expected: 'ABC123' },
  { input: 'PRODUCT123R456', expected: 'PRODUCT123R456' },
  { input: '*123456*', expected: '*123456*' },
  
  // Edge cases
  { input: 'WOR123', expected: 'WO' }, // R immediately after WO
  { input: 'WO', expected: 'WO' }, // Just WO
  { input: 'WOXYZ', expected: 'WOXYZ' }, // WO but no R
];

console.log('🧪 Testing Barcode Parsing Logic\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = parseBarcodeValue(testCase.input);
  const success = result === testCase.expected;
  
  if (success) {
    console.log(`✅ Test ${index + 1}: "${testCase.input}" -> "${result}"`);
    passed++;
  } else {
    console.log(`❌ Test ${index + 1}: "${testCase.input}" -> "${result}" (expected: "${testCase.expected}")`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed! Barcode parsing logic is working correctly.');
} else {
  console.log('⚠️  Some tests failed. Please check the parsing logic.');
}
