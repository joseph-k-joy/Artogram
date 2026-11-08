from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Artwork, ArtworkContributor
from social.models import Bookmark


class ArtworkContributorSerializer(serializers.ModelSerializer):
    registered_username = serializers.CharField(source='registered_user.username', read_only=True)

    class Meta:
        model = ArtworkContributor
        fields = ['id', 'name', 'role', 'registered_user', 'registered_username']


class ArtworkListSerializer(serializers.ModelSerializer):
    effective_image = serializers.CharField(read_only=True)
    provenance_id = serializers.CharField(source='provenance.provenance_id', read_only=True)
    verification_status = serializers.CharField(source='provenance.verification_status', read_only=True)
    verification_badge = serializers.CharField(source='provenance.verification_badge_label', read_only=True)
    submitter_username = serializers.CharField(source='submitted_by.username', read_only=True)
    submitter_avatar = serializers.CharField(source='submitted_by.profile.effective_avatar', read_only=True)
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Artwork
        fields = [
            'id',
            'title',
            'effective_image',
            'art_category',
            'cultural_origin',
            'original_creator_name',
            'submitter_username',
            'submitter_avatar',
            'provenance_id',
            'verification_status',
            'verification_badge',
            'classification',
            'created_at',
            'is_bookmarked',
        ]

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(user=request.user, artwork=obj).exists()
        return False


class ArtworkDetailSerializer(serializers.ModelSerializer):
    effective_image = serializers.CharField(read_only=True)
    contributors = ArtworkContributorSerializer(many=True, read_only=True)
    provenance_id = serializers.CharField(source='provenance.provenance_id', read_only=True)
    sha256_hash = serializers.CharField(source='provenance.sha256_hash', read_only=True)
    qr_code_data_url = serializers.CharField(source='provenance.qr_code_data_url', read_only=True)
    qr_target_url = serializers.CharField(source='provenance.qr_target_url', read_only=True)
    verification_status = serializers.CharField(source='provenance.verification_status', read_only=True)
    verification_badge = serializers.CharField(source='provenance.verification_badge_label', read_only=True)
    provenance_notes = serializers.CharField(source='provenance.disclaimer', read_only=True)
    submitter_username = serializers.CharField(source='submitted_by.username', read_only=True)
    submitter_display_name = serializers.CharField(source='submitted_by.profile.display_name', read_only=True)
    submitter_avatar = serializers.CharField(source='submitted_by.profile.effective_avatar', read_only=True)
    is_bookmarked = serializers.SerializerMethodField()
    permissions_summary = serializers.SerializerMethodField()

    class Meta:
        model = Artwork
        fields = [
            'id',
            'title',
            'image',
            'image_url',
            'effective_image',
            'description',
            'art_category',
            'tags',
            'submitted_by',
            'submitter_username',
            'submitter_display_name',
            'submitter_avatar',
            'creator_user',
            'original_creator_name',
            'cultural_origin',
            'geographic_region',
            'language',
            'cultural_background',
            'historical_context',
            'classification',
            'creation_period',
            'information_source',
            'required_credit',
            'preferred_attribution_format',
            'declaration_type',
            'declaration_details',
            'visibility',
            'status',
            'created_at',
            'updated_at',
            'contributors',
            'provenance_id',
            'sha256_hash',
            'qr_code_data_url',
            'qr_target_url',
            'verification_status',
            'verification_badge',
            'provenance_notes',
            'is_bookmarked',
            'permissions_summary',
        ]

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(user=request.user, artwork=obj).exists()
        return False

    def get_permissions_summary(self, obj):
        if hasattr(obj, 'permissions'):
            p = obj.permissions
            return {
                'viewing_allowed': p.viewing_allowed,
                'downloading_allowed': p.downloading_allowed,
                'educational_use_allowed': p.educational_use_allowed,
                'commercial_use_allowed': p.commercial_use_allowed,
                'modification_allowed': p.modification_allowed,
                'redistribution_allowed': p.redistribution_allowed,
                'attribution_required': p.attribution_required,
                'additional_conditions': p.additional_conditions,
            }
        return None
