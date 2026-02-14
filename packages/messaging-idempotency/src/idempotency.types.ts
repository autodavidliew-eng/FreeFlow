export type IdempotencyRecord = {
  eventId: string;
  consumer: string;
  payloadHash?: string;
};
