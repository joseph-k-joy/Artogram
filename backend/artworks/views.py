import json
from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.contrib.auth.models import User
from .models import Artwork, ArtworkContributor
from .serializers import ArtworkListSerializer, ArtworkDetailSerializer
from provenance.services import register_artwork_provenance
from permissions.models import ArtworkPermission
from social.models import SocialPost
from audit.services import record_audit_event


class ArtworkListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        artworks = Artwork.objects.all().select_related('submitted_by', 'submitted_by__profile', 'provenance')

        # Visibility filter: non-authenticated or regular users can see public artworks or their own
        if request.user.is_authenticated and (request.user.is_staff or request.user.profile.role in ['admin', 'moderator']):
            pass
        elif request.user.is_authenticated:
            artworks = artworks.filter(Q(visibility='public') | Q(submitted_by=request.user))
        else:
            artworks = artworks.filter(visibility='public')

        # Filtering
        q = request.query_params.get('q', '').strip()
        if q:
            artworks = artworks.filter(
                Q(title__icontains=q) |
                Q(cultural_origin__icontains=q) |
                Q(original_creator_name__icontains=q) |
                Q(tags__icontains=q) |
                Q(art_category__icontains=q) |
                Q(provenance__provenance_id__icontains=q)
            )

        category = request.query_params.get('category', '').strip()
        if category and category != 'All':
            artworks = artworks.filter(art_category=category)

        classification = request.query_params.get('classification', '').strip()
        if classification:
            artworks = artworks.filter(classification=classification)

        origin = request.query_params.get('origin', '').strip()
        if origin:
            artworks = artworks.filter(cultural_origin__icontains=origin)

        submitter = request.query_params.get('submitter', '').strip()
        if submitter:
            artworks = artworks.filter(submitted_by__username__iexact=submitter)

        # Ordering
        ordering = request.query_params.get('ordering', '-created_at')
        if ordering in ['-created_at', 'created_at', 'title', '-title']:
            artworks = artworks.order_by(ordering)

        serializer = ArtworkListSerializer(artworks, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        user = request.user

        title = data.get('title', '').strip()
        description = data.get('description', '').strip()
        art_category = data.get('art_category', 'Indigenous Folk Art')
        cultural_origin = data.get('cultural_origin', '').strip()
        original_creator_name = data.get('original_creator_name', user.profile.display_name or user.username).strip()

        if not title:
            return Response({'title': ['Title is required.']}, status=status.HTTP_400_BAD_REQUEST)
        if not cultural_origin:
            return Response({'cultural_origin': ['Cultural origin is required.']}, status=status.HTTP_400_BAD_REQUEST)

        # Handle image file or image url
        image_file = request.FILES.get('image')
        image_url = data.get('image_url', '')

        if not image_file and not image_url:
            image_url = f"https://picsum.photos/seed/{title.replace(' ', '_')}/800/800"

        artwork = Artwork.objects.create(
            title=title,
            image=image_file,
            image_url=image_url,
            description=description,
            art_category=art_category,
            tags=data.get('tags', ''),
            submitted_by=user,
            creator_user=user if data.get('declaration_type') == 'created_by_me' else None,
            original_creator_name=original_creator_name,
            cultural_origin=cultural_origin,
            geographic_region=data.get('geographic_region', ''),
            language=data.get('language', ''),
            cultural_background=data.get('cultural_background', ''),
            historical_context=data.get('historical_context', ''),
            classification=data.get('classification', 'traditional'),
            creation_period=data.get('creation_period', ''),
            information_source=data.get('information_source', ''),
            required_credit=data.get('required_credit', f"Artwork: {title} by {original_creator_name}. Cultural heritage: {cultural_origin}"),
            preferred_attribution_format=data.get('preferred_attribution_format', f"Credit: {original_creator_name} ({cultural_origin}) via Artogram"),
            declaration_type=data.get('declaration_type', 'created_by_me'),
            declaration_details=data.get('declaration_details', ''),
            visibility=data.get('visibility', 'public'),
            status='registered'
        )

        # Handle contributors if provided
        contributors_raw = data.get('contributors', '[]')
        if isinstance(contributors_raw, str):
            try:
                contributors_data = json.loads(contributors_raw)
            except Exception:
                contributors_data = []
        else:
            contributors_data = contributors_raw

        for c in contributors_data:
            if isinstance(c, dict) and c.get('name'):
                contrib_user = None
                if c.get('registered_username'):
                    contrib_user = User.objects.filter(username__iexact=c['registered_username']).first()
                ArtworkContributor.objects.create(
                    artwork=artwork,
                    name=c['name'],
                    role=c.get('role', 'Contributor'),
                    registered_user=contrib_user
                )

        # Register Provenance with cryptographic SHA-256 and QR code
        provenance = register_artwork_provenance(
            artwork=artwork,
            user=user,
            uploaded_file=image_file,
            client_host="http://localhost:5173"
        )

        # Set permissions
        ArtworkPermission.objects.create(
            artwork=artwork,
            viewing_allowed=True,
            downloading_allowed=data.get('downloading_allowed', 'false') in ['true', True, '1', 1],
            educational_use_allowed=data.get('educational_use_allowed', 'true') in ['true', True, '1', 1],
            commercial_use_allowed=data.get('commercial_use_allowed', 'false') in ['true', True, '1', 1],
            modification_allowed=data.get('modification_allowed', 'false') in ['true', True, '1', 1],
            redistribution_allowed=data.get('redistribution_allowed', 'false') in ['true', True, '1', 1],
            attribution_required=True,
            additional_conditions=data.get('additional_conditions', '')
        )

        # Automatically create social post if publish_to_feed requested (default true)
        if data.get('publish_to_feed', 'true') in ['true', True, '1', 1]:
            caption = data.get('caption', description[:250])
            SocialPost.objects.create(
                artwork=artwork,
                author=user,
                caption=caption or f"Registered cultural artwork '{title}' from {cultural_origin}.",
                visibility='public'
            )

        # Record audit event
        record_audit_event(
            actor=user,
            action='ARTWORK_REGISTERED',
            entity_type='Artwork',
            entity_id=artwork.id,
            description=f"Artwork '{artwork.title}' registered with Provenance ID {provenance.provenance_id}",
            new_value={
                'title': artwork.title,
                'provenance_id': provenance.provenance_id,
                'cultural_origin': artwork.cultural_origin,
                'creator': artwork.original_creator_name,
                'declaration': artwork.declaration_type
            }
        )

        serializer = ArtworkDetailSerializer(artwork, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ArtworkDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        artwork = get_object_or_404(
            Artwork.objects.select_related('submitted_by', 'submitted_by__profile', 'provenance', 'permissions'),
            pk=pk
        )
        serializer = ArtworkDetailSerializer(artwork, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, pk):
        artwork = get_object_or_404(Artwork, pk=pk)
        if artwork.submitted_by != request.user and not (request.user.is_staff or request.user.profile.role in ['admin', 'moderator']):
            return Response({'error': 'You do not have permission to modify this artwork.'}, status=status.HTTP_403_FORBIDDEN)

        data = request.data
        updatable_fields = [
            'title', 'description', 'art_category', 'tags', 'cultural_origin',
            'geographic_region', 'language', 'cultural_background', 'historical_context',
            'classification', 'creation_period', 'information_source', 'required_credit',
            'preferred_attribution_format', 'visibility'
        ]
        for field in updatable_fields:
            if field in data:
                setattr(artwork, field, data[field])
        artwork.save()

        record_audit_event(
            actor=request.user,
            action='ATTRIBUTION_UPDATED',
            entity_type='Artwork',
            entity_id=artwork.id,
            description=f"Attribution metadata updated for '{artwork.title}'"
        )

        serializer = ArtworkDetailSerializer(artwork, context={'request': request})
        return Response(serializer.data)

    def delete(self, request, pk):
        artwork = get_object_or_404(Artwork, pk=pk)
        if artwork.submitted_by != request.user and not (request.user.is_staff or request.user.profile.role in ['admin', 'moderator']):
            return Response({'error': 'You do not have permission to delete this artwork.'}, status=status.HTTP_403_FORBIDDEN)

        title = artwork.title
        artwork_id = artwork.id
        artwork.delete()

        record_audit_event(
            actor=request.user,
            action='ADMIN_ACTION',
            entity_type='Artwork',
            entity_id=artwork_id,
            description=f"Artwork '{title}' was deleted."
        )

        return Response({'message': 'Artwork deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class ArtworkCategoriesView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        categories = Artwork.objects.filter(visibility='public').values('art_category').annotate(count=Count('id')).order_by('-count')
        return Response(list(categories))
