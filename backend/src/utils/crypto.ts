import crypto from 'crypto';

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}