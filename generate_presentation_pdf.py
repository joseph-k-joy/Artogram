import os
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.pdfgen import canvas

# Palette constants
TERRACOTTA = colors.HexColor('#C85A32')
TERRACOTTA_DARK = colors.HexColor('#A9431E')
SAND = colors.HexColor('#E8DEC8')
SAND_LIGHT = colors.HexColor('#F4EFE6')
CREAM = colors.HexColor('#FAF7F2')
OLIVE = colors.HexColor('#5C6B47')
OLIVE_LIGHT = colors.HexColor('#EEF2E6')
BROWN = colors.HexColor('#3D271D')
CHARCOAL = colors.HexColor('#211C19')
WHITE = colors.HexColor('#FFFFFF')
AMBER_BG = colors.HexColor('#FEF3C7')
AMBER_BORDER = colors.HexColor('#F59E0B')

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        page_w, page_h = landscape(A4)

        # Skip on cover slide (page 1)
        if self._pageNumber > 1:
            # Header line
            self.setStrokeColor(TERRACOTTA)
            self.setLineWidth(2)
            self.line(40, page_h - 32, page_w - 40, page_h - 32)

            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(BROWN)
            self.drawString(40, page_h - 26, "ARTOGRAM  •  WHERE ART MEETS IDENTITY")

            self.setFont("Helvetica", 8)
            self.setFillColor(OLIVE)
            self.drawRightString(page_w - 40, page_h - 26, "PROJECT PRESENTATION DECK")

            # Footer line
            self.setStrokeColor(SAND)
            self.setLineWidth(1)
            self.line(40, 32, page_w - 40, 32)

            self.setFont("Helvetica", 8)
            self.setFillColor(CHARCOAL)
            self.drawString(40, 20, "Artogram: Instagram-Model Cultural Platform with Cryptographic Provenance")

            page_str = f"Slide {self._pageNumber} of {page_count}"
            self.drawRightString(page_w - 40, 20, page_str)

        self.restoreState()


