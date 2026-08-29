import { Resend } from 'resend';
import logger from '../utils/logger.js';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = new Resend(resendApiKey);

export class EmailService {
  static async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.parsnipt.dev';
    const verificationLink = `${frontendUrl}/verify?token=${verificationToken}`;

    // If API key is missing during local dev fallback, log a warning
    if (!resendApiKey) {
      logger.warn('RESEND_API_KEY is missing. Falling back to mock email log.');
      console.log(`[MOCK EMAIL] Verification link for ${email}: ${verificationLink}`);
      return;
    }

    try {
      const data = await resend.emails.send({
        from: 'Parsnipt <noreply@parsnipt.dev>', 
        to: [email],
        subject: 'Verify your Parsnipt Account',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Welcome to Parsnipt!</h2>
            <p>Thank you for registering. Please click the button below to verify your email address and activate your account:</p>
            <a href="${verificationLink}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Verify Email</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });

      logger.info(`Verification email sent successfully to ${email}: ${JSON.stringify(data)}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}: ${error}`);
      throw new Error('Failed to send verification email');
    }
  }
}

export default EmailService;