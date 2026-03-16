import CryptoJS from 'crypto-js';
// @ts-ignore
import * as base32 from 'base32.js';

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): number[] {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

/**
 * Validates a given 6-digit OTP against a user's secret
 * @param token The 6-digit OTP from Google Authenticator
 * @param secret The Base32 secret key for the given user
 * @returns boolean indicating if the token is valid
 */
export const validateOTP = (token: string, secret: string): boolean => {
  try {
    if (!token || !secret) return false;

    const timeStep = 30;
    const digits = 6;
    const windowTolerance = 1;

    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / timeStep);

    // Decode base32 secret
    const decodedSecret = new base32.Decoder({ type: 'rfc4648' })
      .write(secret.toUpperCase().replace(/=/g, ''))
      .finalize();
      
    const secretHex = bytesToHex(decodedSecret);
    const secretWords = CryptoJS.enc.Hex.parse(secretHex);

    for (let i = -windowTolerance; i <= windowTolerance; i++) {
      const currentCounter = counter + i;

      let counterHex = currentCounter.toString(16);
      while (counterHex.length < 16) {
        counterHex = '0' + counterHex; // Pad to 16 hex chars (8 bytes)
      }
      const counterWords = CryptoJS.enc.Hex.parse(counterHex);

      // Perform HMAC-SHA1
      const hmac = CryptoJS.HmacSHA1(counterWords, secretWords);
      const hmacHex = hmac.toString(CryptoJS.enc.Hex);
      const hmacBytes = hexToBytes(hmacHex);

      // Dynamic Truncation
      const offset = hmacBytes[hmacBytes.length - 1] & 0xf;
      const binary =
        ((hmacBytes[offset] & 0x7f) << 24) |
        ((hmacBytes[offset + 1] & 0xff) << 16) |
        ((hmacBytes[offset + 2] & 0xff) << 8) |
        (hmacBytes[offset + 3] & 0xff);

      const otp = (binary % Math.pow(10, digits)).toString().padStart(digits, '0');
      
      if (otp === token) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('OTP validation error:', error);
    return false;
  }
};
