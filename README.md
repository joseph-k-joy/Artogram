# ARTOGRAM
### *Where Art Meets Identity*

[![PWA Ready](https://img.shields.io/badge/PWA-Installable-C85A32.svg)](#progressive-web-application)
[![Backend](https://img.shields.io/badge/Backend-Django%20REST%20Framework-5C6B47.svg)](#backend)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-3D271D.svg)](#frontend)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite%20Fallback-211C19.svg)](#database-architecture)
[![Digital Provenance](https://img.shields.io/badge/Provenance-SHA--256%20%26%20QR%20Certs-C85A32.svg)](#artwork-registration-and-digital-provenance)

---

## 1. PROJECT OVERVIEW

**ARTOGRAM** is a full-stack, hackathon-ready Progressive Web Application (PWA) engineered to merge contemporary social networking with traditional cultural art preservation and digital provenance.

Unlike conventional photo-sharing applications that strip attribution or treat artworks as ephemeral content, Artogram binds every registered artwork to a persistent, cryptographically fingerprinted provenance record (`ART-YYYY-XXXXXX`), a verifiable QR code certificate, and an exportable **Artogram Identity Card**.

### Central Innovation: The Artogram Identity Card
Every registered artwork possesses a digital identity connecting:
1. High-resolution visual representation.
2. Original creator and lineage attribution.
3. Unique sequential Provenance ID (`ART-2026-000001`).
4. Byte-level cryptographic SHA-256 fingerprint.
5. Scannable QR code resolving to public verification routes.
6. Cultural background, geographic origin, and dialect classification.
7. Explicit reuse covenants (educational, commercial, derivative).
8. Verification badges (Self-Registered or Community Guild Verified).
9. Full audit history.

---

## 2. TECHNOLOGY STACK

### Frontend
- **React.js 19** & **Vite 8**
- **Tailwind CSS v4** (`@tailwindcss/vite`) with custom cultural earthy palette
- **React Router v7** for declarative client-side routing
- **Axios** with automatic JWT interceptors and silent token refresh
- **Lucide React** icons
- **html2canvas** for client-side Identity Card PNG export
- **vite-plugin-pwa** for service worker caching, web app manifest, and offline fallback

### Backend
- **Python 3.14**
- **Django 6.0** & **Django REST Framework 3.18**
- **Simple JWT** authentication (Access & Refresh tokens)
- **django-cors-headers**
- **Pillow** for image processing
- **qrcode** (Python) for automated physical/digital QR generation
- **hashlib** for SHA-256 cryptographic file hashing

### Database
- **PostgreSQL 16** via Docker Compose.
- **SQLite 3** seamless zero-config fallback for local development.

---

## 3. DATABASE ARCHITECTURE & MERMAID ER DIAGRAM

```mermaid
erDiagram
    User ||--o{ UserProfile : "has"
    User ||--o{ Artwork : "submits"
    User ||--o{ Follow : "follower/following"
    User ||--o{ SocialPost : "authors"
    User ||--o{ Like : "gives"
    User ||--o{ Comment : "writes"
    User ||--o{ Bookmark : "saves"
    User ||--o{ InternalShare : "sends/receives"
    User ||--o{ Notification : "receives"
    User ||--o{ PermissionRequest : "requests"
    User ||--o{ MisuseReport : "files"
    User ||--o{ AuditEvent : "performs"

    Artwork ||--|| ArtworkProvenance : "has unique"
    Artwork ||--|| ArtworkPermission : "has"
    Artwork ||--o{ ArtworkContributor : "credits"
    Artwork ||--o{ SocialPost : "featured in"
    Artwork ||--o{ Bookmark : "bookmarked by"
    Artwork ||--o{ PermissionRequest : "subject of"
    Artwork ||--o{ MisuseReport : "reported in"
    Artwork ||--o{ CommunityVerification : "reviewed in"

    Community ||--o{ CommunityReviewer : "designates"
    Community ||--o{ CommunityVerification : "conducts"
    MisuseReport ||--o{ ReportEvidence : "contains"
```

---

## 4. VISUAL IDENTITY & BRANDING

Artogram embodies an artistic cultural interface:
- **Terracotta** (`#C85A32` / `#A9431E`): Primary emblem, primary actions, and accent identity.
- **Sand Beige & Warm Cream** (`#FAF7F2` / `#E8DEC8` / `#F4EFE6`): Background warmth and card substrates.
- **Muted Olive Green** (`#5C6B47`): Verification stamps, botanical pigments, and positive covenants.
- **Deep Brown & Charcoal** (`#3D271D` / `#211C19`): Contrast typography and borders.

---

## 5. LOCAL DEVELOPMENT SETUP

The application is configured to run smoothly on `localhost`.

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node v26)
- Optional: Docker (for PostgreSQL container)

### Step 1: Clone Repository
```bash
git clone https://github.com/joseph-k-joy/Artogram.git
cd Artogram
```

### Step 2: Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
python -m pip install -r requirements.txt
# (or python -m pip install djangorestframework djangorestframework-simplejwt django-cors-headers qrcode pillow)

# Apply database migrations
python manage.py migrate

# Seed demonstration data (sample artists, artworks, provenance, posts, and reports)
python manage.py seed_data

# Start backend server
python manage.py runserver 127.0.0.1:8000
```
Backend runs at `http://127.0.0.1:8000`.

### Step 3: Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install node packages
npm install

# Start Vite dev server with proxy
npm run dev
```
Frontend runs at `http://localhost:5173`.

### Optional: PostgreSQL via Docker Compose
To run PostgreSQL locally instead of SQLite:
```bash
docker compose up -d
# Set DATABASE_URL in your .env or environment:
# DATABASE_URL=postgres://artogram_user:artogram_pass@localhost:5432/artogram_db
```

---

## 6. PRE-SEEDED DEMONSTRATION ACCOUNTS

Artogram includes realistic sample accounts ready for instant testing:

| Role | Username | Password | Notes |
|---|---|---|---|
| **Administrator / Curator** | `artogram_admin` | `AdminArtogram2026!` | Access to Governance Console, audit history, user management, and moderation |
| **Traditional Artist** | `maya_warli` | `ArtistPass2026!` | Warli tribal artist with registered artworks, incoming permission requests |
| **Cultural Artisan** | `kwame_adire` | `ArtistPass2026!` | Yoruba indigo textile master with registered provenance and social posts |
| **Registered User / Patron** | `catherine_curator` | `UserPass2026!` | University researcher who likes, comments, bookmarks, and requests permissions |

*Tip: The Sign In page features **1-Click Demo Login** buttons for instant testing.*

---

## 7. COMPLETE 22-STEP LOCAL DEMONSTRATION WALKTHROUGH

Execute this workflow locally to verify all functionality:

1. **Open Artogram**: Visit `http://localhost:5173`.
2. **Review Landing Page**: Observe the cultural hero, live Identity Card preview, and core pillars.
3. **Register New Artist**: Click "Join Artogram", select "Artist / Artisan", and create an account.
4. **Complete Artist Profile**: Fill in display name, cultural region, and primary art form.
5. **Upload Cultural Artwork**: Click "+ Register Art" in navigation.
6. **Enter Provenance Metadata**: Fill title, select art category, cultural origin, and lineage history.
7. **Generate SHA-256 Fingerprint**: Upload an artwork file. The byte-level SHA-256 checksum is calculated automatically.
8. **Generate QR Code**: System automatically calls Python `qrcode` to generate a verifiable PNG badge.
9. **Display Artogram Identity Card**: Review the generated Identity Card component showing title, creator, ID, QR, and covenants.
10. **Export Identity Card**: Click "Download Identity Card (PNG)" to verify the high-resolution client-side export.
11. **Verify Home Feed**: Navigate to `/feed`. The newly published artwork post appears with like/comment buttons.
12. **Switch User**: Sign out and log in as `catherine_curator` (or use the 1-Click login).
13. **Like & Comment**: Like the post and submit a respectful comment in the expanded drawer.
14. **Follow Artist**: Navigate to the artist's profile (`/profile/maya_warli`) and click "Follow Artist".
15. **Bookmark Artwork**: Click the Bookmark button to save the artwork to `/saved`.
16. **Internal Sharing**: Click the Share button, enter a username, add a note, and transmit.
17. **Inspect Public Provenance Page**: Open `/artworks/ART-2026-000001/provenance/` without being logged in.
18. **Scan / Inspect QR Code**: Observe that the QR code points to the persistent public route.
19. **Submit Permission Request**: Click "Request Permission", choose "Educational Exhibition", and submit.
20. **File Misuse Report**: Click "Report", select "Missing Attribution", enter a suspect URL, and file.
21. **Log in as Administrator**: Log in as `artogram_admin`. Open `/admin/dashboard`.
22. **Perform Governance**:
    - Review the live 8-metric overview.
    - Review the submitted misuse report and update status to "UNDER REVIEW".
    - Change artwork verification status to "Community Verified & Approved".
    - Inspect the append-only Audit Trail log.

---

## 8. PROGRESSIVE WEB APPLICATION (PWA)

Artogram is configured as an installable PWA via `vite-plugin-pwa`:
- **Web App Manifest**: Standalone display mode, terracotta `#C85A32` theme color, warm cream `#FAF7F2` background, responsive maskable icons.
- **Service Worker**: Precaching of HTML, JS, CSS, and SVG assets.
- **Install Prompt**: Automatic detection of `beforeinstallprompt` with an "Install" pill in the navigation bar.
- **Offline Fallback**: Dedicated offline page (`/offline.html`) when network connectivity is disrupted.

---

## 9. ETHICAL & REGULATORY DISCLOSURES

In accordance with cultural heritage ethics and legal standards:
1. **Cryptographic SHA-256 Hashing**: Certifies byte-level file integrity. It cannot prove legal copyright ownership, authorship, or visual similarity of cropped/modified replicas.
2. **QR Code Routing**: Connects physical exhibits and digital assets to public attribution claims.
3. **Community Reviewers**: Cultural verification is conducted by designated guild elders/trustees, clearly distinguished from self-registered records.
4. **Misuse Reporting**: Reports are treated as allegations subject to evidence inspection without prejudging guilt.

---

## 10. BACKEND TEST SUITE

The backend includes a comprehensive test suite across accounts, artworks, provenance, social interactions, and governance.

To execute tests:
```bash
cd backend
python manage.py test
```
All 17 tests run and pass cleanly:
```text
Ran 17 tests in 24.190s
OK
```

---

## 11. LICENSE

Developed for cultural creators, indigenous artisans, and global heritage preservation.
Released under the MIT License.
