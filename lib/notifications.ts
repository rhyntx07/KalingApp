// lib/notifications.ts
//
// The shape returned by GET /notifications/mine/ (notifications.serializers.
// NotificationItemSerializer) and the small helpers the bell in the header
// needs. An admin (is_staff) account gets these the same way a mother does --
// see notifications.views.MyNotificationsView, which scopes to request.user
// with no role check -- the only thing new here is that articles/views.py
// now actually writes a row for every is_staff owner when a comment gets
// reported, where previously nothing ever did.

export interface AppNotification {
  id: number
  title: string
  description: string
  category: 'Reminders' | 'Articles' | 'Bookings'
  created_at: string
  is_read: boolean
}

export function formatNotificationDate(createdAt: string): string {
  return new Date(createdAt).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
