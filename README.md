# Time Booking System

A modern web application for collecting time booking information and generating XML transfer data. Built with Next.js, TypeScript, and shadcn/ui components.

## Features

- **Modern UI**: Clean, responsive interface built with shadcn/ui components
- **Form Validation**: Robust form validation using react-hook-form and Zod
- **Barcode Support**: Integrated barcode scanning functionality (manual input for development)
- **XML Generation**: Automatic XML generation based on the provided sample format
- **Real-time Feedback**: Instant validation and error handling
- **Export Options**: Copy to clipboard and download generated XML

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Form Handling**: react-hook-form, Zod validation
- **Barcode Scanning**: react-qr-barcode-scanner
- **Date Handling**: date-fns

## Project Structure

```
src/
├── app/
│   ├── api/timebooking/     # API endpoint for processing submissions
│   ├── globals.css          # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── BarcodeScanner.tsx  # Barcode scanning component
│   ├── TimeBookingForm.tsx # Main form component
│   └── XMLDisplay.tsx      # XML display and export component
├── types/
│   └── timebooking.ts      # TypeScript type definitions
└── lib/
    └── utils.ts            # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd timebooking
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## API Documentation

### POST /api/timebooking

Accepts time booking data and returns generated XML.

**Request Body:**
```json
{
  "userSign": "2352191",
  "entityCode": "330R",
  "barcode": "WO4320474",
  "entryStart": "2024-12-05T04:00",
  "entryEnd": "2024-12-05T05:00"
}
```

**Response:**
```json
{
  "success": true,
  "xml": "<?xml version=\"1.0\" ?>...",
  "data": {
    "userSign": "2352191",
    "entityCode": "330R",
    "barcode": "WO4320474",
    "entryStart": "2024-12-04T20:00:00.000Z",
    "entryEnd": "2024-12-04T21:00:00.000Z"
  }
}
```

## XML Output Format

The application generates XML in the following format based on the provided sample:

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

## Testing

Test the API functionality:

```bash
node test-api.js
```

## Development Notes

- The barcode scanner currently uses manual input for development purposes
- Camera-based scanning will be available in production environments
- All datetime inputs are converted to ISO 8601 format for XML output
- Form validation ensures all required fields are completed before submission

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
