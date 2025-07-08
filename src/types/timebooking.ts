export interface TimeBookingData {
  userSign: string;
  entityCode: string;
  barcode: string;
  entryStart: string;
  entryEnd: string;
}

export interface TransferBookingXML {
  version: string;
  interval: {
    employee: {
      userSign: string;
    };
    bookings: {
      booking: {
        entityCode: string;
        barcode: string;
        timePeriod: {
          entryStart: string;
          entryEnd: string;
        };
      };
    };
  };
}
