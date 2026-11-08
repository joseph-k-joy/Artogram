from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/profiles/', include('profiles.urls')),
    path('api/artworks/', include('artworks.urls')),
    path('api/provenance/', include('provenance.urls')),
    path('api/social/', include('social.urls')),
    path('api/permissions/', include('permissions.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/communities/', include('communities.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/moderation/', include('moderation.urls')),
    path('api/audit/', include('audit.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
