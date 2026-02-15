# Notification System Setup Guide

## What Was Implemented

✅ **Messages Page Fixed** - Now shows both Order and Conversation messages in unified view
✅ **Database Schema** - Notification and EmailLog models added
✅ **Email Service** - Resend integration with HTML email templates
✅ **Notification Service** - Helper functions for all notification types
✅ **Integration Complete** - All 6 flows now trigger notifications:
  - New offers from buyers → Admin notification
  - Admin replies to orders → Buyer notification
  - Buyer messages → Admin notification
  - Payment links sent → Buyer notification
  - Payment success → Buyer notification
  - Order status changes → Buyer notification
✅ **In-App Notifications** - Bell icon with dropdown for buyers
✅ **Full Notifications Page** - `/notifications` with mark-as-read

## Required Configuration

### 1. Resend API Setup

You need to add these environment variables to `.env.local` and Vercel:

```bash
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=notifications@yourdomain.com
ADMIN_EMAIL=your-admin-email@example.com
```

**Steps:**
1. Sign up at https://resend.com
2. Get your API key from the dashboard
3. Add a verified domain (or use their test domain for development)
4. Set the FROM email to match your verified domain
5. Set ADMIN_EMAIL to where you want to receive admin notifications

### 2. Deploy Database Migration

The migration has been created locally. Deploy it to production:

```bash
# In Vercel, the build will automatically run:
npx prisma migrate deploy
```

Or if you need to run it manually:
```bash
npx prisma migrate deploy
```

## What Still Needs to Be Done

### Admin Notification Bell (Optional Enhancement)

I've completed the buyer-side notification system. The admin notification bell is listed as a separate todo because:

1. **Admin notifications already work via email** - Admins get emails for:
   - New offers
   - New buyer messages

2. **To add admin notification bell**, you would need to:
   - Create `components/admin/AdminNotificationBell.tsx` (similar to buyer version)
   - Add it to `components/admin/AdminHeader.tsx`
   - Create admin auth system (currently no admin login/session)
   - Or query notifications where `buyerId IS NULL`

This is optional because email notifications already cover the admin use case.

## Testing Checklist

Once Resend is configured, test these flows:

- [ ] Buyer sends offer → Admin receives email
- [ ] Admin replies to order → Buyer receives email + in-app notification
- [ ] Buyer sends message → Admin receives email
- [ ] Admin sends payment link → Buyer receives email + in-app notification
- [ ] Buyer completes payment → Buyer receives email + in-app notification
- [ ] Admin changes order status → Buyer receives email + in-app notification
- [ ] Notification bell shows unread count
- [ ] Clicking notification marks it as read
- [ ] /notifications page shows all notifications
- [ ] Mark all as read works

## Notes

- **Email Templates**: Currently using simple HTML. For production, you can create React Email templates in `emails/templates/` for more sophisticated designs.
- **Notification Polling**: Currently polls every 30 seconds. For real-time, consider WebSockets or Server-Sent Events.
- **Admin Notifications**: Email-only for now. Add admin notification bell if needed.
