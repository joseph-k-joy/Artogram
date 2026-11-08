from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.models import User
from .models import SocialPost, Like, Comment, Bookmark, InternalShare
from .serializers import SocialPostSerializer, CommentSerializer, BookmarkSerializer, InternalShareSerializer
from artworks.models import Artwork
from notifications.models import notify_user
from audit.services import record_audit_event


class FeedView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        posts = SocialPost.objects.select_related(
            'artwork', 'artwork__provenance', 'author', 'author__profile'
        ).prefetch_related('likes', 'comments')

        filter_type = request.query_params.get('filter', 'all')
        if request.user.is_authenticated and filter_type == 'following':
            following_ids = request.user.following_relations.values_list('following_id', flat=True)
            posts = posts.filter(author_id__in=following_ids)
        else:
            posts = posts.filter(visibility='public')

        posts = posts.order_by('-created_at')[:40]
        serializer = SocialPostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)


class PostListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        author_username = request.query_params.get('author')
        artwork_id = request.query_params.get('artwork_id')
        posts = SocialPost.objects.select_related('artwork', 'artwork__provenance', 'author', 'author__profile')

        if author_username:
            posts = posts.filter(author__username__iexact=author_username)
        if artwork_id:
            posts = posts.filter(artwork_id=artwork_id)

        serializer = SocialPostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        artwork_id = request.data.get('artwork_id')
        caption = request.data.get('caption', '').strip()
        visibility = request.data.get('visibility', 'public')

        artwork = get_object_or_404(Artwork, pk=artwork_id)

        # Ensure user can post (either owner or registered user creating a presentation)
        post = SocialPost.objects.create(
            artwork=artwork,
            author=request.user,
            caption=caption,
            visibility=visibility
        )

        serializer = SocialPostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PostDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        post = get_object_or_404(SocialPost.objects.select_related('artwork', 'author', 'author__profile'), pk=pk)
        return Response(SocialPostSerializer(post, context={'request': request}).data)

    def delete(self, request, pk):
        post = get_object_or_404(SocialPost, pk=pk)
        if post.author != request.user and not (request.user.is_staff or request.user.profile.role in ['admin', 'moderator']):
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        post.delete()
        return Response({'message': 'Post deleted.'}, status=status.HTTP_204_NO_CONTENT)


class LikeToggleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(SocialPost, pk=pk)
        like = Like.objects.filter(post=post, user=request.user).first()

        if like:
            like.delete()
            is_liked = False
        else:
            Like.objects.create(post=post, user=request.user)
            is_liked = True
            notify_user(
                recipient=post.author,
                sender=request.user,
                notification_type='like',
                title='Artwork Liked',
                message=f"@{request.user.username} liked your post on '{post.artwork.title}'.",
                target_url=f"/post/{post.id}"
            )

        return Response({
            'is_liked': is_liked,
            'like_count': post.likes.count()
        })


class CommentListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request, pk):
        post = get_object_or_404(SocialPost, pk=pk)
        comments = post.comments.filter(is_hidden=False).select_related('user', 'user__profile')
        return Response(CommentSerializer(comments, many=True, context={'request': request}).data)

    def post(self, request, pk):
        post = get_object_or_404(SocialPost, pk=pk)
        text = request.data.get('text', '').strip()
        if not text:
            return Response({'error': 'Comment text cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)

        comment = Comment.objects.create(
            post=post,
            user=request.user,
            text=text
        )

        notify_user(
            recipient=post.author,
            sender=request.user,
            notification_type='comment',
            title='New Comment',
            message=f"@{request.user.username} commented on '{post.artwork.title}': \"{text[:50]}\"",
            target_url=f"/post/{post.id}"
        )

        return Response(CommentSerializer(comment, context={'request': request}).data, status=status.HTTP_201_CREATED)


class CommentDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        comment = get_object_or_404(Comment, pk=pk)
        if comment.user != request.user and not (request.user.is_staff or request.user.profile.role in ['admin', 'moderator']):
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return Response({'message': 'Comment deleted.'}, status=status.HTTP_204_NO_CONTENT)


class BookmarkToggleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        bookmarks = Bookmark.objects.filter(user=request.user).select_related('artwork', 'artwork__provenance')
        return Response(BookmarkSerializer(bookmarks, many=True, context={'request': request}).data)

    def post(self, request):
        artwork_id = request.data.get('artwork_id')
        artwork = get_object_or_404(Artwork, pk=artwork_id)

        bookmark = Bookmark.objects.filter(user=request.user, artwork=artwork).first()
        if bookmark:
            bookmark.delete()
            is_bookmarked = False
            msg = f"Removed '{artwork.title}' from bookmarks."
        else:
            Bookmark.objects.create(user=request.user, artwork=artwork)
            is_bookmarked = True
            msg = f"Saved '{artwork.title}' to your bookmarks."

        return Response({
            'is_bookmarked': is_bookmarked,
            'message': msg
        })


class InternalShareView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        shares = InternalShare.objects.filter(recipient=request.user).select_related(
            'sender', 'recipient', 'artwork', 'artwork__provenance'
        )
        return Response(InternalShareSerializer(shares, many=True).data)

    def post(self, request):
        artwork_id = request.data.get('artwork_id')
        recipient_username = request.data.get('recipient_username', '').strip()
        note = request.data.get('note', '').strip()

        artwork = get_object_or_404(Artwork, pk=artwork_id)
        recipient = get_object_or_404(User, username__iexact=recipient_username)

        share = InternalShare.objects.create(
            sender=request.user,
            recipient=recipient,
            artwork=artwork,
            note=note
        )

        notify_user(
            recipient=recipient,
            sender=request.user,
            notification_type='comment', # share notification
            title='Artwork Shared With You',
            message=f"@{request.user.username} shared '{artwork.title}' with you.",
            target_url=f"/artworks/{artwork.id}"
        )

        return Response(InternalShareSerializer(share).data, status=status.HTTP_201_CREATED)
