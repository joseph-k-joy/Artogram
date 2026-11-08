from rest_framework import serializers
from .models import ArtworkPermission, PermissionRequest
from artworks.models import Artwork


class ArtworkPermissionSerializer(serializers.ModelSerializer):
    artwork_title = serializers.CharField(source='artwork.title', read_only=True)

    class Meta:
        model = ArtworkPermission
        fields = [
            'id',
            'artwork',
            'artwork_title',
            'viewing_allowed',
            'downloading_allowed',
            'educational_use_allowed',
            'commercial_use_allowed',
            'modification_allowed',
            'redistribution_allowed',
            'attribution_required',
            'additional_conditions',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['artwork', 'created_at', 'updated_at']


class PermissionRequestSerializer(serializers.ModelSerializer):
    artwork_id = serializers.IntegerField(source='artwork.id', read_only=True)
    artwork_title = serializers.CharField(source='artwork.title', read_only=True)
    artwork_image = serializers.CharField(source='artwork.effective_image', read_only=True)
    artist_username = serializers.CharField(source='artwork.submitted_by.username', read_only=True)
    requester_username = serializers.CharField(source='requester.username', read_only=True)
    requester_display_name = serializers.CharField(source='requester.profile.display_name', read_only=True)

    class Meta:
        model = PermissionRequest
        fields = [
            'id',
            'artwork',
            'artwork_id',
            'artwork_title',
            'artwork_image',
            'artist_username',
            'requester',
            'requester_username',
            'requester_display_name',
            'intended_usage',
            'is_commercial',
            'description',
            'expected_platform',
            'additional_info',
            'status',
            'artist_response_note',
            'responded_at',
            'created_at',
        ]
        read_only_fields = ['requester', 'status', 'artist_response_note', 'responded_at', 'created_at']
