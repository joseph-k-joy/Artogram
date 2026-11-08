from django.utils import timezone
from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import MisuseReport, ReportEvidence
from .serializers import MisuseReportSerializer
from artworks.models import Artwork
from notifications.models import notify_user
from audit.services import record_audit_event


class MisuseReportListCreateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_staff or getattr(user.profile, 'role', '') in ['admin', 'moderator']:
            reports = MisuseReport.objects.all().select_related('artwork', 'artwork__provenance', 'reporter').prefetch_related('evidence_items')
        else:
            # Ordinary users can view reports they filed or reports concerning their artworks
            reports = MisuseReport.objects.filter(
                reporter=user
            ).select_related('artwork', 'artwork__provenance', 'reporter').prefetch_related('evidence_items')

        serializer = MisuseReportSerializer(reports, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        artwork_id = data.get('artwork_id')
        report_type = data.get('report_type')
        description = data.get('description', '').strip()
        suspected_external_url = data.get('suspected_external_url', '').strip()

        artwork = get_object_or_404(Artwork, pk=artwork_id)

        if not report_type or not description:
            return Response({'error': 'Report category and detailed description are required.'}, status=status.HTTP_400_BAD_REQUEST)

        report = MisuseReport.objects.create(
            artwork=artwork,
            reporter=request.user,
            report_type=report_type,
            suspected_external_url=suspected_external_url,
            description=description,
            status='submitted'
        )

        # Handle evidence file or link
        evidence_file = request.FILES.get('evidence_file')
        evidence_url = data.get('evidence_url', '')
        evidence_desc = data.get('evidence_description', '')

        if evidence_file or evidence_url:
            ReportEvidence.objects.create(
                report=report,
                file=evidence_file,
                file_url=evidence_url,
                description=evidence_desc or 'Uploaded supporting evidence'
            )

        # Notify artwork owner of the allegation
        notify_user(
            recipient=artwork.submitted_by,
            sender=request.user,
            notification_type='report_status',
            title='Artwork Misuse Report Filed',
            message=f"A misuse report has been submitted regarding '{artwork.title}'. Artogram moderators are reviewing the claim.",
            target_url=f"/my-reports"
        )

        # Record audit event
        record_audit_event(
            actor=request.user,
            action='MISUSE_REPORT_SUBMITTED',
            entity_type='MisuseReport',
            entity_id=report.id,
            description=f"Report #{report.id} ({report_type}) submitted by @{request.user.username} on artwork '{artwork.title}'"
        )

        return Response(MisuseReportSerializer(report).data, status=status.HTTP_201_CREATED)


class MisuseReportDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        report = get_object_or_404(
            MisuseReport.objects.select_related('artwork', 'artwork__provenance', 'reporter').prefetch_related('evidence_items'),
            pk=pk
        )
        if report.reporter != request.user and not (request.user.is_staff or getattr(request.user.profile, 'role', '') in ['admin', 'moderator']):
            return Response({'error': 'Unauthorized.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(MisuseReportSerializer(report).data)


class MisuseReportStatusUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        if not (user.is_staff or getattr(user.profile, 'role', '') in ['admin', 'moderator']):
            return Response({'error': 'Admin/Moderator permissions required.'}, status=status.HTTP_403_FORBIDDEN)

        report = get_object_or_404(MisuseReport, pk=pk)
        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes', '').strip()

        if new_status not in ['submitted', 'under_review', 'action_taken', 'resolved', 'rejected']:
            return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)

        prev_status = report.status
        report.status = new_status
        if admin_notes:
            report.admin_notes = admin_notes
        report.reviewed_by = user
        report.reviewed_at = timezone.now()
        report.save()

        # If action taken or resolved, update artwork status if applicable
        if new_status == 'action_taken':
            report.artwork.status = 'report_under_review'
            report.artwork.save()
            if hasattr(report.artwork, 'provenance'):
                report.artwork.provenance.verification_status = 'report_under_review'
                report.artwork.provenance.save()

        # Notify reporter
        notify_user(
            recipient=report.reporter,
            sender=user,
            notification_type='report_status',
            title='Report Status Updated',
            message=f"Your report #{report.id} on '{report.artwork.title}' is now: {new_status.replace('_', ' ').upper()}.",
            target_url=f"/my-reports"
        )

        record_audit_event(
            actor=user,
            action='MISUSE_REPORT_REVIEWED',
            entity_type='MisuseReport',
            entity_id=report.id,
            description=f"Report #{report.id} status changed from {prev_status} to {new_status}",
            prev_value={'status': prev_status},
            new_value={'status': new_status, 'admin_notes': admin_notes}
        )

        return Response(MisuseReportSerializer(report).data)
