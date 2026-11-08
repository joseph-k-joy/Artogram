from django.db import models
from django.contrib.auth.models import User
from artworks.models import Artwork


class MisuseReport(models.Model):
    REPORT_TYPE_CHOICES = [
        ('missing_attribution', 'Missing Attribution or Source Omission'),
        ('unauthorised_commercial_use', 'Unauthorised Commercial Use'),
        ('misleading_ownership_claim', 'Misleading Ownership or Origin Claim'),
        ('impersonation', 'Impersonation of Cultural Creator/Group'),
        ('unauthorised_modification', 'Unauthorised Modification or Derivation'),
        ('cultural_misrepresentation', 'Cultural Misrepresentation or Sacrilege'),
        ('other', 'Other Suspected Misuse'),
    ]

    STATUS_CHOICES = [
        ('submitted', 'SUBMITTED'),
        ('under_review', 'UNDER REVIEW'),
        ('action_taken', 'ACTION TAKEN'),
        ('resolved', 'RESOLVED'),
        ('rejected', 'REJECTED'),
    ]

    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='misuse_reports')
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='filed_reports')
    report_type = models.CharField(max_length=40, choices=REPORT_TYPE_CHOICES)
    suspected_external_url = models.CharField(max_length=500, blank=True)
    description = models.TextField()

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='submitted')
    admin_notes = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_reports')
    reviewed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Report #{self.id} on '{self.artwork.title}' by {self.reporter.username} [{self.status}]"


class ReportEvidence(models.Model):
    report = models.ForeignKey(MisuseReport, on_delete=models.CASCADE, related_name='evidence_items')
    file = models.FileField(upload_to='report_evidence/', null=True, blank=True)
    file_url = models.CharField(max_length=500, blank=True, default='')
    description = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence for Report #{self.report_id}: {self.description or 'File'}"
