from rest_framework import serializers
from .models import AuditEvent


class AuditEventSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source='actor.username', read_only=True)

    class Meta:
        model = AuditEvent
        fields = [
            'id',
            'actor',
            'actor_username',
            'action',
            'entity_type',
            'entity_id',
            'prev_value',
            'new_value',
            'description',
            'ip_address',
            'timestamp',
        ]
