import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface TokenPayload {
  id: string;
  email: string;
  est_admin: boolean;
}

export const createAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';

  // Hardcode the expiration time to avoid type issues
  return jwt.sign(payload, secret as Secret, { expiresIn: '24h' });
};

export const createRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

  // Hardcode the expiration time to avoid type issues
  return jwt.sign(payload, secret as Secret, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    if (!token || token.trim() === '') {
      console.error('Access token verification error: Token is empty or undefined');
      return null;
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    console.log('Verifying token with secret:', secret.substring(0, 5) + '...');

    const decoded = jwt.verify(token, secret as Secret) as TokenPayload;
    console.log('Token verified successfully, payload:', {
      id: decoded.id,
      email: decoded.email,
      est_admin: decoded.est_admin
    });

    return decoded;
  } catch (error) {
    console.error('Access token verification error:', error);
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    return jwt.verify(token, secret as Secret) as TokenPayload;
  } catch (error) {
    console.error('Refresh token verification error:', error);
    return null;
  }
};

// For backward compatibility
export const createToken = createAccessToken;