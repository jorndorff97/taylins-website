import { prisma } from './prisma';
import { sendEmail } from './email';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  buyerId?: number | null;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  orderId?: number;
  conversationId?: number;
  sendEmailNotification?: boolean;
  emailData?: any;
}

export async function createNotification({
  buyerId,
  type,
  title,
  message,
  link,
  orderId,
  conversationId,
  sendEmailNotification = true,
  emailData = {},
}: CreateNotificationParams) {
  try {
    // Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        buyerId: buyerId || null,
        type,
        title,
        message,
        link: link || null,
        orderId: orderId || null,
        conversationId: conversationId || null,
      },
    });

    // Send email notification if enabled
    if (sendEmailNotification) {
      let recipientEmail: string | null = null;
      
      // Get recipient email
      if (buyerId) {
        const buyer = await prisma.buyer.findUnique({
          where: { id: buyerId },
          select: { email: true },
        });
        recipientEmail = buyer?.email || null;
      } else {
        // Admin notification - get admin email from env or database
        recipientEmail = process.env.ADMIN_EMAIL || null;
      }

      if (recipientEmail) {
        await sendEmail({
          to: recipientEmail,
          subject: title,
          template: type,
          data: {
            ...emailData,
            message,
            link: link ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${link}` : undefined,
          },
        });
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Helper functions for specific notification types

export async function notifyNewOffer({
  conversationId,
  listingTitle,
  quantity,
  pricePerPair,
  message,
}: {
  conversationId: number;
  listingTitle: string;
  quantity: number;
  pricePerPair?: number;
  message: string;
}) {
  return createNotification({
    buyerId: null, // Admin notification
    type: 'NEW_OFFER',
    title: 'New Offer Received',
    message: `New offer for ${listingTitle}: ${quantity} pairs`,
    link: `/admin/conversations/${conversationId}`,
    conversationId,
    emailData: {
      listingTitle,
      quantity,
      pricePerPair,
      message,
    },
  });
}

export async function notifyNewMessageToBuyer({
  buyerId,
  orderId,
  conversationId,
  listingTitle,
  message,
}: {
  buyerId: number;
  orderId?: number;
  conversationId?: number;
  listingTitle: string;
  message: string;
}) {
  return createNotification({
    buyerId,
    type: 'NEW_MESSAGE_BUYER',
    title: 'New Message from Seller',
    message: `New message about ${listingTitle}`,
    link: orderId ? `/order/${orderId}` : conversationId ? `/messages/${conversationId}` : undefined,
    orderId,
    conversationId,
    emailData: {
      listingTitle,
      message,
    },
  });
}

export async function notifyNewMessageToAdmin({
  orderId,
  conversationId,
  listingTitle,
  message,
}: {
  orderId?: number;
  conversationId?: number;
  listingTitle: string;
  message: string;
}) {
  return createNotification({
    buyerId: null, // Admin notification
    type: 'NEW_MESSAGE_ADMIN',
    title: 'New Message from Buyer',
    message: `New message about ${listingTitle}`,
    link: orderId ? `/admin/orders/${orderId}` : conversationId ? `/admin/conversations/${conversationId}` : undefined,
    orderId,
    conversationId,
    emailData: {
      listingTitle,
      message,
    },
  });
}

export async function notifyPaymentLinkSent({
  buyerId,
  orderId,
  listingTitle,
  quantity,
  pricePerPair,
  totalAmount,
  paymentLink,
}: {
  buyerId: number;
  orderId: number;
  listingTitle: string;
  quantity: number;
  pricePerPair: number;
  totalAmount: number;
  paymentLink: string;
}) {
  return createNotification({
    buyerId,
    type: 'PAYMENT_LINK_SENT',
    title: 'Payment Link Ready',
    message: `Your payment link for ${listingTitle} is ready`,
    link: `/order/${orderId}`,
    orderId,
    emailData: {
      listingTitle,
      quantity,
      pricePerPair,
      totalAmount,
      paymentLink,
    },
  });
}

export async function notifyPaymentSuccess({
  buyerId,
  orderId,
  listingTitle,
  totalAmount,
}: {
  buyerId: number;
  orderId: number;
  listingTitle: string;
  totalAmount: number;
}) {
  return createNotification({
    buyerId,
    type: 'PAYMENT_SUCCESS',
    title: 'Payment Successful',
    message: `Your payment for ${listingTitle} was successful`,
    link: `/order/${orderId}`,
    orderId,
    emailData: {
      listingTitle,
      orderId,
      totalAmount,
    },
  });
}

export async function notifyOrderStatusChange({
  buyerId,
  orderId,
  listingTitle,
  newStatus,
}: {
  buyerId: number;
  orderId: number;
  listingTitle: string;
  newStatus: string;
}) {
  return createNotification({
    buyerId,
    type: 'ORDER_STATUS_CHANGE',
    title: 'Order Status Updated',
    message: `Your order for ${listingTitle} is now ${newStatus}`,
    link: `/order/${orderId}`,
    orderId,
    emailData: {
      listingTitle,
      orderId,
      newStatus,
    },
  });
}
