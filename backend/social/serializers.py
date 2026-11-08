from rest_framework import serializers
from django.contrib.auth.models import User
from .models import SocialPost, Like, Comment, Bookmark, InternalShare
from artworks.serializers import ArtworkListSerializer


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    display_name = serializers.CharField(source='user.profile.display_name', read_only=True)
    avatar_url = serializers.CharField(source='user.profile.effective_avatar', read_only=True)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'post',
            'user',
            'username',
            'display_name',
            'avatar_url',
            'text',
            'is_hidden',
            'is_owner',
            'created_at',
        ]
        read_only_fields = ['user', 'is_hidden', 'created_at']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user or request.user.is_staff
        return False


class SocialPostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_display_name = serializers.CharField(source='author.profile.display_name', read_only=True)
    author_avatar = serializers.CharField(source='author.profile.effective_avatar', read_only=True)
    author_role = serializers.CharField(source='author.profile.role', read_only=True)

    # Artwork details
    artwork_id = serializers.IntegerField(source='artwork.id', read_only=True)
    artwork_title = serializers.CharField(source='artwork.title', read_only=True)
    artwork_image = serializers.CharField(source='artwork.effective_image', read_only=True)
    art_category = serializers.CharField(source='artwork.art_category', read_only=True)
    cultural_origin = serializers.CharField(source='artwork.cultural_origin', read_only=True)
    provenance_id = serializers.CharField(source='artwork.provenance.provenance_id', read_only=True)
    verification_status = serializers.CharField(source='artwork.provenance.verification_status', read_only=True)
    verification_badge = serializers.CharField(source='artwork.provenance.verification_badge_label', read_only=True)

    # Engagement
    like_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = SocialPost
        fields = [
            'id',
            'artwork',
            'artwork_id',
            'artwork_title',
            'artwork_image',
            'art_category',
            'cultural_origin',
            'provenance_id',
            'verification_status',
            'verification_badge',
            'author',
            'author_username',
            'author_display_name',
            'author_avatar',
            'author_role',
            'caption',
            'visibility',
            'created_at',
            'like_count',
            'comment_count',
            'is_liked',
            'is_bookmarked',
        ]
        read_only_fields = ['author', 'created_at']

    def get_like_count(self, obj):
        return obj.likes.count()

    def get_comment_count(self, obj):
        return obj.comments.filter(is_hidden=False).count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(post=obj, user=request.user).exists()
        return False

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(user=request.user, artwork=obj.artwork).exists()
        return False


class BookmarkSerializer(serializers.ModelSerializer):
    artwork = ArtworkListSerializer(read_only=True)

    class Meta:
        model = Bookmark
        fields = ['id', 'artwork', 'created_at']


class InternalShareSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    recipient_username = serializers.CharField(source='recipient.username', read_only=True)
    artwork_title = serializers.CharField(source='artwork.title', read_only=True)
    artwork_image = serializers.CharField(source='artwork.effective_image', read_only=True)
    provenance_id = serializers.CharField(source='artwork.provenance.provenance_id', read_only=True)

    class Meta:
        model = InternalShare
        fields = [
            'id',
            'sender',
            'sender_username',
            'recipient',
            'recipient_username',
            'artwork',
            'artwork_title',
            'artwork_image',
            'provenance_id',
            'note',
            'created_at',
        ]
        read_only_fields = ['sender', 'created_at']
