from django.urls import path
from .views import (
    AdminOverviewView,
    AdminUsersListView,
    AdminArtworkStatusView,
    AdminCommentsListView,
)

urlpatterns = [
    path('overview/', AdminOverviewView.as_view(), name='admin_overview'),
    path('users/', AdminUsersListView.as_view(), name='admin_users'),
    path('users/<int:pk>/', AdminUsersListView.as_view(), name='admin_user_update'),
    path('artworks/<int:pk>/status/', AdminArtworkStatusView.as_view(), name='admin_artwork_status'),
    path('comments/', AdminCommentsListView.as_view(), name='admin_comments'),
    path('comments/<int:pk>/', AdminCommentsListView.as_view(), name='admin_comment_update'),
]
