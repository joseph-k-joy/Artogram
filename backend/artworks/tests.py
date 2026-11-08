from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from artworks.models import Artwork
from permissions.models import ArtworkPermission, PermissionRequest
from reports.models import MisuseReport
from communities.models import Community, CommunityVerification
from audit.models import AuditEvent


class ArtworksAndGovernanceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.artist = User.objects.create_user(username='gov_artist', password='pass')
        self.artist.profile.role = 'artist'
        self.artist.profile.save()

        self.user = User.objects.create_user(username='gov_user', password='pass')

        self.admin = User.objects.create_superuser(username='gov_admin', password='pass', email='admin@test.com')
        self.admin.profile.role = 'admin'
        self.admin.profile.save()

    def test_artwork_registration_full_flow(self):
        self.client.force_authenticate(user=self.artist)
        payload = {
            'title': 'Sacred Indigo Shawl',
            'art_category': 'Textile & Weaving',
            'cultural_origin': 'Yorubaland, Nigeria',
            'original_creator_name': 'Gov Artist',
            'description': 'Handwoven traditional indigo shawl with cassava paste resist.',
            'declaration_type': 'created_by_me',
            'tags': 'indigo, textile, yoruba',
            'downloading_allowed': False,
            'educational_use_allowed': True,
            'publish_to_feed': True,
        }
        res = self.client.post('/api/artworks/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['title'], 'Sacred Indigo Shawl')
        self.assertIsNotNone(res.data['provenance_id'])
        self.assertTrue(res.data['provenance_id'].startswith('ART-'))
        self.assertEqual(len(res.data['sha256_hash']), 64)

        # Audit event was recorded
        audit = AuditEvent.objects.filter(entity_id=res.data['id'], action='ARTWORK_REGISTERED').first()
        self.assertIsNotNone(audit)

    def test_permission_request_workflow(self):
        self.client.force_authenticate(user=self.artist)
        art = Artwork.objects.create(
            title='Carved Totem',
            submitted_by=self.artist,
            original_creator_name='Gov Artist',
            cultural_origin='Haida Gwaii'
        )
        ArtworkPermission.objects.create(artwork=art)

        # User requests permission
        self.client.force_authenticate(user=self.user)
        req_res = self.client.post('/api/permissions/requests/', {
            'artwork_id': art.id,
            'intended_usage': 'Educational Exhibition',
            'is_commercial': False,
            'description': 'Display in indigenous symposium.',
        }, format='json')
        self.assertEqual(req_res.status_code, status.HTTP_201_CREATED)
        req_id = req_res.data['id']

        # Artist responds and approves
        self.client.force_authenticate(user=self.artist)
        resp_res = self.client.post(f'/api/permissions/requests/{req_id}/respond/', {
            'status': 'approved',
            'artist_response_note': 'Approved with full credit requirement.'
        }, format='json')
        self.assertEqual(resp_res.status_code, status.HTTP_200_OK)
        self.assertEqual(resp_res.data['status'], 'approved')

    def test_misuse_report_workflow(self):
        art = Artwork.objects.create(
            title='Temple Tapestry',
            submitted_by=self.artist,
            original_creator_name='Artist',
            cultural_origin='Bhutan'
        )

        # User files misuse report
        self.client.force_authenticate(user=self.user)
        report_res = self.client.post('/api/reports/', {
            'artwork_id': art.id,
            'report_type': 'missing_attribution',
            'description': 'Found this artwork re-uploaded elsewhere without any cultural attribution.',
            'suspected_external_url': 'https://example-art-theft.com'
        }, format='json')
        self.assertEqual(report_res.status_code, status.HTTP_201_CREATED)
        report_id = report_res.data['id']

        # Admin reviews and changes status
        self.client.force_authenticate(user=self.admin)
        status_res = self.client.patch(f'/api/reports/{report_id}/update-status/', {
            'status': 'under_review',
            'admin_notes': 'Case opened for external attribution inquiry.'
        }, format='json')
        self.assertEqual(status_res.status_code, status.HTTP_200_OK)
        self.assertEqual(status_res.data['status'], 'under_review')

    def test_admin_overview_and_permissions(self):
        # Non-admin rejected
        self.client.force_authenticate(user=self.user)
        res_fail = self.client.get('/api/moderation/overview/')
        self.assertEqual(res_fail.status_code, status.HTTP_403_FORBIDDEN)

        # Admin allowed
        self.client.force_authenticate(user=self.admin)
        res_ok = self.client.get('/api/moderation/overview/')
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
        self.assertIn('stats', res_ok.data)
        self.assertIn('total_users', res_ok.data['stats'])
