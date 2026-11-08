from rest_framework import serializers
from django.contrib.auth.models import User
from profiles.models import UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.CharField(source='effective_avatar', read_only=True)

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
            'role',
            'is_verified_artist',
            'created_at',
        ]
        read_only_fields = ['is_verified_artist', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'profile']


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)
    full_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=['registered', 'artist'], default='registered')
    primary_art_form = serializers.CharField(max_length=150, required=False, allow_blank=True)
    location = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        if User.objects.filter(username__iexact=data['username']).exists():
            raise serializers.ValidationError({"username": "A user with this username already exists."})
        if User.objects.filter(email__iexact=data['email']).exists():
            raise serializers.ValidationError({"email": "A user with this email address already exists."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        role = validated_data.pop('role', 'registered')
        full_name = validated_data.pop('full_name', '')
        primary_art_form = validated_data.pop('primary_art_form', '')
        location = validated_data.pop('location', '')

        first_name = full_name.split()[0] if full_name else ''
        last_name = " ".join(full_name.split()[1:]) if full_name and len(full_name.split()) > 1 else ''

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name
        )

        profile = user.profile
        profile.display_name = full_name or user.username
        profile.role = role
        profile.primary_art_form = primary_art_form
        profile.location = location
        profile.save()

        return user
