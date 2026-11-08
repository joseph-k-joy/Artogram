from django.db import models
from django.contrib.auth.models import User


class AuditEvent(models.Model):
    ACTION_CHOICES = [
        ('ARTWORK_REGISTERED', 'Artwork Registered'),
        ('PROVENANCE_CREATED', 'Provenance Created'),
        ('ATTRIBUTION_UPDATED', 'Attribution Updated'),
        ('PERMISSION_CHANGED', 'Permission Changed'),
        ('PERMISSION_REQUEST_SUBMITTED', 'Permission Request Submitted'),
        ('PERMISSION_REQUEST_DECIDED', 'Permission Request Decided'),
        ('COMMUNITY_REVIEW_SUBMITTED', 'Community Review Submitted'),
        ('VERIFICATION_STATUS_CHANGED', 'Verification Status Changed'),
        ('MISUSE_REPORT_SUBMITTED', 'Misuse Report Submitted'),
        ('MISUSE_REPORT_REVIEWED', 'Misuse Report Reviewed'),
        ('ADMIN_ACTION', 'Admin Action'),
        ('MODERATION_ACTION', 'Moderation Action'),
        ('USER_REGISTERED', 'User Registered'),
    ]

    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_actions')
    action = models.CharField(max_length=60, choices=ACTION_CHOICES)
    entity_type = models.CharField(max_length=60)
    entity_id = models.CharField(max_length=64)
    prev_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    description = models.TextField()
    ip_address = models.CharField(max_length=45, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        actor_name = self.actor.username if self.actor else 'System'
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {actor_name} -> {self.action} on {self.entity_type} ({self.entity_id})"
