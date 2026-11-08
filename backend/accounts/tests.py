from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status


class AccountsAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_user_registration(self):
        data = {
            'username': 'test_creator',
            'email': 'creator@test.com',
            'password': 'StrongPassword2026!',
            'confirm_password': 'StrongPassword2026!',
            'full_name': 'Test Creator',
            'role': 'artist',
            'primary_art_form': 'Pottery',
            'location': 'Kyoto'
        }
        res = self.client.post('/api/auth/register/', data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])
        self.assertEqual(res.data['user']['username'], 'test_creator')
        self.assertEqual(res.data['user']['profile']['role'], 'artist')

    def test_registration_password_mismatch(self):
        data = {
            'username': 'mismatch_user',
            'email': 'mismatch@test.com',
            'password': 'Password1!',
            'confirm_password': 'Password2!'
        }
        res = self.client.post('/api/auth/register/', data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_and_jwt(self):
        user = User.objects.create_user(username='login_tester', email='login@test.com', password='TestPassword123!')
        res = self.client.post('/api/auth/login/', {'username': 'login_tester', 'password': 'TestPassword123!'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', res.data)
        token = res.data['tokens']['access']

        # Test authenticated me endpoint
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        me_res = self.client.get('/api/auth/me/')
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data['username'], 'login_tester')
