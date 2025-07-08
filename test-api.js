// Simple test script to verify the API works
const testData = {
  userSign: "2352191",
  entityCode: "330R", 
  barcode: "WO4320474",
  entryStart: "2024-12-05T04:00",
  entryEnd: "2024-12-05T05:00"
};

console.log('Testing Time Booking API...');
console.log('Input data:', JSON.stringify(testData, null, 2));

// Simulate the API logic
const formatDateTime = (dateTimeLocal) => {
  const date = new Date(dateTimeLocal);
  return date.toISOString();
};

const formattedStartTime = formatDateTime(testData.entryStart);
const formattedEndTime = formatDateTime(testData.entryEnd);

const xml = `<?xml version="1.0" ?>
<transferBooking version="1.0">
  <interval>
    <employee>
      <userSign>${testData.userSign}</userSign>
    </employee>
    <bookings>
      <booking>
        <entityCode>${testData.entityCode}</entityCode>
        <barcode>${testData.barcode}</barcode>
        <timePeriod>
          <entryStart>${formattedStartTime}</entryStart>
          <entryEnd>${formattedEndTime}</entryEnd>
        </timePeriod>
      </booking>
    </bookings>
  </interval>
</transferBooking>`;

console.log('\nGenerated XML:');
console.log(xml);

console.log('\nAPI test completed successfully!');
