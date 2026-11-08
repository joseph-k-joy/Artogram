from django.db import models
from django.contrib.auth.models import User
from artworks.models import Artwork


class SocialPost(models.Model):
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('followers', 'Followers Only'),
        ('restricted', 'Restricted'),
    ]

    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='posts')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='social_posts')
    caption = models.TextField(blank=True)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Post by {self.author.username} featuring '{self.artwork.title}'"

    @property
    def like_count(self):
        return self.likes.count()

    @property
    def comment_count(self):
        return self.comments.filter(is_hidden=False).count()


class Like(models.Model):
    post = models.ForeignKey(SocialPost, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='post_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['post', 'user'], name='unique_post_like')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} liked post {self.post_id}"


class Comment(models.Model):
    post = models.ForeignKey(SocialPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_comments')
    text = models.TextField()
    is_hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on post {self.post_id}: {self.text[:30]}"


class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookmarks')
    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='bookmarked_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'artwork'], name='unique_user_artwork_bookmark')
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} bookmarked {self.artwork.title}"


class InternalShare(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_shares')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_shares')
    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name='shares')
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.sender.username} shared {self.artwork.title} with {self.recipient.username}"
