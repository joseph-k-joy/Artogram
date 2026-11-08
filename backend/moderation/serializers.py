from rest_framework import serializers
from .models import ModerationLog
from django.contrib.auth.models import User
from artworks.models import Artwork
from social.models import Comment


class ModerationLogSerializer(serializers.ModelSerializer):
    moderator_username = serializers.CharField(source='moderator.username', read_only=True)

    class Meta:
        model = ModerationLog
        fields = [
            'id',
            'moderator',
            'moderator_username',
            'target_type',
            'target_id',
            'action_taken',
            'reason',
            'created_at',
        ]


class AdminCommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    post_title = serializers.CharField(source='post.artwork.title', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'post_title', 'user', 'username', 'text', 'is_hidden', 'created_at']
