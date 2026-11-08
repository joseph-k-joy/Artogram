from django.db import models
from django.contrib.auth.models import User


class Artwork(models.Model):
    CLASSIFICATION_CHOICES = [
        ('traditional', 'Traditional Cultural Expression'),
        ('contemporary', 'Contemporary Artistic Expression'),
        ('hybrid', 'Fusion / Hybrid Cultural Form'),
    ]

    DECLARATION_CHOICES = [
        ('created_by_me', 'I created this artwork'),
        ('authorised_representative', 'I am an authorised cultural representative'),
        ('submitted_with_permission', 'I am submitting this with permission from the creator/lineage'),
        ('documenting_community_work', 'I am documenting a community-held cultural work'),
        ('other', 'Other documented relationship'),
    ]

    STATUS_CHOICES = [
        ('registered', 'Registered'),
        ('pending_review', 'Pending Review'),
        ('community_reviewed', 'Community Reviewed'),
        ('verification_rejected', 'Verification Rejected'),
        ('report_under_review', 'Report Under Review'),
        ('archived', 'Archived'),
    ]

    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('restricted', 'Restricted'),
    ]

    CATEGORY_CHOICES = [
        ('Indigenous Folk Art', 'Indigenous Folk Art'),
        ('Textile & Weaving', 'Textile & Weaving'),
        ('Traditional Pottery & Ceramics', 'Traditional Pottery & Ceramics'),
        ('Calligraphy & Manuscript Art', 'Calligraphy & Manuscript Art'),
        ('Sculpture & Woodcarving', 'Sculpture & Woodcarving'),
        ('Tribal & Ritual Painting', 'Tribal & Ritual Painting'),
        ('Metal Craft & Filigree', 'Metal Craft & Filigree'),
        ('Contemporary Cultural Art', 'Contemporary Cultural Art'),
        ('Mural & Architecture', 'Mural & Architecture'),
        ('Jewelry & Adornment', 'Jewelry & Adornment'),
        ('Other', 'Other Cultural Expression'),
    ]

    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to='artworks/', null=True, blank=True)
    image_url = models.CharField(max_length=500, blank=True, default='')
    description = models.TextField()
    art_category = models.CharField(max_length=100, choices=CATEGORY_CHOICES, default='Indigenous Folk Art')
    tags = models.CharField(max_length=255, blank=True, help_text="Comma-separated tags")

    # Creator & submission attribution
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_artworks')
    creator_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_artworks')
    original_creator_name = models.CharField(max_length=150)

    # Cultural & geographic metadata
    cultural_origin = models.CharField(max_length=200)
    geographic_region = models.CharField(max_length=200, blank=True)
    language = models.CharField(max_length=100, blank=True)
    cultural_background = models.TextField(blank=True)
    historical_context = models.TextField(blank=True)
    classification = models.CharField(max_length=50, choices=CLASSIFICATION_CHOICES, default='traditional')

    # Creation period & sourcing
    creation_period = models.CharField(max_length=100, blank=True)
    information_source = models.TextField(blank=True)

    # Attribution requirements
    required_credit = models.TextField(blank=True)
    preferred_attribution_format = models.TextField(blank=True)

    # Legal / community declaration
    declaration_type = models.CharField(max_length=50, choices=DECLARATION_CHOICES, default='created_by_me')
    declaration_details = models.TextField(blank=True)

    # Visibility & state
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='registered')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} by {self.original_creator_name} ({self.cultural_origin})"

    @property
    def effective_image(self):
        if self.image:
            try:
                return self.image.url
            except Exception:
                pass
        return self.image_url or "https://picsum.photos/seed/artogram/800/800"


class ArtworkContributor(models.Model):
    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='contributors')
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=100)
    registered_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='contributions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.role}) - {self.artwork.title}"
