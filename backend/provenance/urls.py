from django.urls import path
from .views import ProvenanceDetailView, IdentityCardView, VerifyHashView

urlpatterns = [
    path('verify-hash/', VerifyHashView.as_view(), name='provenance_verify_hash'),
    path('<str:provenance_id>/', ProvenanceDetailView.as_view(), name='provenance_detail'),
    path('<str:provenance_id>/identity-card/', IdentityCardView.as_view(), name='provenance_identity_card'),
]
