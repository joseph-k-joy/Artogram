import hashlib
import io
import os
import base64
from datetime import datetime
import qrcode
from django.core.files.base import ContentFile
from django.conf import settings
from .models import ArtworkProvenance
from audit.services import record_audit_event


def generate_provenance_id():
    """
    Generate unique human-readable ID in format ART-YYYY-XXXXXX
    """
    year = datetime.now().year
    prefix = f"ART-{year}-"
    last_record = ArtworkProvenance.objects.filter(provenance_id__startswith=prefix).order_by('-provenance_id').first()

    if last_record:
        try:
            last_seq = int(last_record.provenance_id.split('-')[-1])
            new_seq = last_seq + 1
        except Exception:
            new_seq = ArtworkProvenance.objects.count() + 1
    else:
        new_seq = 1

    return f"ART-{year}-{new_seq:06d}"


def compute_sha256(file_obj_or_bytes):
    """
    Calculate SHA-256 fingerprint from raw file bytes.
    Does not assume authorship, only file content integrity.
    """
    sha256 = hashlib.sha256()
    if isinstance(file_obj_or_bytes, bytes):
        sha256.update(file_obj_or_bytes)
    elif hasattr(file_obj_or_bytes, 'read'):
        current_pos = file_obj_or_bytes.tell() if hasattr(file_obj_or_bytes, 'tell') else 0
        file_obj_or_bytes.seek(0)
        for chunk in iter(lambda: file_obj_or_bytes.read(65536), b''):
            sha256.update(chunk)
        file_obj_or_bytes.seek(current_pos)
    elif isinstance(file_obj_or_bytes, str):
        sha256.update(file_obj_or_bytes.encode('utf-8'))
    return sha256.hexdigest()


def generate_qr_code_image(target_url, provenance_id):
    """
    Generate real QR code image using python qrcode library.
    Returns (ContentFile, data_uri)
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(target_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#211C19", back_color="#FAF7F2") # Charcoal on warm cream
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    image_bytes = buffer.getvalue()

    filename = f"qr_{provenance_id}.png"
    content_file = ContentFile(image_bytes, name=filename)
    data_uri = f"data:image/png;base64,{base64.b64encode(image_bytes).decode('ascii')}"

    return content_file, data_uri


def register_artwork_provenance(artwork, user, uploaded_file=None, file_bytes=None, filename='artwork.jpg', client_host="http://localhost:5173"):
    """
    Service to register digital provenance for an artwork.
    Creates:
    1. Unique Provenance ID
    2. SHA-256 fingerprint
    3. QR code pointing to public provenance route
    4. Provenance model record
    5. Audit log event
    """
    provenance_id = generate_provenance_id()

    # Calculate SHA-256 hash and size
    if uploaded_file:
        file_hash = compute_sha256(uploaded_file)
        file_size = uploaded_file.size if hasattr(uploaded_file, 'size') else len(uploaded_file.read())
        orig_name = uploaded_file.name if hasattr(uploaded_file, 'name') else filename
        mime = getattr(uploaded_file, 'content_type', 'image/jpeg')
    elif file_bytes:
        file_hash = compute_sha256(file_bytes)
        file_size = len(file_bytes)
        orig_name = filename
        mime = 'image/jpeg'
    else:
        # Fallback for synthetic/sample artworks using title + origin seeds
        seed_bytes = f"{artwork.title}:{artwork.cultural_origin}:{artwork.original_creator_name}".encode('utf-8')
        file_hash = compute_sha256(seed_bytes)
        file_size = len(seed_bytes)
        orig_name = f"{artwork.id}_image.jpg"
        mime = 'image/jpeg'

    # Route required: /artworks/ART-2026-000001/provenance/
    relative_target = f"/artworks/{provenance_id}/provenance/"
    full_qr_target = f"{client_host}{relative_target}"

    qr_file, qr_data_uri = generate_qr_code_image(full_qr_target, provenance_id)

    provenance = ArtworkProvenance.objects.create(
        artwork=artwork,
        provenance_id=provenance_id,
        sha256_hash=file_hash,
        original_filename=orig_name,
        file_size_bytes=file_size,
        mime_type=mime,
        qr_code_image=qr_file,
        qr_code_data_url=qr_data_uri,
        qr_target_url=relative_target,
        registered_by=user,
        verification_status='registered',
        verification_badge_label='Self-Registered Cultural Work'
    )

    # Record Audit Event
    record_audit_event(
        actor=user,
        action='PROVENANCE_CREATED',
        entity_type='ArtworkProvenance',
        entity_id=provenance.provenance_id,
        description=f"Generated digital provenance {provenance_id} with SHA-256 {file_hash[:16]}... for '{artwork.title}'",
        new_value={
            'provenance_id': provenance_id,
            'sha256_hash': file_hash,
            'cultural_origin': artwork.cultural_origin,
            'original_creator': artwork.original_creator_name,
            'declaration': artwork.declaration_type
        }
    )

    return provenance
