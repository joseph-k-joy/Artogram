from django.db import models
from django.contrib.auth.models import User
from artworks.models import Artwork


class ArtworkProvenance(models.Model):
    STATUS_CHOICES = [
        ('registered', 'User-Submitted Registration'),
        ('pending_review', 'Pending Community/Admin Review'),
        ('community_reviewed', 'Community Verified & Reviewed'),
        ('verification_rejected', 'Verification Rejected'),
        ('report_under_review', 'Under Report Review'),
    ]

    artwork = models.OneToOneField(Artwork, on_delete=models.CASCADE, related_name='provenance')
    provenance_id = models.CharField(max_length=40, unique=True, db_index=True)
    sha256_hash = models.CharField(max_length=64, help_text="SHA-256 byte-level cryptographic fingerprint of uploaded artwork")
    original_filename = models.CharField(max_length=255, blank=True)
    file_size_bytes = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=100, default='image/jpeg')
    
    # QR verification
    qr_code_image = models.ImageField(upload_to='qrcodes/', null=True, blank=True)
    qr_code_data_url = models.TextField(blank=True, help_text="Data URI or media URL of QR code")
    qr_target_url = models.CharField(max_length=300)

    # Attribution & ownership record
    registered_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registered_provenances')
    registered_at = models.DateTimeField(auto_now_add=True)
    verification_status = models.CharField(max_length=40, choices=STATUS_CHOICES, default='registered')
    verification_badge_label = models.CharField(max_length=100, default='Self-Registered Cultural Work')
    review_notes = models.TextField(blank=True)

    disclaimer = models.TextField(
        default="Artogram records artwork information and attribution claims. Registration and QR codes do not independently establish legal ownership or prove authorship."
    )

    class Meta:
        ordering = ['-registered_at']

    def __str__(self):
        return f"Provenance [{self.provenance_id}] for {self.artwork.title}"
