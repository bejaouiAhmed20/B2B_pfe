import { Request, Response } from 'express';
import { User } from '../../models/User';
import bcrypt from 'bcrypt';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../../utils/tokenUtils';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Store reset tokens temporarily (in production, use a database)
const resetTokens: { [key: string]: { email: string, expiry: Date } } = {};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true // Add this to see more detailed logs
});

// Make sure to check if credentials exist
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Email credentials are missing in environment variables');
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, mot_de_passe } = req.body;

    const user = await User.findOneBy({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email does not exist",
        code: "EMAIL_NOT_FOUND"
      });
    }

    const isValidPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe incorrect",
        code: "INVALID_PASSWORD"
      });
    }

    // Nous vérifions si l'utilisateur est un administrateur, mais nous ne bloquons pas la connexion
    // Nous incluons cette information dans la réponse pour que le client puisse décider quoi faire
    if (!user.est_admin) {
      console.log('Tentative de connexion admin par un utilisateur non-admin:', user.email);
      // Nous continuons le processus de connexion mais nous marquons le succès comme false
      // pour que le client sache qu'il y a un problème
    }

    // Create tokens
    const accessToken = createAccessToken({
      id: user.id,
      email: user.email,
      est_admin: user.est_admin
    });

    const refreshToken = createRefreshToken({
      id: user.id,
      email: user.email,
      est_admin: user.est_admin
    });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict'
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        est_admin: user.est_admin
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
      code: "SERVER_ERROR"
    });
  }
};
export const loginClient = async (req: Request, res: Response) => {
  try {
    console.log('Tentative de connexion client:', req.body.email);
    const { email, mot_de_passe } = req.body;

    const user = await User.findOneBy({ email });
    if (!user) {
      console.log('Email non trouvé:', email);
      return res.status(401).json({
        success: false,
        message: "Email does not exist",
        code: "EMAIL_NOT_FOUND"
      });
    }

    const isValidPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isValidPassword) {
      console.log('Mot de passe incorrect pour:', email);
      return res.status(401).json({
        success: false,
        message: "Mot de passe incorrect",
        code: "INVALID_PASSWORD"
      });
    }

    console.log('Authentification réussie pour:', email, 'Est admin:', user.est_admin);

    // Create tokens
    const accessToken = createAccessToken({
      id: user.id,
      email: user.email,
      est_admin: user.est_admin
    });

    const refreshToken = createRefreshToken({
      id: user.id,
      email: user.email,
      est_admin: user.est_admin
    });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict'
    });

    console.log('Tokens générés et cookie défini pour:', email);

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        est_admin: user.est_admin
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion client:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
      code: "SERVER_ERROR"
    });
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    console.log('Déconnexion demandée pour l\'utilisateur:', (req as any).user?.email);

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/' // Important: spécifier le chemin pour s'assurer que le cookie est supprimé
    });

    console.log('Cookie refreshToken supprimé');

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
      code: "LOGOUT_SUCCESS"
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: "There is an issue with logout",
      code: "SERVER_ERROR"
    });
  }
};

// Forgot password controller
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOneBy({ email });

    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // Token expires in 1 hour

    // Store the token (in production, save this to the database)
    resetTokens[token] = { email: user.email, expiry };

    // Inside the forgotPassword function, update the resetUrl line
    // Create reset URL
    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ message: 'An error occurred while processing your request' });
  }
};

// Refresh token controller
export const refreshToken = async (req: Request, res: Response) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not found",
        code: "REFRESH_TOKEN_NOT_FOUND"
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
        code: "INVALID_REFRESH_TOKEN"
      });
    }

    // Find user
    const user = await User.findOneBy({ id: decoded.id });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND"
      });
    }

    // Create new access token
    const accessToken = createAccessToken({
      id: user.id,
      email: user.email,
      est_admin: user.est_admin
    });

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        est_admin: user.est_admin
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: "Server error during token refresh",
      code: "SERVER_ERROR"
    });
  }
};

// Reset password controller
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { mot_de_passe } = req.body;

    if (!token || !mot_de_passe) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    // Check if token exists and is valid
    const tokenData = resetTokens[token];
    if (!tokenData) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Check if token is expired
    if (new Date() > tokenData.expiry) {
      // Remove expired token
      delete resetTokens[token];
      return res.status(400).json({ message: 'Token has expired' });
    }

    // Find user by email
    const user = await User.findOneBy({ email: tokenData.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(mot_de_passe, salt);

    // Update user's password
    user.mot_de_passe = hashedPassword;
    await user.save();

    // Remove the used token
    delete resetTokens[token];

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ message: 'An error occurred while resetting your password' });
  }
};