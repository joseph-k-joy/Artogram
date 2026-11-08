from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from artworks.models import Artwork
from social.models import SocialPost, Like, Comment, Bookmark, InternalShare
from provenance.services import register_artwork_provenance


class SocialPlatformTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.artist = User.objects.create_user(username='social_artist', password='pass')
        self.user = User.objects.create_user(username='social_fan', password='pass')

        self.artwork = Artwork.objects.create(
            title='Ochre Painting',
            submitted_by=self.artist,
            original_creator_name='Artist',
            cultural_origin='Kimberley, Australia',
            art_category='Tribal & Ritual Painting'
        )
        register_artwork_provenance(self.artwork, self.artist, file_bytes=b"sample")

        self.post = SocialPost.objects.create(
            artwork=self.artwork,
            author=self.artist,
            caption='First exhibition post',
            visibility='public'
        )

    def test_feed_retrieval(self):
        res = self.client.get('/api/social/feed/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(len(res.data) >= 1)
        self.assertEqual(res.data[0]['artwork_title'], 'Ochre Painting')

    def test_like_and_unlike(self):
        self.client.force_authenticate(user=self.user)
        # Like
        res = self.client.post(f'/api/social/posts/{self.post.id}/like/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['is_liked'])
        self.assertEqual(res.data['like_count'], 1)

        # Unlike
        res_unlike = self.client.post(f'/api/social/posts/{self.post.id}/like/')
        self.assertEqual(res_unlike.status_code, status.HTTP_200_OK)
        self.assertFalse(res_unlike.data['is_liked'])
        self.assertEqual(res_unlike.data['like_count'], 0)

    def test_comment_creation_and_deletion(self):
        self.client.force_authenticate(user=self.user)
        # Create comment
        res = self.client.post(f'/api/social/posts/{self.post.id}/comments/', {'text': 'Beautiful natural ochre hues!'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        comment_id = res.data['id']

        # Delete own comment
        del_res = self.client.delete(f'/api/social/comments/{comment_id}/')
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)

    def test_follow_toggle_and_self_follow_prevention(self):
        self.client.force_authenticate(user=self.user)
        # Prevent self follow
        self_res = self.client.post(f'/api/profiles/{self.user.username}/follow/')
        self.assertEqual(self_res.status_code, status.HTTP_400_BAD_REQUEST)

        # Follow artist
        res = self.client.post(f'/api/profiles/{self.artist.username}/follow/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['is_following'])

        # Unfollow
        res_unfollow = self.client.post(f'/api/profiles/{self.artist.username}/follow/')
        self.assertEqual(res_unfollow.status_code, status.HTTP_200_OK)
        self.assertFalse(res_unfollow.data['is_following'])

    def test_bookmark_toggle(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post('/api/social/bookmarks/', {'artwork_id': self.artwork.id}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data['is_bookmarked'])

        # Retrieve saved artworks
        list_res = self.client.get('/api/social/bookmarks/')
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 1)

    def test_internal_share(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post('/api/social/shares/', {
            'artwork_id': self.artwork.id,
            'recipient_username': self.artist.username,
            'note': 'Sharing with you'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['recipient_username'], self.artist.username)
