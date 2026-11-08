from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from artworks.models import Artwork
from provenance.models import ArtworkProvenance
from provenance.services import generate_provenance_id, compute_sha256, register_artwork_provenance


class ProvenanceSystemTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='prov_artist', password='pass')
        self.artwork = Artwork.objects.create(
            title='Ancient Motif',
            submitted_by=self.user,
            original_creator_name='Prov Artist',
            cultural_origin='Anatolia',
            art_category='Indigenous Folk Art'
        )

    def test_unique_provenance_id_format(self):
        pid = generate_provenance_id()
        self.assertTrue(pid.startswith('ART-'))
        parts = pid.split('-')
        self.assertEqual(len(parts), 3)
        self.assertEqual(len(parts[2]), 6) # 6 digits e.g. 000001

    def test_compute_sha256(self):
        raw_bytes = b"Artogram cultural heritage byte stream test"
        hash_result = compute_sha256(raw_bytes)
        self.assertEqual(len(hash_result), 64)
        # Consistent hash
        self.assertEqual(hash_result, compute_sha256(raw_bytes))

    def test_register_provenance_and_qr(self):
        prov = register_artwork_provenance(
            artwork=self.artwork,
            user=self.user,
            file_bytes=b"sample image content for qr testing"
        )
        self.assertIsNotNone(prov.provenance_id)
        self.assertEqual(len(prov.sha256_hash), 64)
        self.assertTrue(prov.qr_code_data_url.startswith('data:image/png;base64,'))

        # Test public detail view by provenance ID
        res = self.client.get(f'/api/provenance/{prov.provenance_id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['provenance_id'], prov.provenance_id)
        self.assertEqual(res.data['artwork']['title'], 'Ancient Motif')

        # Test identity-card data endpoint
        card_res = self.client.get(f'/api/provenance/{prov.provenance_id}/identity-card/')
        self.assertEqual(card_res.status_code, status.HTTP_200_OK)
        self.assertEqual(card_res.data['provenance_id'], prov.provenance_id)
        self.assertEqual(card_res.data['cultural_origin'], 'Anatolia')

    def test_verify_hash_endpoint(self):
        prov = register_artwork_provenance(
            artwork=self.artwork,
            user=self.user,
            file_bytes=b"unique verification test bytes"
        )
        # Test positive match
        res_match = self.client.post('/api/provenance/verify-hash/', {'hash': prov.sha256_hash}, format='json')
        self.assertEqual(res_match.status_code, status.HTTP_200_OK)
        self.assertTrue(res_match.data['matched'])
        self.assertEqual(res_match.data['provenance_id'], prov.provenance_id)

        # Test negative match
        res_nomatch = self.client.post('/api/provenance/verify-hash/', {'hash': '0000000000000000000000000000000000000000000000000000000000000000'}, format='json')
        self.assertEqual(res_nomatch.status_code, status.HTTP_200_OK)
        self.assertFalse(res_nomatch.data['matched'])
