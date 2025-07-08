# Time Booking System Demo

## Application Overview

This web application collects time booking information and generates XML transfer data based on the provided sample format. It features a modern, responsive interface built with Next.js and shadcn/ui components.

## Key Features Implemented

### 1. **Time Booking Form**
- User Sign input field
- Entity Code input field  
- Barcode input with scanning capability
- Start and End time pickers with "Now" buttons
- Form validation using Zod schema
- Real-time error feedback

### 2. **Barcode Scanner**
- Manual barcode entry (for development)
- Camera scanning capability (ready for production)
- Modal interface for barcode input
- Error handling for camera access

### 3. **XML Generation**
- Automatic XML generation matching the sample format
- ISO 8601 datetime formatting
- Proper XML structure with all required elements

### 4. **XML Display & Export**
- Formatted XML display with syntax highlighting
- Copy to clipboard functionality
- Download as XML file
- "Create New Entry" button to start over

## Sample Data

Use this sample data to test the application:

```
User Sign: 2352191
Entity Code: 330R
Barcode: WO4320474
Start Time: 2024-12-05T04:00
End Time: 2024-12-05T05:00
```

## Expected XML Output

```xml
<?xml version="1.0" ?>
<transferBooking version="1.0">
  <interval>
    <employee>
      <userSign>2352191</userSign>
    </employee>
    <bookings>
      <booking>
        <entityCode>330R</entityCode>
        <barcode>WO4320474</barcode>
        <timePeriod>
          <entryStart>2024-12-04T20:00:00.000Z</entryStart>
          <entryEnd>2024-12-04T21:00:00.000Z</entryEnd>
        </timePeriod>
      </booking>
    </bookings>
  </interval>
</transferBooking>
```

## How to Test

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Open in browser:**
   Navigate to `http://localhost:3000`

3. **Fill out the form:**
   - Enter the sample data above
   - Use the "Now" buttons to set current time
   - Click "Scan Barcode" to test the scanner interface

4. **Submit and view results:**
   - Click "Submit Time Booking"
   - View the generated XML
   - Test copy and download functionality

5. **Test API directly:**
   ```bash
   node test-api.js
   ```

## Technical Implementation

### Frontend Components
- `TimeBookingForm.tsx` - Main form with validation
- `BarcodeScanner.tsx` - Barcode scanning interface
- `XMLDisplay.tsx` - XML display and export functionality

### Backend API
- `POST /api/timebooking` - Processes form data and returns XML
- Input validation and error handling
- Datetime formatting to ISO 8601

### Type Safety
- TypeScript interfaces for all data structures
- Zod schema validation
- Proper error handling throughout

## Production Considerations

1. **Camera Access**: The barcode scanner will work with camera access in production
2. **HTTPS Required**: Camera API requires HTTPS in production
3. **Error Logging**: Add proper error logging for production use
4. **Rate Limiting**: Consider adding rate limiting to the API
5. **Data Persistence**: Currently generates XML on-demand; consider adding database storage if needed

## Next Steps

1. Deploy to a production environment with HTTPS
2. Test camera-based barcode scanning
3. Add user authentication if required
4. Implement data persistence if needed
5. Add audit logging for compliance
