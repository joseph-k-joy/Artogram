from django.db import models
from django.contrib.auth.models import User
from artworks.models import Artwork


class Community(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    geographic_region = models.CharField(max_length=200)
    cultural_tradition = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Communities'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.cultural_tradition})"


class CommunityReviewer(models.Model):
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='reviewers')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='community_reviewer_roles')
    title_or_role = models.CharField(max_length=150, help_text="e.g. Cultural Elder, Master Artisan, Guild Trustee")
    is_active = models.BooleanField(default=True)
    appointed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['community', 'user'], name='unique_community_reviewer')
        ]

    def __str__(self):
        return f"{self.user.username} - {self.title_or_role} ({self.community.name})"


class CommunityVerification(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved / Verified'),
        ('rejected', 'Rejected'),
        ('more_info_requested', 'More Information Requested'),
    ]

    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='community_verifications')
    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name='verifications')
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_verifications')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    comments = models.TextField(blank=True)
    evidence_reference = models.TextField(blank=True, help_text="Fieldwork reference, lineage knowledge, archival catalog or elder testimony")
    reviewed_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Verification for '{self.artwork.title}' by {self.community.name} [{self.status}]"
