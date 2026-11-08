from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from artworks.models import Artwork
from social.models import SocialPost, Comment
from permissions.models import PermissionRequest
from reports.models import MisuseReport
from communities.models import CommunityVerification
from audit.services import record_audit_event
from .models import ModerationLog
from .serializers import ModerationLogSerializer, AdminCommentSerializer
from accounts.serializers import UserSerializer
from artworks.serializers import ArtworkListSerializer


class AdminOverviewView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not (user.is_staff or getattr(user.profile, 'role', '') in ['admin', 'moderator']):
            return Response({'error': 'Admin permissions required.'}, status=403)

        total_users = User.objects.count()
        total_artists = User.objects.filter(profile__role='artist').count()
        total_artworks = Artwork.objects.count()
        total_posts = SocialPost.objects.count()

        pending_artwork_reviews = Artwork.objects.filter(status='pending_review').count()
        pending_reports = MisuseReport.objects.filter(status__in=['submitted', 'under_review']).count()
        pending_permissions = PermissionRequest.objects.filter(status='pending').count()
        pending_community_verifications = CommunityVerification.objects.filter(status='pending').count()

        recent_artworks = Artwork.objects.all().order_by('-created_at')[:5]
        recent_reports = MisuseReport.objects.all().order_by('-created_at')[:5]

        return Response({
            'stats': {
                'total_users': total_users,
                'total_artists': total_artists,
                'total_artworks': total_artworks,
                'total_posts': total_posts,
                'pending_artwork_reviews': pending_artwork_reviews,
                'pending_reports': pending_reports,
                'pending_permissions': pending_permissions,
                'pending_community_verifications': pending_community_verifications,
            },
            'recent_artworks': ArtworkListSerializer(recent_artworks, many=True, context={'request': request}).data,
            'recent_reports_count': recent_reports.count()
        })


class AdminUsersListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or getattr(request.user.profile, 'role', '') in ['admin', 'moderator']):
            return Response({'error': 'Unauthorized.'}, status=403)
        users = User.objects.all().select_related('profile').order_by('-date_joined')
        return Response(UserSerializer(users, many=True).data)

    def patch(self, request, pk):
        if not (request.user.is_staff or getattr(request.user.profile, 'role', '') in ['admin']):
            return Response({'error': 'Admin permission required.'}, status=403)
        user = get_object_or_404(User, pk=pk)
        role = request.data.get('role')
        is_active = request.data.get('is_active')
        is_verified_artist = request.data.get('is_verified_artist')

        if role:
            user.profile.role = role
        if is_verified_artist is not None:
            user.profile.is_verified_artist = is_verified_artist in [True, 'true', 1]
        user.profile.save()

        if is_active is not None:
            user.is_active = is_active in [True, 'true', 1]
            user.save()

        record_audit_event(
            actor=request.user,
            action='ADMIN_ACTION',
            entity_type='User',
            entity_id=user.id,
            description=f"Admin updated user @{user.username}: role={user.profile.role}, active={user.is_active}"
        )

        return Response(UserSerializer(user).data)


class AdminArtworkStatusView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if not (request.user.is_staff or getattr(request.user.profile, 'role', '') in ['admin', 'moderator']):
            return Response({'error': 'Unauthorized.'}, status=403)

        artwork = get_object_or_404(Artwork, pk=pk)
        new_status = request.data.get('status')
        badge_label = request.data.get('badge_label')
        notes = request.data.get('notes', '')

        if new_status:
            prev = artwork.status
            artwork.status = new_status
            artwork.save()

            if hasattr(artwork, 'provenance'):
                prov = artwork.provenance
                prov.verification_status = new_status
                if badge_label:
                    prov.verification_badge_label = badge_label
                if notes:
                    prov.review_notes = notes
                prov.save()

            record_audit_event(
                actor=request.user,
                action='VERIFICATION_STATUS_CHANGED',
                entity_type='Artwork',
                entity_id=artwork.id,
                description=f"Artwork '{artwork.title}' status changed to '{new_status}' by @{request.user.username}",
                prev_value={'status': prev},
                new_value={'status': new_status, 'badge': badge_label}
            )

        return Response({'message': f"Artwork status updated to {new_status}."})


class AdminCommentsListView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or getattr(request.user.profile, 'role', '') in ['admin', 'moderator']):
            return Response({'error': 'Unauthorized.'}, status=403)
        comments = Comment.objects.all().select_related('user', 'post', 'post__artwork').order_by('-created_at')[:100]
        return Response(AdminCommentSerializer(comments, many=True).data)

    def patch(self, request, pk):
        if not (request.user.is_staff or getattr(request.user.profile, 'role', '') in ['admin', 'moderator']):
            return Response({'error': 'Unauthorized.'}, status=403)
        comment = get_object_or_404(Comment, pk=pk)
        hide = request.data.get('is_hidden', True)
        comment.is_hidden = hide in [True, 'true', 1]
        comment.save()

        action = 'hide_comment' if comment.is_hidden else 'unhide_comment'
        ModerationLog.objects.create(
            moderator=request.user,
            target_type='comment',
            target_id=str(comment.id),
            action_taken=action,
            reason=request.data.get('reason', 'Moderator action on comment')
        )

        return Response({'message': f"Comment visibility set to {comment.is_hidden}."})
