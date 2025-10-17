import crypto from 'crypto';

export interface QRPayload {
  eventId: string;
  organizerPubkey: string;
  timestamp: number;
  nonce: string;
  signature: string;
}

export function generateSecureQR(
  eventId: string,
  organizerPubkey: string
): QRPayload {
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const secretKey = process.env.QR_SECRET_KEY!;

  const payload = `${eventId}:${organizerPubkey}:${timestamp}:${nonce}`;
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');

  return {
    eventId,
    organizerPubkey,
    timestamp,
    nonce,
    signature,
  };
}

export function verifyQRSignature(qrPayload: QRPayload): boolean {
  const secretKey = process.env.QR_SECRET_KEY!;
  const payload = `${qrPayload.eventId}:${qrPayload.organizerPubkey}:${qrPayload.timestamp}:${qrPayload.nonce}`;
  
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(qrPayload.signature),
    Buffer.from(expectedSignature)
  );
}

export function isQRExpired(timestamp: number, expiryHours: number = 24): boolean {
  const expiryMs = expiryHours * 60 * 60 * 1000;
  return Date.now() - timestamp > expiryMs;
}