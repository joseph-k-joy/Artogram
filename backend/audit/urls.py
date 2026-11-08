from django.urls import path
from .views import AuditEventListView

urlpatterns = [
    path('', AuditEventListView.as_view(), name='audit_event_list'),
]
