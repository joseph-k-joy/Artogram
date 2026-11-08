from .models import AuditEvent


def record_audit_event(actor, action, entity_type, entity_id, description, prev_value=None, new_value=None, ip_address=None):
    """
    Append-only recording of audit events.
    """
    return AuditEvent.objects.create(
        actor=actor,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        prev_value=prev_value,
        new_value=new_value,
        description=description,
        ip_address=ip_address,
    )
