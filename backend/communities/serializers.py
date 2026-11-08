from rest_framework import serializers
from .models import Community, CommunityReviewer, CommunityVerification
from artworks.serializers import ArtworkListSerializer


class CommunityReviewerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    display_name = serializers.CharField(source='user.profile.display_name', read_only=True)

    class Meta:
        model = CommunityReviewer
        fields = ['id', 'user', 'username', 'display_name', 'title_or_role', 'is_active', 'appointed_at']


class CommunitySerializer(serializers.ModelSerializer):
    reviewers = CommunityReviewerSerializer(many=True, read_only=True)
    artworks_verified_count = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'geographic_region',
            'cultural_tradition',
            'reviewers',
            'artworks_verified_count',
            'created_at',
        ]

    def get_artworks_verified_count(self, obj):
        return obj.verifications.filter(status='approved').count()


class CommunityVerificationSerializer(serializers.ModelSerializer):
    community_name = serializers.CharField(source='community.name', read_only=True)
    artwork_title = serializers.CharField(source='artwork.title', read_only=True)
    artwork_image = serializers.CharField(source='artwork.effective_image', read_only=True)
    provenance_id = serializers.CharField(source='artwork.provenance.provenance_id', read_only=True)
    reviewer_username = serializers.CharField(source='reviewer.username', read_only=True)

    class Meta:
        model = CommunityVerification
        fields = [
            'id',
            'artwork',
            'artwork_title',
            'artwork_image',
            'provenance_id',
            'community',
            'community_name',
            'reviewer',
            'reviewer_username',
            'status',
            'comments',
            'evidence_reference',
            'reviewed_at',
            'created_at',
        ]
        read_only_fields = ['reviewer', 'reviewed_at', 'created_at']
