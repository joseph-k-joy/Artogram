from django.urls import path
from .views import (
    ArtworkPermissionDetailView,
    PermissionRequestListCreateView,
    PermissionRequestRespondView,
)

urlpatterns = [
    path('artwork/<int:artwork_id>/', ArtworkPermissionDetailView.as_view(), name='artwork_permissions'),
    path('requests/', PermissionRequestListCreateView.as_view(), name='permission_requests'),
    path('requests/<int:pk>/respond/', PermissionRequestRespondView.as_view(), name='permission_request_respond'),
]
