from django.urls import path
from .views import ArtworkListCreateView, ArtworkDetailView, ArtworkCategoriesView

urlpatterns = [
    path('', ArtworkListCreateView.as_view(), name='artwork_list_create'),
    path('categories/', ArtworkCategoriesView.as_view(), name='artwork_categories'),
    path('<int:pk>/', ArtworkDetailView.as_view(), name='artwork_detail'),
]
