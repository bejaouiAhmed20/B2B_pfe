import { Request, Response } from 'express';
import { User } from '../../models/User';
import bcrypt from 'bcrypt';
import { createToken } from '../../utils/tokenUtils';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Store reset tokens temporarily (in production, use a database)
const resetTokens: { [key: string]: { email: string, expiry: Date } } = {};

// Configure nodemailer transporter
// Update the nodemailer transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true // Add this to see more detailed logs
});

export const login = async (req: Request, res: Response) => {
  try {
    const { email, mot_de_passe } = req.body;

    const user = await User.findOneBy({ email });
    if (!user) {
      return res.status(401).json({ message: "Email does not exist" });
    }

    const isValidPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isValidPassword) {
      return res.status(401).json({ message: "mot de passe incorrect" });
    }

    if (!user.est_admin) {
      return res.status(403).json({ message: "Accès non autorisé" });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      est_admin: user.est_admin
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        est_admin: user.est_admin
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};
export const loginClient = async (req: Request, res: Response) => {
  try {
    const { email, mot_de_passe } = req.body;

    const user = await User.findOneBy({ email });
    if (!user) {
      return res.status(401).json({ message: "Email does not exist" });
    }

    const isValidPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isValidPassword) {
      return res.status(401).json({ message: "mot de passe incorrect" });
    }

    // No admin check for client login

    const token = createToken({
      id: user.id,
      email: user.email,
      est_admin: user.est_admin
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        est_admin: user.est_admin
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    // Since we're using JWT, we don't need to do anything server-side
    // The client will handle removing the token
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue with logout" });
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