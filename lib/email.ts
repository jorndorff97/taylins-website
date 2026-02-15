import { Resend } from 'resend';
import { prisma } from './prisma';
import { NotificationType } from '@prisma/client';

// Only initialize Resend if API key is available
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'notifications@yourdomain.com';

interface SendEmailParams {
  to: string;
  subject: string;
  template: NotificationType;
  data: any;
}

export async function sendEmail({ to, subject, template, data }: SendEmailParams) {
  // If Resend is not configured, skip email sending silently
  if (!resend || !resendApiKey) {
    console.log('[EMAIL] Skipping email send - Resend not configured:', { to, subject, template });
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // For now, send simple HTML emails
    // In production, you'll want to use React Email templates
    const html = generateEmailHTML(template, data);

    const result = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    // Log successful send
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        template,
        resendId: result.data?.id || null,
        status: 'SENT',
      },
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Log failed send
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        template,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return { success: false, error };
  }
}

function generateEmailHTML(template: NotificationType, data: any): string {
  const baseStyle = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  `;

  switch (template) {
    case 'NEW_OFFER':
      return `${baseStyle}
        <h2 style="color: #1e293b;">New Offer Received</h2>
        <p>A buyer has sent a new offer for <strong>${data.listingTitle}</strong></p>
        <p><strong>Quantity:</strong> ${data.quantity} pairs</p>
        ${data.pricePerPair ? `<p><strong>Offered Price:</strong> $${data.pricePerPair}/pair</p>` : ''}
        <p><strong>Message:</strong><br/>${data.message}</p>
        <a href="${data.link}" style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Offer</a>
      </div>`;

    case 'NEW_MESSAGE_BUYER':
      return `${baseStyle}
        <h2 style="color: #1e293b;">New Message from Seller</h2>
        <p>You have a new message about <strong>${data.listingTitle}</strong></p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;">${data.message}</p>
        </div>
        <a href="${data.link}" style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Conversation</a>
      </div>`;

    case 'NEW_MESSAGE_ADMIN':
      return `${baseStyle}
        <h2 style="color: #1e293b;">New Message from Buyer</h2>
        <p>A buyer sent a message about <strong>${data.listingTitle}</strong></p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;">${data.message}</p>
        </div>
        <a href="${data.link}" style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View & Reply</a>
      </div>`;

    case 'PAYMENT_LINK_SENT':
      return `${baseStyle}
        <h2 style="color: #1e293b;">Payment Link Ready</h2>
        <p>Your payment link is ready for <strong>${data.listingTitle}</strong></p>
        <p><strong>Amount:</strong> $${data.totalAmount} (${data.quantity} pairs @ $${data.pricePerPair}/pair)</p>
        <a href="${data.paymentLink}" style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">Complete Payment</a>
      </div>`;

    case 'PAYMENT_SUCCESS':
      return `${baseStyle}
        <h2 style="color: #10b981;">Payment Successful!</h2>
        <p>Your payment for <strong>${data.listingTitle}</strong> has been received.</p>
        <p><strong>Order #:</strong> ${data.orderId}</p>
        <p><strong>Amount:</strong> $${data.totalAmount}</p>
        <p>We'll process your order shortly and keep you updated.</p>
        <a href="${data.link}" style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Order</a>
      </div>`;

    case 'ORDER_STATUS_CHANGE':
      return `${baseStyle}
        <h2 style="color: #1e293b;">Order Status Updated</h2>
        <p>Your order for <strong>${data.listingTitle}</strong> has been updated.</p>
        <p><strong>Order #:</strong> ${data.orderId}</p>
        <p><strong>New Status:</strong> <span style="background: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 16px;">${data.newStatus}</span></p>
        <a href="${data.link}" style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Order</a>
      </div>`;

    default:
      return `${baseStyle}
        <h2 style="color: #1e293b;">Notification</h2>
        <p>${data.message}</p>
        ${data.link ? `<a href="${data.link}" style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Details</a>` : ''}
      </div>`;
  }
}
