from django.urls import path
from .views import (
    MisuseReportListCreateView,
    MisuseReportDetailView,
    MisuseReportStatusUpdateView,
)

urlpatterns = [
    path('', MisuseReportListCreateView.as_view(), name='reports_list_create'),
    path('<int:pk>/', MisuseReportDetailView.as_view(), name='report_detail'),
    path('<int:pk>/update-status/', MisuseReportStatusUpdateView.as_view(), name='report_update_status'),
]
