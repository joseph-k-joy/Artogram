from django.urls import path
from .views import (
    ProfileDetailView,
    ProfileUpdateView,
    FollowToggleView,
    UserFollowersListView,
    UserFollowingListView,
)

urlpatterns = [
    path('me/update/', ProfileUpdateView.as_view(), name='profile_update'),
    path('<str:username>/', ProfileDetailView.as_view(), name='profile_detail'),
    path('<str:username>/follow/', FollowToggleView.as_view(), name='profile_follow_toggle'),
    path('<str:username>/followers/', UserFollowersListView.as_view(), name='profile_followers'),
    path('<str:username>/following/', UserFollowingListView.as_view(), name='profile_following'),
]
