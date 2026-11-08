from django.db import models
from django.contrib.auth.models import User
from artworks.models import Artwork


class ArtworkPermission(models.Model):
    artwork = models.OneToOneField(Artwork, on_delete=models.CASCADE, related_name='permissions')
    viewing_allowed = models.BooleanField(default=True)
    downloading_allowed = models.BooleanField(default=False)
    educational_use_allowed = models.BooleanField(default=True)
    commercial_use_allowed = models.BooleanField(default=False)
    modification_allowed = models.BooleanField(default=False)
    redistribution_allowed = models.BooleanField(default=False)
    attribution_required = models.BooleanField(default=True)
    additional_conditions = models.TextField(blank=True, help_text="Specific cultural covenants, community guidelines or licensing terms")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Permissions for {self.artwork.title}"


class PermissionRequest(models.Model):
    USAGE_CHOICES = [
        ('Educational Exhibition', 'Educational Exhibition'),
        ('Academic Research & Thesis', 'Academic Research & Thesis'),
        ('Documentary & Cultural Media', 'Documentary & Cultural Media'),
        ('Commercial Publication', 'Commercial Publication'),
        ('Digital / Online Project', 'Digital / Online Project'),
        ('Community Archiving', 'Community Archiving'),
        ('Other', 'Other Specialized Use'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending Artist Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('clarification_requested', 'More Information Requested'),
    ]

    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='permission_requests')
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requested_permissions')
    intended_usage = models.CharField(max_length=60, choices=USAGE_CHOICES, default='Educational Exhibition')
    is_commercial = models.BooleanField(default=False)
    description = models.TextField(help_text="Detailed description of proposed use")
    expected_platform = models.CharField(max_length=200, blank=True)
    additional_info = models.TextField(blank=True)
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    artist_response_note = models.TextField(blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Request by {self.requester.username} for '{self.artwork.title}' [{self.status}]"
