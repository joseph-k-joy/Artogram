from django.utils import timezone
from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Community, CommunityReviewer, CommunityVerification
from .serializers import CommunitySerializer, CommunityVerificationSerializer
from artworks.models import Artwork
from notifications.models import notify_user
from audit.services import record_audit_event


class CommunityListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        communities = Community.objects.all().prefetch_related('reviewers', 'reviewers__user')
        serializer = CommunitySerializer(communities, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not (request.user.is_staff or getattr(request.user.profile, 'role', '') in ['admin', 'moderator']):
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        
        name = request.data.get('name', '').strip()
        slug = request.data.get('slug', name.lower().replace(' ', '-'))
        desc = request.data.get('description', '')
        region = request.data.get('geographic_region', '')
        tradition = request.data.get('cultural_tradition', '')

        community = Community.objects.create(
            name=name,
            slug=slug,
            description=desc,
            geographic_region=region,
            cultural_tradition=tradition
        )
        return Response(CommunitySerializer(community).data, status=status.HTTP_201_CREATED)


class CommunityDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        community = get_object_or_404(Community.objects.prefetch_related('reviewers', 'reviewers__user'), slug=slug)
        return Response(CommunitySerializer(community).data)


class CommunityVerificationListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        verifications = CommunityVerification.objects.all().select_related(
            'artwork', 'artwork__provenance', 'community', 'reviewer'
        )
        serializer = CommunityVerificationSerializer(verifications, many=True)
        return Response(serializer.data)

    def post(self, request):
        artwork_id = request.data.get('artwork_id')
        community_id = request.data.get('community_id')
        evidence = request.data.get('evidence_reference', '').strip()

        artwork = get_object_or_404(Artwork, pk=artwork_id)
        community = get_object_or_404(Community, pk=community_id)

        # Check existing
        existing = CommunityVerification.objects.filter(artwork=artwork, community=community).first()
        if existing:
            return Response({'error': 'A verification request for this community already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        verif = CommunityVerification.objects.create(
            artwork=artwork,
            community=community,
            status='pending',
            evidence_reference=evidence
        )

        record_audit_event(
            actor=request.user,
            action='COMMUNITY_REVIEW_SUBMITTED',
            entity_type='CommunityVerification',
            entity_id=verif.id,
            description=f"Community verification requested for '{artwork.title}' by {community.name}"
        )

        return Response(CommunityVerificationSerializer(verif).data, status=status.HTTP_201_CREATED)


class CommunityVerificationReviewView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user = request.user
        verif = get_object_or_404(
            CommunityVerification.objects.select_related('artwork', 'artwork__provenance', 'community'),
            pk=pk
        )

        # Check if user is a designated reviewer for this community or an admin
        is_reviewer = CommunityReviewer.objects.filter(community=verif.community, user=user, is_active=True).exists()
        if not (is_reviewer or user.is_staff or getattr(user.profile, 'role', '') in ['admin', 'moderator']):
            return Response({'error': 'Only authorized community reviewers or platform admins may perform this review.'}, status=status.HTTP_403_FORBIDDEN)

        decision = request.data.get('status') # 'approved', 'rejected', 'more_info_requested'
        comments = request.data.get('comments', '').strip()

        if decision not in ['approved', 'rejected', 'more_info_requested']:
            return Response({'error': 'Invalid verification status.'}, status=status.HTTP_400_BAD_REQUEST)

        verif.status = decision
        verif.reviewer = user
        verif.comments = comments
        verif.reviewed_at = timezone.now()
        verif.save()

        # If approved, update artwork and provenance verification status
        artwork = verif.artwork
        if decision == 'approved':
            artwork.status = 'community_reviewed'
            artwork.save()
            if hasattr(artwork, 'provenance'):
                prov = artwork.provenance
                prov.verification_status = 'community_reviewed'
                prov.verification_badge_label = f"Verified by {verif.community.name}"
                prov.review_notes = comments
                prov.save()

        notify_user(
            recipient=artwork.submitted_by,
            sender=user,
            notification_type='community_review',
            title=f"Community Review Decision: {decision.capitalize()}",
            message=f"Community '{verif.community.name}' has {decision} the cultural provenance of '{artwork.title}'.",
            target_url=f"/artworks/{artwork.id}"
        )

        record_audit_event(
            actor=user,
            action='VERIFICATION_STATUS_CHANGED',
            entity_type='CommunityVerification',
            entity_id=verif.id,
            description=f"Verification for '{artwork.title}' was {decision} by {user.username} ({verif.community.name})",
            new_value={'status': decision, 'comments': comments}
        )

        return Response(CommunityVerificationSerializer(verif).data)
