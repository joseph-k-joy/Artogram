from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Follow


class ProfileDetailSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    avatar_url = serializers.CharField(source='effective_avatar', read_only=True)
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    artworks_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'user_id',
            'username',
            'display_name',
            'bio',
            'avatar',
            'avatar_url',
            'location',
            'primary_art_form',
            'website_link',
            'role',
            'is_verified_artist',
            'followers_count',
            'following_count',
            'artworks_count',
            'is_following',
            'created_at',
        ]

    def get_followers_count(self, obj):
        return Follow.objects.filter(following=obj.user).count()

    def get_following_count(self, obj):
        return Follow.objects.filter(follower=obj.user).count()

    def get_artworks_count(self, obj):
        return obj.user.submitted_artworks.count()

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj.user).exists()
        return False


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'display_name',
            'bio',
            'avatar',
            'avatar_url',
            'location',
            'primary_art_form',
            'website_link',
        ]
