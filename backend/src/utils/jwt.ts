/**
 * JWT token generation and verification
 */

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRATION = '7d'; // 7 days

interface JWTPayload {
  userId: string;
  hexCode: string;
  iat: number;
  exp: number;
}

/**
 * Generate a JWT token for a user
 */
export function generateJWT(userId: string, hexCode: string): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (7 * 24 * 60 * 60); // 7 days from now

  const payload: JWTPayload = {
    userId,
    hexCode,
    iat: now,
    exp,
  };

  // For now, using a simple base64 encoding
  // In production, use a proper JWT library like jsonwebtoken
  const token = Buffer.from(JSON.stringify(payload)).toString('base64');
  return token;
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWT(token: string): JWTPayload {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      throw new Error('Token expired');
    }

    return decoded as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
