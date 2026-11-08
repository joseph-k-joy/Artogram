from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.CharField(source='sender.profile.effective_avatar', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'recipient',
            'sender',
            'sender_username',
            'sender_avatar',
            'notification_type',
            'title',
            'message',
            'target_url',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['id', 'recipient', 'sender', 'notification_type', 'title', 'message', 'target_url', 'created_at']
