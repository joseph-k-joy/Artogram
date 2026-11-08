from rest_framework import views, permissions
from rest_framework.response import Response
from .models import AuditEvent
from .serializers import AuditEventSerializer


class AuditEventListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not (user.is_staff or getattr(user.profile, 'role', '') in ['admin', 'moderator']):
            return Response({'error': 'Admin permissions required.'}, status=403)

        events = AuditEvent.objects.all().select_related('actor')

        action = request.query_params.get('action')
        if action:
            events = events.filter(action=action)

        entity_type = request.query_params.get('entity_type')
        if entity_type:
            events = events.filter(entity_type=entity_type)

        q = request.query_params.get('q')
        if q:
            events = events.filter(description__icontains=q)

        events = events.order_by('-timestamp')[:100]
        serializer = AuditEventSerializer(events, many=True)
        return Response(serializer.data)
