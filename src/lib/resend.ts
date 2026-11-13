import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => htmlEscapes[character]);
}

export async function sendVerificationEmail(to: string, code: string, name?: string): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return { success: false, error: 'Resend API key not configured' };
  }

  try {
    const greeting = name ? `Hello ${name},` : 'Hello,';
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'BookHaven: Verify Your Email Address',
      text: `${greeting}\n\nYour 6-digit verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nHappy reading,\nThe BookHaven Team`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #FAFAF8; border: 1px solid #EDEAE3; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-family: Georgia, serif; color: #1C1917; font-size: 26px; margin: 0 0 6px 0;">BookHaven</h1>
            <p style="color: #78716C; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Independent Bookstore</p>
          </div>
          
          <div style="background: #FFFFFF; border-radius: 8px; padding: 28px; border: 1px solid #EDEAE3;">
            <p style="color: #1C1917; font-size: 15px; margin-top: 0;">${escapeHtml(greeting)}</p>
            <p style="color: #57534E; font-size: 14px; line-height: 1.6;">
              Thank you for joining BookHaven. Please enter the verification code below to verify your email address and unlock cart checkout:
            </p>
            
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 0.25em; color: #3D5A3E; background: #EBF2EB; padding: 12px 28px; border-radius: 8px; border: 1px solid #C8D8C5;">
                ${code}
              </span>
            </div>
            
            <p style="color: #A8A29E; font-size: 12px; margin-bottom: 0; text-align: center;">
              This code will expire in 10 minutes. If you did not request this, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });
    if (error) {
      console.error('[Resend Error - sendVerificationEmail]:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown email delivery error';
    console.error('[Resend Error - sendVerificationEmail]:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(to: string, code: string, name?: string): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    return { success: false, error: 'Resend API key not configured' };
  }

  try {
    const greeting = name ? `Hello ${name},` : 'Hello,';
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'BookHaven: Password Reset OTP',
      text: `${greeting}\n\nYour password reset code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request a password reset, you can safely ignore this email.`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; background: #FAFAF8; border: 1px solid #EDEAE3; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-family: Georgia, serif; color: #1C1917; font-size: 26px; margin: 0 0 6px 0;">BookHaven</h1>
            <p style="color: #78716C; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 0.05em;">Security Verification</p>
          </div>
          
          <div style="background: #FFFFFF; border-radius: 8px; padding: 28px; border: 1px solid #EDEAE3;">
            <p style="color: #1C1917; font-size: 15px; margin-top: 0;">${escapeHtml(greeting)}</p>
            <p style="color: #57534E; font-size: 14px; line-height: 1.6;">
              We received a request to reset the password for your BookHaven account. Use the one-time code below to proceed:
            </p>
            
            <div style="text-align: center; margin: 28px 0;">
              <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 0.25em; color: #7B5E3A; background: #FDF0E4; padding: 12px 28px; border-radius: 8px; border: 1px solid #EADBCC;">
                ${code}
              </span>
            </div>
            
            <p style="color: #A8A29E; font-size: 12px; margin-bottom: 0; text-align: center;">
              This code will expire in 10 minutes. If you did not make this request, your account remains secure.
            </p>
          </div>
        </div>
      `,
    });
    if (error) {
      console.error('[Resend Error - sendPasswordResetEmail]:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown email delivery error';
    console.error('[Resend Error - sendPasswordResetEmail]:', error);
    return { success: false, error };
  }
}
