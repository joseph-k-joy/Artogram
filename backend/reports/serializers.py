from rest_framework import serializers
from .models import MisuseReport, ReportEvidence


class ReportEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportEvidence
        fields = ['id', 'file', 'file_url', 'description', 'uploaded_at']


class MisuseReportSerializer(serializers.ModelSerializer):
    artwork_id = serializers.IntegerField(source='artwork.id', read_only=True)
    artwork_title = serializers.CharField(source='artwork.title', read_only=True)
    artwork_image = serializers.CharField(source='artwork.effective_image', read_only=True)
    provenance_id = serializers.CharField(source='artwork.provenance.provenance_id', read_only=True)
    reporter_username = serializers.CharField(source='reporter.username', read_only=True)
    evidence_items = ReportEvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = MisuseReport
        fields = [
            'id',
            'artwork',
            'artwork_id',
            'artwork_title',
            'artwork_image',
            'provenance_id',
            'reporter',
            'reporter_username',
            'report_type',
            'suspected_external_url',
            'description',
            'status',
            'admin_notes',
            'reviewed_by',
            'reviewed_at',
            'evidence_items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['reporter', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at']
