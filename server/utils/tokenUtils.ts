import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  email: string;
  est_admin: boolean;
}

export const createToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};