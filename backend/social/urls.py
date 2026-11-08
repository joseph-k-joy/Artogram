from django.urls import path
from .views import (
    FeedView,
    PostListCreateView,
    PostDetailView,
    LikeToggleView,
    CommentListCreateView,
    CommentDetailView,
    BookmarkToggleView,
    InternalShareView,
)

urlpatterns = [
    path('feed/', FeedView.as_view(), name='feed'),
    path('posts/', PostListCreateView.as_view(), name='posts_list_create'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post_detail'),
    path('posts/<int:pk>/like/', LikeToggleView.as_view(), name='post_like_toggle'),
    path('posts/<int:pk>/comments/', CommentListCreateView.as_view(), name='post_comments'),
    path('comments/<int:pk>/', CommentDetailView.as_view(), name='comment_detail'),
    path('bookmarks/', BookmarkToggleView.as_view(), name='bookmarks'),
    path('shares/', InternalShareView.as_view(), name='shares'),
]
