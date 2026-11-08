from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ArtworkProvenance
from .serializers import ProvenanceDetailSerializer, IdentityCardSerializer
from .services import compute_sha256


class ProvenanceDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, provenance_id):
        # Allow lookup by provenance_id (ART-2026-000001) or integer artwork id
        if provenance_id.isdigit():
            provenance = get_object_or_404(
                ArtworkProvenance.objects.select_related('artwork', 'artwork__submitted_by', 'registered_by'),
                artwork_id=int(provenance_id)
            )
        else:
            provenance = get_object_or_404(
                ArtworkProvenance.objects.select_related('artwork', 'artwork__submitted_by', 'registered_by'),
                provenance_id__iexact=provenance_id
            )

        serializer = ProvenanceDetailSerializer(provenance, context={'request': request})
        return Response(serializer.data)


class IdentityCardView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, provenance_id):
        if provenance_id.isdigit():
            provenance = get_object_or_404(
                ArtworkProvenance.objects.select_related('artwork', 'artwork__submitted_by', 'artwork__permissions'),
                artwork_id=int(provenance_id)
            )
        else:
            provenance = get_object_or_404(
                ArtworkProvenance.objects.select_related('artwork', 'artwork__submitted_by', 'artwork__permissions'),
                provenance_id__iexact=provenance_id
            )

        serializer = IdentityCardSerializer(provenance, context={'request': request})
        return Response(serializer.data)


class VerifyHashView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uploaded_file = request.FILES.get('file')
        input_hash = request.data.get('hash', '').strip().lower()

        if uploaded_file:
            computed = compute_sha256(uploaded_file)
        elif input_hash:
            computed = input_hash
        else:
            return Response({'error': 'Please provide an image file or a SHA-256 hash string.'}, status=status.HTTP_400_BAD_REQUEST)

        matches = ArtworkProvenance.objects.filter(sha256_hash__iexact=computed).select_related('artwork')

        if matches.exists():
            prov = matches.first()
            return Response({
                'matched': True,
                'sha256_hash': computed,
                'provenance_id': prov.provenance_id,
                'artwork_title': prov.artwork.title,
                'cultural_origin': prov.artwork.cultural_origin,
                'creator_name': prov.artwork.original_creator_name,
                'verification_status': prov.verification_status,
                'provenance_url': f"/artworks/{prov.provenance_id}/provenance/",
                'message': f"Match verified: exact SHA-256 file fingerprint matches registered artwork '{prov.artwork.title}'."
            })
        else:
            return Response({
                'matched': False,
                'sha256_hash': computed,
                'message': "No registered artwork matches this exact byte-level SHA-256 fingerprint. Note: cropping, re-encoding, or resizing alters file hashes."
            })
