from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('registered', 'Registered User'),
        ('artist', 'Artist'),
        ('moderator', 'Moderator'),
        ('admin', 'Administrator'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    avatar_url = models.CharField(max_length=500, blank=True, default='')
    location = models.CharField(max_length=150, blank=True)
    primary_art_form = models.CharField(max_length=150, blank=True)
    website_link = models.URLField(blank=True, max_length=300)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='registered')
    is_verified_artist = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.display_name or self.user.username} (@{self.user.username}) - {self.role}"

    @property
    def effective_avatar(self):
        if self.avatar:
            try:
                return self.avatar.url
            except Exception:
                pass
        if self.avatar_url:
            return self.avatar_url
        return f"https://api.dicebear.com/7.x/bottts/svg?seed={self.user.username}"


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following_relations')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follower_relations')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['follower', 'following'], name='unique_user_follow')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        role = 'admin' if instance.is_superuser else 'registered'
        UserProfile.objects.create(
            user=instance,
            display_name=instance.get_full_name() or instance.username,
            role=role
        )
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()
