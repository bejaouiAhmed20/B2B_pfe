import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

import { welcomeEmailTemplate } from '../utils/emailTemplates';

export const sendWelcomeEmail = async (userEmail: string, userName: string, password: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Bienvenue sur notre plateforme',
    html: welcomeEmailTemplate(userName, userEmail, password)
  };

  return emailTransporter.sendMail(mailOptions);
};