import { NextRequest, NextResponse } from 'next/server';
import { TimeBookingData } from '@/types/timebooking';

export async function POST(request: NextRequest) {
  try {
    const data: TimeBookingData = await request.json();

    // Validate required fields
    if (!data.userSign || !data.entityCode || !data.barcode || !data.entryStart || !data.entryEnd) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format the dates to match the XML format (ISO 8601)
    const formatDateTime = (dateTimeLocal: string) => {
      // Convert from datetime-local format to ISO format
      const date = new Date(dateTimeLocal);
      return date.toISOString();
    };

    const formattedStartTime = formatDateTime(data.entryStart);
    const formattedEndTime = formatDateTime(data.entryEnd);

    // Generate XML based on the sample structure
    const xml = `<?xml version="1.0" ?>
<transferBooking version="1.0">
  <interval>
    <employee>
      <userSign>${data.userSign}</userSign>
    </employee>
    <bookings>
      <booking>
        <entityCode>${data.entityCode}</entityCode>
        <barcode>${data.barcode}</barcode>
        <timePeriod>
          <entryStart>${formattedStartTime}</entryStart>
          <entryEnd>${formattedEndTime}</entryEnd>
        </timePeriod>
      </booking>
    </bookings>
  </interval>
</transferBooking>`;

    // Return the generated XML
    return NextResponse.json({
      success: true,
      xml: xml,
      data: {
        ...data,
        entryStart: formattedStartTime,
        entryEnd: formattedEndTime,
      },
    });

  } catch (error) {
    console.error('Error processing time booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Time Booking API',
    endpoints: {
      POST: '/api/timebooking - Submit time booking data and receive XML'
    }
  });
}
