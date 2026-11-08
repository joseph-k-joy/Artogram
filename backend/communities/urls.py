from django.urls import path
from .views import (
    CommunityListView,
    CommunityDetailView,
    CommunityVerificationListCreateView,
    CommunityVerificationReviewView,
)

urlpatterns = [
    path('', CommunityListView.as_view(), name='community_list'),
    path('verifications/', CommunityVerificationListCreateView.as_view(), name='community_verifications'),
    path('verifications/<int:pk>/review/', CommunityVerificationReviewView.as_view(), name='community_verification_review'),
    path('<slug:slug>/', CommunityDetailView.as_view(), name='community_detail'),
]
