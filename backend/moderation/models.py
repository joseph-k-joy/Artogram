from django.db import models
from django.contrib.auth.models import User


class ModerationLog(models.Model):
    ACTION_CHOICES = [
        ('hide_comment', 'Hide Inappropriate Comment'),
        ('unhide_comment', 'Restore Comment'),
        ('flag_artwork', 'Flag Artwork for Misleading Attribution'),
        ('approve_artwork', 'Approve Artwork Registration'),
        ('reject_artwork', 'Reject Artwork Verification'),
        ('warn_user', 'Issue Warning to User'),
        ('suspend_user', 'Suspend User Account'),
    ]

    moderator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='moderation_actions')
    target_type = models.CharField(max_length=40) # 'comment', 'artwork', 'social_post', 'user'
    target_id = models.CharField(max_length=64)
    action_taken = models.CharField(max_length=40, choices=ACTION_CHOICES)
    reason = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.moderator.username} -> {self.action_taken} on {self.target_type}:{self.target_id}"
