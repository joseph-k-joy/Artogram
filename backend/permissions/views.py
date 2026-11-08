from django.utils import timezone
from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import ArtworkPermission, PermissionRequest
from .serializers import ArtworkPermissionSerializer, PermissionRequestSerializer
from artworks.models import Artwork
from notifications.models import notify_user
from audit.services import record_audit_event


class ArtworkPermissionDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, artwork_id):
        artwork = get_object_or_404(Artwork, pk=artwork_id)
        perm, _ = ArtworkPermission.objects.get_or_create(artwork=artwork)
        return Response(ArtworkPermissionSerializer(perm).data)

    def put(self, request, artwork_id):
        artwork = get_object_or_404(Artwork, pk=artwork_id)
        if artwork.submitted_by != request.user and not (request.user.is_staff or request.user.profile.role in ['admin', 'moderator']):
            return Response({'error': 'You do not have permission to modify terms for this artwork.'}, status=status.HTTP_403_FORBIDDEN)

        perm, _ = ArtworkPermission.objects.get_or_create(artwork=artwork)
        serializer = ArtworkPermissionSerializer(perm, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()

            record_audit_event(
                actor=request.user,
                action='PERMISSION_CHANGED',
                entity_type='ArtworkPermission',
                entity_id=artwork.id,
                description=f"Updated reuse permission terms for '{artwork.title}'",
                new_value=serializer.data
            )

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PermissionRequestListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        mode = request.query_params.get('mode', 'all')
        user = request.user

        if mode == 'incoming':
            # Requests for artworks submitted by the user
            requests = PermissionRequest.objects.filter(artwork__submitted_by=user).select_related('artwork', 'requester', 'requester__profile')
        elif mode == 'outgoing':
            # Requests submitted by the user
            requests = PermissionRequest.objects.filter(requester=user).select_related('artwork', 'requester', 'requester__profile')
        else:
            requests = PermissionRequest.objects.filter(
                Q(artwork__submitted_by=user) | Q(requester=user)
            ).select_related('artwork', 'requester', 'requester__profile')

        serializer = PermissionRequestSerializer(requests, many=True)
        return Response(serializer.data)

    def post(self, request):
        artwork_id = request.data.get('artwork_id')
        artwork = get_object_or_404(Artwork, pk=artwork_id)

        intended_usage = request.data.get('intended_usage', 'Educational Exhibition')
        is_commercial = request.data.get('is_commercial', False)
        description = request.data.get('description', '').strip()
        expected_platform = request.data.get('expected_platform', '').strip()
        additional_info = request.data.get('additional_info', '').strip()

        if not description:
            return Response({'error': 'Please provide a detailed description of your intended usage.'}, status=status.HTTP_400_BAD_REQUEST)

        req = PermissionRequest.objects.create(
            artwork=artwork,
            requester=request.user,
            intended_usage=intended_usage,
            is_commercial=is_commercial in ['true', True, '1', 1],
            description=description,
            expected_platform=expected_platform,
            additional_info=additional_info,
            status='pending'
        )

        # Notify artwork artist
        notify_user(
            recipient=artwork.submitted_by,
            sender=request.user,
            notification_type='permission_request',
            title='New Permission Request',
            message=f"@{request.user.username} requested permission for '{artwork.title}' ({intended_usage}).",
            target_url=f"/permission-requests"
        )

        # Record audit event
        record_audit_event(
            actor=request.user,
            action='PERMISSION_REQUEST_SUBMITTED',
            entity_type='PermissionRequest',
            entity_id=req.id,
            description=f"Permission request submitted by @{request.user.username} for artwork '{artwork.title}'"
        )

        return Response(PermissionRequestSerializer(req).data, status=status.HTTP_201_CREATED)


class PermissionRequestRespondView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        perm_req = get_object_or_404(PermissionRequest, pk=pk)
        artwork = perm_req.artwork

        # Only artist or admin can respond
        if artwork.submitted_by != request.user and not (request.user.is_staff or request.user.profile.role in ['admin', 'moderator']):
            return Response({'error': 'You do not have authority to respond to this permission request.'}, status=status.HTTP_403_FORBIDDEN)

        decision = request.data.get('status') # 'approved', 'rejected', 'clarification_requested'
        response_note = request.data.get('artist_response_note', '').strip()

        if decision not in ['approved', 'rejected', 'clarification_requested']:
            return Response({'error': 'Invalid status decision.'}, status=status.HTTP_400_BAD_REQUEST)

        prev_status = perm_req.status
        perm_req.status = decision
        perm_req.artist_response_note = response_note
        perm_req.responded_at = timezone.now()
        perm_req.save()

        # Notify requester
        notify_user(
            recipient=perm_req.requester,
            sender=request.user,
            notification_type='permission_decision',
            title=f"Permission Request {decision.capitalize()}",
            message=f"Your reuse permission request for '{artwork.title}' was marked as: {decision}.",
            target_url=f"/permission-requests"
        )

        # Record audit event
        record_audit_event(
            actor=request.user,
            action='PERMISSION_REQUEST_DECIDED',
            entity_type='PermissionRequest',
            entity_id=perm_req.id,
            description=f"Permission request for '{artwork.title}' decided as '{decision}' by @{request.user.username}",
            prev_value={'status': prev_status},
            new_value={'status': decision, 'artist_response_note': response_note}
        )

        return Response(PermissionRequestSerializer(perm_req).data)
