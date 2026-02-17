import { prisma } from './prisma';
import { sendEmail } from './email';
import { NotificationType } from '@prisma/client';

interface CreateNotificationParams {
  userId?: string | null;
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
  userId,
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
        userId: userId || null,
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
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        });
        recipientEmail = user?.email || null;
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
    userId: null, // Admin notification
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

export async function notifyNewMessageToUser({
  userId,
  orderId,
  conversationId,
  listingTitle,
  message,
}: {
  userId: string;
  orderId?: number;
  conversationId?: number;
  listingTitle: string;
  message: string;
}) {
  return createNotification({
    userId,
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
    userId: null, // Admin notification
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
  userId,
  orderId,
  listingTitle,
  quantity,
  pricePerPair,
  totalAmount,
  paymentLink,
}: {
  userId: string;
  orderId: number;
  listingTitle: string;
  quantity: number;
  pricePerPair: number;
  totalAmount: number;
  paymentLink: string;
}) {
  return createNotification({
    userId,
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
  userId,
  orderId,
  listingTitle,
  totalAmount,
}: {
  userId: string;
  orderId: number;
  listingTitle: string;
  totalAmount: number;
}) {
  return createNotification({
    userId,
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
  userId,
  orderId,
  listingTitle,
  newStatus,
}: {
  userId: string;
  orderId: number;
  listingTitle: string;
  newStatus: string;
}) {
  return createNotification({
    userId,
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
