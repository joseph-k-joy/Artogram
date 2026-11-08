from django.db import models
from django.contrib.auth.models import User


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('follow', 'New Follower'),
        ('like', 'Artwork Liked'),
        ('comment', 'New Comment'),
        ('permission_request', 'Permission Requested'),
        ('permission_decision', 'Permission Request Decision'),
        ('moderation_update', 'Artwork Moderation Update'),
        ('report_status', 'Report Status Update'),
        ('community_review', 'Community Verification Update'),
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_notifications')
    notification_type = models.CharField(max_length=40, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=150)
    message = models.TextField()
    target_url = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification to {self.recipient.username}: {self.title}"


def notify_user(recipient, sender, notification_type, title, message, target_url=""):
    """
    Helper to create notifications for events.
    """
    if recipient == sender:
        return None
    return Notification.objects.create(
        recipient=recipient,
        sender=sender,
        notification_type=notification_type,
        title=title,
        message=message,
        target_url=target_url,
    )
