from rest_framework import serializers
from .models import ArtworkProvenance
from artworks.serializers import ArtworkDetailSerializer
from audit.models import AuditEvent


class AuditEventSimpleSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source='actor.username', read_only=True)

    class Meta:
        model = AuditEvent
        fields = ['id', 'actor_username', 'action', 'entity_type', 'entity_id', 'description', 'timestamp']


class ProvenanceDetailSerializer(serializers.ModelSerializer):
    artwork = ArtworkDetailSerializer(read_only=True)
    registered_by_username = serializers.CharField(source='registered_by.username', read_only=True)
    audit_history = serializers.SerializerMethodField()

    class Meta:
        model = ArtworkProvenance
        fields = [
            'provenance_id',
            'sha256_hash',
            'original_filename',
            'file_size_bytes',
            'mime_type',
            'qr_code_image',
            'qr_code_data_url',
            'qr_target_url',
            'registered_by_username',
            'registered_at',
            'verification_status',
            'verification_badge_label',
            'review_notes',
            'disclaimer',
            'artwork',
            'audit_history',
        ]

    def get_audit_history(self, obj):
        events = AuditEvent.objects.filter(
            entity_id__in=[str(obj.artwork.id), str(obj.provenance_id)]
        ).order_by('-timestamp')[:10]
        return AuditEventSimpleSerializer(events, many=True).data


class IdentityCardSerializer(serializers.ModelSerializer):
    artwork_id = serializers.IntegerField(source='artwork.id', read_only=True)
    artwork_title = serializers.CharField(source='artwork.title', read_only=True)
    artwork_image = serializers.CharField(source='artwork.effective_image', read_only=True)
    creator_username = serializers.CharField(source='artwork.submitted_by.username', read_only=True)
    creator_display_name = serializers.CharField(source='artwork.original_creator_name', read_only=True)
    cultural_origin = serializers.CharField(source='artwork.cultural_origin', read_only=True)
    classification = serializers.CharField(source='artwork.classification', read_only=True)
    required_credit = serializers.CharField(source='artwork.required_credit', read_only=True)
    preferred_attribution_format = serializers.CharField(source='artwork.preferred_attribution_format', read_only=True)
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = ArtworkProvenance
        fields = [
            'provenance_id',
            'artwork_id',
            'artwork_title',
            'artwork_image',
            'creator_username',
            'creator_display_name',
            'cultural_origin',
            'classification',
            'sha256_hash',
            'qr_code_data_url',
            'qr_target_url',
            'verification_status',
            'verification_badge_label',
            'registered_at',
            'required_credit',
            'preferred_attribution_format',
            'disclaimer',
            'permissions',
        ]

    def get_permissions(self, obj):
        if hasattr(obj.artwork, 'permissions'):
            p = obj.artwork.permissions
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
        return {}
