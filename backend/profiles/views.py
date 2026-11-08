from rest_framework import status, views, permissions, generics
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import UserProfile, Follow
from .serializers import ProfileDetailSerializer, ProfileUpdateSerializer
from accounts.serializers import UserSerializer
from notifications.models import notify_user
from audit.services import record_audit_event


class ProfileDetailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username__iexact=username)
        serializer = ProfileDetailSerializer(user.profile, context={'request': request})
        return Response(serializer.data)


class ProfileUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        profile = request.user.profile
        serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(ProfileDetailSerializer(profile, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FollowToggleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username):
        target_user = get_object_or_404(User, username__iexact=username)
        if target_user == request.user:
            return Response({'error': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        follow_relation = Follow.objects.filter(follower=request.user, following=target_user).first()
        if follow_relation:
            follow_relation.delete()
            is_following = False
            msg = f"You unfollowed @{target_user.username}."
        else:
            Follow.objects.create(follower=request.user, following=target_user)
            is_following = True
            msg = f"You are now following @{target_user.username}."
            notify_user(
                recipient=target_user,
                sender=request.user,
                notification_type='follow',
                title='New Follower',
                message=f"@{request.user.username} started following you.",
                target_url=f"/profile/{request.user.username}"
            )

        followers_count = Follow.objects.filter(following=target_user).count()
        return Response({
            'message': msg,
            'is_following': is_following,
            'followers_count': followers_count
        })


class UserFollowersListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username__iexact=username)
        followers = User.objects.filter(following_relations__following=user)
        return Response(UserSerializer(followers, many=True).data)


class UserFollowingListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, username):
        user = get_object_or_404(User, username__iexact=username)
        following = User.objects.filter(follower_relations__follower=user)
        return Response(UserSerializer(following, many=True).data)