def build_deck(filename="Artogram_Presentation_Deck.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=landscape(A4),
        leftMargin=40,
        rightMargin=40,
        topMargin=42,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=36,
        leading=42,
        textColor=BROWN,
        alignment=0,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=20,
        textColor=TERRACOTTA,
        alignment=0,
        spaceAfter=14
    )

    slide_heading = ParagraphStyle(
        'SlideHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=BROWN,
        spaceAfter=3
    )

    slide_subheading = ParagraphStyle(
        'SlideSubheading',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=OLIVE,
        spaceAfter=12
    )

    body_style = ParagraphStyle(
        'SlideBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=CHARCOAL
    )

    body_bold = ParagraphStyle(
        'SlideBodyBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=BROWN
    )

    callout_text = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=BROWN
    )

    highlight_tag = ParagraphStyle(
        'HighlightTag',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=WHITE
    )

    story = []

    # =========================================================================
    # SLIDE 1: COVER SLIDE
    # =========================================================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("ARTOGRAM", title_style))
    story.append(Paragraph("WHERE ART MEETS IDENTITY", subtitle_style))

    # The requested highlight point
    highlight_content = Paragraph(
        "<b>CORE PLATFORM DISTINCTION:</b><br/>"
        "ARTOGRAM is intentionally built as an <b>Instagram-model visual social network</b> engineered "
        "specifically for artists, traditional artisans, and cultural lineages to showcase their creative talents, "
        "engage with followers, and build authentic audiences — <i>not just a generic administrative database, "
        "corporate dashboard, or static website.</i>",
        callout_text
    )

    highlight_box = Table(
        [[highlight_content]],
        colWidths=[762]
    )
    highlight_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SAND_LIGHT),
        ('BOX', (0,0), (-1,-1), 2, TERRACOTTA),
        ('PADDING', (0,0), (-1,-1), 14),
        ('ROUNDEDCORNERS', [10, 10, 10, 10]),
    ]))
    story.append(highlight_box)
    story.append(Spacer(1, 16))

    meta_table_data = [
        [
            Paragraph("<b>Architecture:</b> React 19 + Django REST + PWA + SQLite/PostgreSQL", body_style),
            Paragraph("<b>Security & Integrity:</b> SHA-256 Byte Hashes + Physical QR Codes", body_style),
        ],
        [
            Paragraph("<b>Central Feature:</b> Artogram Digital Identity Card Component", body_style),
            Paragraph("<b>Author:</b> Joseph K Joy (Lead Engineer & Architect)", body_style)
        ],
        [
            Paragraph("<b>Target Environment:</b> Localhost (Fully Operational & Seeded)", body_style),
            Paragraph("<b>Repository:</b> github.com/joseph-k-joy/Artogram", body_style)
        ]
    ]
    meta_table = Table(meta_table_data, colWidths=[380, 382])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CREAM),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, SAND),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 2: THE PROBLEM CONTEXT
    # =========================================================================
    story.append(Paragraph("1. The Problem Context", slide_heading))
    story.append(Paragraph("Why Traditional Artists and Cultural Creators Are Failed by Generic Social Media", slide_subheading))

    problem_cards = [
        [
            Paragraph("<b>1. Attribution Stripping</b>", body_bold),
            Paragraph("<b>2. Unauthorised Commercial Scraping</b>", body_bold),
        ],
        [
            Paragraph(
                "When artworks, tribal motifs, and heritage designs are uploaded to mainstream social platforms "
                "(Instagram, Pinterest, X), metadata and context are instantly stripped. Reposts and scrapers "
                "erase original creator credits, leading to cultural erasure and theft.",
                body_style
            ),
            Paragraph(
                "Automated scrapers and e-commerce bot storefronts rip high-res art from public social feeds "
                "to sell molded replicas, apparel prints, and dropshipped goods with zero royalties, consent, "
                "or lineage recognition.",
                body_style
            )
        ],
        [
            Paragraph("<b>3. Broken Digital-Physical Bridge</b>", body_bold),
            Paragraph("<b>4. Zero Legal & Covenant Clarity</b>", body_bold),
        ],
        [
            Paragraph(
                "Physical exhibits in galleries, museum collections, and artisan craft fairs lack an authoritative, "
                "instant way for visitors to scan an artwork on a wall and inspect its verifiable provenance, creator "
                "declaration, and authentic background.",
                body_style
            ),
            Paragraph(
                "Mainstream social networks provide all-or-nothing copyright terms. Artists have no standard "
                "mechanism to permit educational research while strictly banning unauthorized commercial exploitation "
                "or sacred motif desecration.",
                body_style
            )
        ]
    ]

    p_table = Table(problem_cards, colWidths=[375, 375])
    p_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,1), SAND_LIGHT),
        ('BACKGROUND', (1,0), (1,1), SAND_LIGHT),
        ('BACKGROUND', (0,2), (0,3), CREAM),
        ('BACKGROUND', (1,2), (1,3), CREAM),
        ('BOX', (0,0), (0,1), 1, SAND),
        ('BOX', (1,0), (1,1), 1, SAND),
        ('BOX', (0,2), (0,3), 1, SAND),
        ('BOX', (1,2), (1,3), 1, SAND),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(p_table)

    story.append(Spacer(1, 12))
    solution_banner = Table(
        [[Paragraph(
            "<b>THE ARTOGRAM SOLUTION:</b> Transforming the Instagram creator paradigm with an underlying "
            "cryptographic provenance engine, permanent sequential IDs, and verifiable digital Identity Cards.",
            callout_text
        )]],
        colWidths=[762]
    )
    solution_banner.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), OLIVE_LIGHT),
        ('BOX', (0,0), (-1,-1), 1.5, OLIVE),
        ('PADDING', (0,0), (-1,-1), 8),
        ('ROUNDEDCORNERS', [6,6,6,6]),
    ]))
    story.append(solution_banner)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 3: THE INSTAGRAM MODEL TRANSFORMED
    # =========================================================================
    story.append(Paragraph("2. The Instagram Model Transformed for Creators", slide_heading))
    story.append(Paragraph("A True Social Platform Where Artists Showcase Talents — Not Just A Generic Website", slide_subheading))

    ig_comparison_data = [
        [
            Paragraph("<b>Mainstream Social Platform (Instagram)</b>", body_bold),
            Paragraph("<b>ARTOGRAM Cultural Creator Platform</b>", body_bold)
        ],
        [
            Paragraph("• Ephemeral, algorithmic consumption feed prioritizing paid ads", body_style),
            Paragraph("• <b>Visual Creator Timeline (`/feed`):</b> Pure focus on authentic artwork showcasing, creator portfolios, and cultural discovery", body_style)
        ],
        [
            Paragraph("• Strips image metadata; encourages uncredited viral re-sharing", body_style),
            Paragraph("• <b>Attribution-Preserving Sharing:</b> Internal share modal transmits artwork identity, creator credits, and provenance card intact", body_style)
        ],
        [
            Paragraph("• Likes and comments lack cultural context or creator covenants", body_style),
            Paragraph("• <b>Respectful Engagement Engine:</b> Live duplicate-safe likes, threaded comments, saved vaults, and follow graphs", body_style)
        ],
        [
            Paragraph("• No physical world connection or verification link", body_style),
            Paragraph("• <b>Physical/Digital QR Bridge:</b> Every post connects to an immutable physical Identity Card and public verification certificate", body_style)
        ],
        [
            Paragraph("• No formal reuse licensing or attribution dispute mechanism", body_style),
            Paragraph("• <b>Permission Hub & Misuse Reports:</b> Built-in workflows for academic reuse licensing and evidence-backed misuse reporting", body_style)
        ]
    ]

    ig_table = Table(ig_comparison_data, colWidths=[375, 375])
    ig_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), SAND_LIGHT),
        ('BACKGROUND', (1,0), (1,-1), CREAM),
        ('BOX', (0,0), (-1,-1), 1.5, TERRACOTTA),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SAND),
        ('PADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(ig_table)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 4: THE SIGNATURE INNOVATION - IDENTITY CARD
    # =========================================================================
    story.append(Paragraph("3. Signature Innovation: The Artogram Identity Card", slide_heading))
    story.append(Paragraph("A Standardized, Shareable & Downloadable Digital Identity for Every Registered Work", slide_subheading))

    card_breakdown = [
        [
            Paragraph("<b>Component: ArtworkIdentityCard.jsx</b>", body_bold),
            Paragraph("<b>Key Functional Capabilities</b>", body_bold)
        ],
        [
            Paragraph(
                "<b>1. Visual Artwork Showcase:</b> High-resolution preview with lineage badge.<br/>"
                "<b>2. Attributed Creator & Origin:</b> Explicit creator name, username, and cultural region.<br/>"
                "<b>3. Sequential Provenance ID:</b> Human-readable identifier (e.g. <code>ART-2026-000001</code>).<br/>"
                "<b>4. Cryptographic Checksum:</b> 64-char SHA-256 fingerprint computed from raw bytes.<br/>"
                "<b>5. Verifiable QR Matrix:</b> Resolves directly to public provenance certificates.<br/>"
                "<b>6. Reuse Covenants Matrix:</b> Clear permissions for educational vs. commercial use.<br/>"
                "<b>7. Mandatory Credit Notice:</b> Standardized citation string for researchers.",
                body_style
            ),
            Paragraph(
                "<b>• 1-Click High-Res PNG Export:</b><br/>"
                "Integrated with <code>html2canvas</code> to render and export crisp 300 DPI graphics directly "
                "in the browser. Galleries, museums, and craft stalls can print this card for physical exhibition display.<br/><br/>"
                "<b>• Zero-Login Public Verification:</b><br/>"
                "Scanning the card's QR code on any smartphone camera immediately opens the public certificate route "
                "<code>/artworks/ART-YYYY-XXXXXX/provenance/</code> with full audit events.<br/><br/>"
                "<b>• Social Transmission:</b><br/>"
                "Users can share the card internally with other members or copy direct public verification URLs.",
                body_style
            )
        ]
    ]

    card_table = Table(card_breakdown, colWidths=[375, 375])
    card_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SAND_LIGHT),
        ('BOX', (0,0), (-1,-1), 2, TERRACOTTA),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SAND),
        ('PADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(card_table)

    story.append(Spacer(1, 12))
    notice_box = Table(
        [[Paragraph(
            "<b>ARCHITECTURAL SEPARATION OF CONCERNS:</b><br/>"
            "<code>Artwork</code> (Art asset & metadata) &nbsp;|&nbsp; "
            "<code>ArtworkProvenance</code> (SHA-256 & QR) &nbsp;|&nbsp; "
            "<code>SocialPost</code> (Feed presentation) &nbsp;|&nbsp; "
            "<code>ArtworkIdentityCard</code> (Exportable component).<br/>"
            "An artwork can be featured in multiple social posts without minting duplicate provenance records.",
            body_style
        )]],
        colWidths=[762]
    )
    notice_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CREAM),
        ('BOX', (0,0), (-1,-1), 1, OLIVE),
        ('PADDING', (0,0), (-1,-1), 8),
        ('ROUNDEDCORNERS', [6,6,6,6]),
    ]))
    story.append(notice_box)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 5: SYSTEM ARCHITECTURE & FULL TECH STACK
    # =========================================================================
    story.append(Paragraph("4. System Architecture & Technology Stack", slide_heading))
    story.append(Paragraph("Enterprise-Grade Full-Stack Implementation Built for Robustness & PWA Installability", slide_subheading))

    stack_data = [
        [
            Paragraph("<b>Frontend (React 19 & Vite 8)</b>", body_bold),
            Paragraph("<b>Backend (Django 6 & DRF 3.18)</b>", body_bold),
            Paragraph("<b>Persistence & Operations</b>", body_bold)
        ],
        [
            Paragraph(
                "• <b>React 19 & Vite 8:</b> Blazing fast SPA architecture.<br/>"
                "• <b>Tailwind CSS v4:</b> Custom earthy cultural palette.<br/>"
                "• <b>React Router v7:</b> Client-side routing with role guards.<br/>"
                "• <b>Axios + JWT Interceptors:</b> Automatic token refresh.<br/>"
                "• <b>PWA Plugin:</b> Precaching service worker & manifest.<br/>"
                "• <b>html2canvas:</b> Client-side PNG card rendering.<br/>"
                "• <b>Lucide Icons:</b> Accessible visual iconography.",
                body_style
            ),
            Paragraph(
                "• <b>Django 6.0 & DRF 3.18:</b> Modular app architecture.<br/>"
                "• <b>Simple JWT 5.5:</b> Access & refresh token rotation.<br/>"
                "• <b>Python hashlib:</b> SHA-256 raw byte fingerprinting.<br/>"
                "• <b>Python qrcode & Pillow:</b> Physical QR image matrices.<br/>"
                "• <b>Append-Only Audit Engine:</b> Immutable event recording.<br/>"
                "• <b>Granular RBAC:</b> Visitor, User, Artist, Moderator, Admin.<br/>"
                "• <b>Seed Data Engine:</b> Realistic cultural showcase data.",
                body_style
            ),
            Paragraph(
                "• <b>PostgreSQL 16:</b> Production-ready database container via Docker Compose.<br/>"
                "• <b>SQLite 3 Fallback:</b> Instant zero-config local run.<br/>"
                "• <b>Django Media Storage:</b> Local disk media with Cloudinary adapter support.<br/>"
                "• <b>Automated Testing:</b> 17 unit and integration tests covering all critical workflows.<br/>"
                "• <b>Localhost Ready:</b> 100% runnable without third-party cloud costs.",
                body_style
            )
        ]
    ]

    stack_table = Table(stack_data, colWidths=[248, 252, 252])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CREAM),
        ('BOX', (0,0), (-1,-1), 1.5, BROWN),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SAND),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(stack_table)

    story.append(Spacer(1, 10))
    pwa_box = Table(
        [[Paragraph(
            "<b>PWA READINESS:</b> Artogram installs as a standalone native app on Android, iOS, Windows, and macOS, "
            "featuring an offline fallback page (<code>/offline.html</code>), precached assets, and automatic install prompt handling.",
            callout_text
        )]],
        colWidths=[762]
    )
    pwa_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SAND_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, TERRACOTTA),
        ('PADDING', (0,0), (-1,-1), 8),
        ('ROUNDEDCORNERS', [6,6,6,6]),
    ]))
    story.append(pwa_box)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 6: GOVERNANCE, PERMISSIONS & INTEGRITY
    # =========================================================================
    story.append(Paragraph("5. Ethical Governance, Permissions & Integrity", slide_heading))
    story.append(Paragraph("Bridging Contemporary Art Sharing with Cultural Sovereignty & Accountability", slide_subheading))

    gov_data = [
        [
            Paragraph("<b>Reuse Permission Hub</b>", body_bold),
            Paragraph("<b>Misuse Reporting Pipeline</b>", body_bold),
            Paragraph("<b>Community Guild Verifications</b>", body_bold)
        ],
        [
            Paragraph(
                "Institutions, museums, and educators can formally request reuse licenses.<br/><br/>"
                "Artists approve or reject requests with custom covenants, automatically generating notifications "
                "and recording decisions in the audit log.",
                body_style
            ),
            Paragraph(
                "Users can report suspect misuse (missing attribution, unauthorized sales, sacrilege).<br/><br/>"
                "Transparent lifecycle:<br/>"
                "<code>SUBMITTED &rarr; UNDER REVIEW &rarr; ACTION TAKEN / RESOLVED / REJECTED</code>.<br/>"
                "Evidence URLs & screenshots inspected by admins.",
                body_style
            ),
            Paragraph(
                "Designated cultural councils (e.g. <i>Sahyadri Warli Artisan Council</i>, <i>Egba Adire Guild</i>) "
                "review traditional claims.<br/><br/>"
                "Elevates artworks to <b>Community Verified & Approved</b>, clearly distinct from self-registered works.",
                body_style
            )
        ]
    ]

    gov_table = Table(gov_data, colWidths=[248, 252, 252])
    gov_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SAND_LIGHT),
        ('BOX', (0,0), (-1,-1), 1.5, OLIVE),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SAND),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(gov_table)

    story.append(Spacer(1, 10))
    admin_bar = Table(
        [[Paragraph(
            "<b>ADMIN CONSOLE (`/admin/dashboard`):</b> Features live 8-metric telemetry, user role promotion, "
            "comment moderation (hide/unhide), report review, and an append-only database audit history.",
            callout_text
        )]],
        colWidths=[762]
    )
    admin_bar.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CREAM),
        ('BOX', (0,0), (-1,-1), 1, BROWN),
        ('PADDING', (0,0), (-1,-1), 8),
        ('ROUNDEDCORNERS', [6,6,6,6]),
    ]))
    story.append(admin_bar)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 7: LIMITATIONS, ETHICAL BOUNDS & FUTURE ROADMAP
    # =========================================================================
    story.append(Paragraph("6. Limitations & Future Development Scope", slide_heading))
    story.append(Paragraph("Transparent Engineering Bounds & Forward-Looking Research Trajectory", slide_subheading))

    lim_future_data = [
        [
            Paragraph("<b>Current Engineering & Legal Boundaries</b>", body_bold),
            Paragraph("<b>Future Development Roadmap</b>", body_bold)
        ],
        [
            Paragraph(
                "<b>1. Cryptographic Scope of SHA-256:</b><br/>"
                "SHA-256 certifies exact byte-level integrity. It proves the exact file has not been altered, "
                "but cannot detect cropped, resized, or filter-modified copies.<br/><br/>"
                "<b>2. Attribution Claims vs. Legal Copyright:</b><br/>"
                "Artogram records cultural provenance and creator declarations; it does not replace government copyright registries.<br/><br/>"
                "<b>3. Localhost Demonstration Scope:</b><br/>"
                "In hackathon mode, files are stored on local Django media and tested on local SQLite/Postgres.",
                body_style
            ),
            Paragraph(
                "<b>1. Neural Perceptual Hashing (pHash + AI):</b><br/>"
                "Combine exact SHA-256 with perceptual neural embeddings to identify cropped or color-shifted stolen art copies across the web.<br/><br/>"
                "<b>2. Automated Misuse Web Crawler:</b><br/>"
                "Background daemon periodically querying public search engines and social platforms to alert artists if their art is re-uploaded uncredited.<br/><br/>"
                "<b>3. Multi-Signature Tribal Elder Consensus:</b><br/>"
                "Require multiple verified trustees to sign off on community-held heritage claims.<br/><br/>"
                "<b>4. Decentralized Storage Anchoring:</b><br/>"
                "Optional IPFS/Arweave permanent decentralized storage mirroring.",
                body_style
            )
        ]
    ]

    lf_table = Table(lim_future_data, colWidths=[375, 375])
    lf_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CREAM),
        ('BOX', (0,0), (-1,-1), 1.5, TERRACOTTA),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SAND),
        ('PADDING', (0,0), (-1,-1), 9),
    ]))
    story.append(lf_table)

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 8: SUMMARY & LIVE DEMO INSTRUCTIONS
    # =========================================================================
    story.append(Paragraph("7. Summary & Live Demo Credentials", slide_heading))
    story.append(Paragraph("Ready for Live Hackathon Evaluation & Localhost Demonstration", slide_subheading))

    demo_accounts = [
        [
            Paragraph("<b>Role</b>", body_bold),
            Paragraph("<b>Username</b>", body_bold),
            Paragraph("<b>Password</b>", body_bold),
            Paragraph("<b>Key Demo Journey To Present</b>", body_bold)
        ],
        [
            Paragraph("Traditional Artist", body_style),
            Paragraph("<code>maya_warli</code>", body_style),
            Paragraph("<code>ArtistPass2026!</code>", body_style),
            Paragraph("Register cultural artwork, mint SHA-256 provenance & download Identity Card PNG", body_style)
        ],
        [
            Paragraph("Cultural Patron", body_style),
            Paragraph("<code>catherine_curator</code>", body_style),
            Paragraph("<code>UserPass2026!</code>", body_style),
            Paragraph("Like & comment on feed, bookmark to vault, request educational reuse license", body_style)
        ],
        [
            Paragraph("Administrator", body_style),
            Paragraph("<code>artogram_admin</code>", body_style),
            Paragraph("<code>AdminArtogram2026!</code>", body_style),
            Paragraph("Open <code>/admin/dashboard</code>, review misuse reports, approve verifications & inspect audit trail", body_style)
        ]
    ]

    demo_table = Table(demo_accounts, colWidths=[120, 140, 140, 352])
    demo_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SAND),
        ('BACKGROUND', (0,1), (-1,-1), SAND_LIGHT),
        ('BOX', (0,0), (-1,-1), 1.5, BROWN),
        ('INNERGRID', (0,0), (-1,-1), 0.5, SAND),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(demo_table)

    story.append(Spacer(1, 14))

    recap_box = Table(
        [[Paragraph(
            "<b>FINAL TAKEAWAY:</b><br/>"
            "ARTOGRAM proves that the modern, engaging visual social media model (Instagram) can be repurposed to "
            "protect creators instead of exploiting them. By giving every creative piece an immutable digital identity, "
            "verifiable QR code, and exportable card, Artogram delivers where art truly meets identity.",
            callout_text
        )]],
        colWidths=[762]
    )
    recap_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), OLIVE_LIGHT),
        ('BOX', (0,0), (-1,-1), 2, OLIVE),
        ('PADDING', (0,0), (-1,-1), 12),
        ('ROUNDEDCORNERS', [8,8,8,8]),
    ]))
    story.append(recap_box)

    # Build the document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Presentation deck successfully built: {filename}")

if __name__ == '__main__':
    build_deck()
