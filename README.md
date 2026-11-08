# ARTOGRAM: Where Art Meets Identity

[![PWA Ready](https://img.shields.io/badge/PWA-Installable-C85A32.svg)](#6-installation--setup-instructions)
[![Backend](https://img.shields.io/badge/Backend-Django%20REST%20Framework-5C6B47.svg)](#4-technology-stack)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%208%20%7C%20Tailwind%204-3D271D.svg)](#4-technology-stack)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite%20Fallback-211C19.svg)](#5-system-architecture)
[![Digital Provenance](https://img.shields.io/badge/Provenance-SHA--256%20%26%20QR%20Certs-C85A32.svg)](#3-key-features)
[![Build Status](https://img.shields.io/badge/Tests-17%2F17%20Passing-success.svg)](#6-installation--setup-instructions)

---

## 1. Project Overview

**ARTOGRAM** is a specialized **Instagram-model cultural social networking platform and Progressive Web Application (PWA)** built specifically for artists, traditional artisans, cultural custodians, and creative practitioners.

Rather than being a generic website, static landing page, or corporate dashboard, Artogram delivers a complete, dynamic social media experience styled in the visual and social paradigm of modern creator platforms (infinite photo feed, artist profiles, post engagements, comments, bookmarks, follower graphs, and internal direct sharing). 

Crucially, Artogram pairs this familiar **Instagram-style creator showcase** with an innovative digital provenance backbone: every piece of art published on the platform is cryptographically fingerprinted using **SHA-256 byte hashing**, assigned an immutable sequential Provenance ID (`ART-YYYY-XXXXXX`), verified with real-time **QR codes**, and packaged into a shareable, downloadable **Artogram Identity Card**.

---

## 2. Problem Statement

Modern social platforms (such as standard Instagram, Pinterest, and X/Twitter) are built for mass virality and algorithmic consumption, leading to severe issues for visual artists and cultural creators:
1. **Attribution Stripping & Cultural Erasure**: Traditional motifs, indigenous patterns, and independent artist uploads are frequently ripped, screenshotted, and re-uploaded without credit to the original creator or lineage.
2. **Unauthorised Commercial Exploitation**: Scraping bots and opportunistic drop-shipping storefronts steal high-resolution art from social media to sell on merchandise without consent or licensing.
3. **No Digital-Physical Bridge**: Physical artworks exhibited in galleries, craft fairs, or museum exhibits have no seamless connection to the artist's digital profile or authentic attribution claims.
4. **Lack of Legal & Covenant Clarity**: Existing platforms lack standardized mechanisms for creators to specify how their work can be reused (educational, academic, commercial, remixing) or for cultural communities to safeguard communal heritage.

**Artogram solves this** by transforming the Instagram model: artists retain full social discovery, visual engagement, and portfolio presentation, but every post is underpinned by cryptographic provenance, verifiable QR identity cards, structured permission requests, and community governance.

---

## 3. Key Features

### A. Instagram-Model Social Networking
- **Visual Home Feed (`/feed`)**: Full-screen photo feed displaying posts from followed artists and public creators, with real-time like counts, comment drawers, bookmarks, and internal sharing.
- **Creator Profiles (`/profile/:username`)**: Visual artist galleries, bio, primary art form, verified artist badge, follower/following counts, and direct profile editing.
- **Social Interaction Engine**:
  - Duplicate-safe likes and unlikes with instant counter updates.
  - Multi-tier threaded comment system with moderation.
  - Personal saved vault (`/saved`) to bookmark cultural artworks.
  - Internal direct sharing modal with personalized notes and link copying.
  - Follow / Unfollow relationships with prevention of self-following.
- **Search & Discovery (`/explore`)**: Discover artists and artworks by keywords, 11 cultural categories (Indigenous Folk Art, Textile & Weaving, Traditional Pottery, Calligraphy, etc.), and classification types (Traditional, Contemporary, Hybrid).

### B. Digital Provenance & Cryptographic Registration
- **Byte-Exact SHA-256 Fingerprinting**: When an artwork file is uploaded, the system reads its raw bytes and computes an immutable 64-character SHA-256 checksum via Python `hashlib`.
- **Sequential Provenance IDs**: Every registered artwork receives a permanent, readable identifier in the format `ART-YYYY-XXXXXX` (e.g., `ART-2026-000001`).
- **Verifiable QR Certificates**: Python `qrcode` generates a high-contrast physical/digital QR code badge resolving to the persistent public certificate URL (`/artworks/:provenanceId/provenance/`).
- **Creator Relationship Declarations**: Transparent declaration options (*I created this artwork*, *I am an authorised representative*, *I am documenting a community-held cultural work*).

### C. The Artogram Identity Card (`ArtworkIdentityCard.jsx`)
- The platform's signature visual differentiator:
  - Artwork preview with cultural badge (*Self-Registered* or *Community Guild Verified*).
  - Attributed creator, location, and cultural origin.
  - Unique Provenance ID and cryptographic SHA-256 checksum preview.
  - Live QR code matrix for scanning on mobile devices.
  - Summary matrix of reuse covenants (Educational vs. Commercial terms).
  - Mandatory credit line.
  - **1-Click High-Res PNG Download**: Exports crisp printable cards via `html2canvas` for physical gallery labels, print catalogs, or portfolio decks.

### D. Permission Management & Governance
- **Reuse Permission Hub (`/permission-requests`)**: Formal license requests for educational exhibitions, academic research, documentaries, or commercial publishing.
- **Artist Decision Console**: Artists can approve, reject, or request clarification with custom covenants, triggering automated notifications and audit events.
- **Misuse Reporting Pipeline (`/my-reports`)**: Transparent violation reporting workflow (`SUBMITTED` &rarr; `UNDER REVIEW` &rarr; `ACTION TAKEN` / `RESOLVED` / `REJECTED`) with evidence attachments and external suspect URL tracking.
- **Community Verification Guilds (`/communities`)**: Registry of cultural councils and guild trustees (e.g., *Sahyadri Warli Artisan Council*, *Egba Adire Heritage Trust*) to verify community-held heritage claims.
- **Governance Console (`/admin/dashboard`)**: 8-metric overview, user role management, artwork status review, comment moderation, and append-only audit trail.

### E. Progressive Web App (PWA)
- Fully installable on desktop and mobile devices via `vite-plugin-pwa`.
- Standalone display mode with custom terracotta `#C85A32` theme color and warm cream `#FAF7F2` background.
- Automatic browser install prompt detection with a prominent navigation install pill.
- Service worker precaching of application assets and dedicated offline fallback (`/offline.html`).

---

## 4. Technology Stack

### Frontend Architecture
| Package | Version | Purpose |
|---|---|---|
| **React** | `^19.3.1` | Declarative component UI engine |
| **Vite** | `^8.3.6` | Next-generation bundler and local development server |
| **Tailwind CSS** | `^4.3.5` | Cultural earthy styling via `@tailwindcss/vite` |
| **React Router** | `^7.18.5` | Client-side routing with protected and admin route guards |
| **Axios** | `^1.21.0` | HTTP client with automatic JWT bearer interceptor and token refresh |
| **Lucide React** | `^1.70.0` | Accessible, consistent iconography |
| **html2canvas** | `^1.4.1` | Client-side DOM canvas rendering for Identity Card PNG export |
| **vite-plugin-pwa** | `^2.0.0` | Service worker generation, caching strategies, and web app manifest |

### Backend Architecture
| Package | Version | Purpose |
|---|---|---|
| **Python** | `3.14+` | Core server language |
| **Django** | `6.0.3` | Robust web application framework and ORM |
| **Django REST Framework** | `3.18.3` | RESTful API serialization, viewsets, and permission checks |
| **Simple JWT** | `5.5.1` | Stateless JSON Web Token authentication with rotating refresh tokens |
| **django-cors-headers**| `4.9.0` | Cross-Origin Resource Sharing control |
| **Pillow** | `12.1.1` | Server-side image manipulation and metadata validation |
| **qrcode** | `8.2` | High-precision QR code generation with custom color palettes |
| **hashlib** | Built-in | SHA-256 raw byte cryptographic hashing |

### Database & Storage
- **PostgreSQL 16**: Production-grade relational database running via Docker Compose.
- **SQLite 3**: Automatic zero-config fallback database for instant local development.
- **Django Media Storage**: Local filesystem media storage with optional Cloudinary adapter.

---

## 5. System Architecture

### Architectural Pattern
Artogram adopts a decoupled **Client-Server RESTful Architecture**:
1. **Single Page Application (SPA)**: React client consuming JSON endpoints.
2. **Stateless API Gateway**: Django REST Framework authenticated via JWT bearer tokens.
3. **Service Layer**: Dedicated business logic modules for SHA-256 calculation, QR rendering, permission evaluation, and append-only audit logging.
4. **Relational Persistence**: Strict relational models maintaining integrity between users, profiles, artworks, provenance records, social interactions, and governance logs.

### Database Entity-Relationship (Mermaid Diagram)

```mermaid
erDiagram
    User ||--o{ UserProfile : "profile metadata"
    User ||--o{ Artwork : "registers/submits"
    User ||--o{ Follow : "follower / following"
    User ||--o{ SocialPost : "publishes"
    User ||--o{ Like : "likes"
    User ||--o{ Comment : "writes"
    User ||--o{ Bookmark : "bookmarks"
    User ||--o{ InternalShare : "shares with"
    User ||--o{ Notification : "receives"
    User ||--o{ PermissionRequest : "requests"
    User ||--o{ MisuseReport : "files"
    User ||--o{ AuditEvent : "performs"

    Artwork ||--|| ArtworkProvenance : "has unique"
    Artwork ||--|| ArtworkPermission : "governed by"
    Artwork ||--o{ ArtworkContributor : "credits"
    Artwork ||--o{ SocialPost : "featured in"
    Artwork ||--o{ Bookmark : "bookmarked in"
    Artwork ||--o{ PermissionRequest : "requested for"
    Artwork ||--o{ MisuseReport : "subject of"
    Artwork ||--o{ CommunityVerification : "reviewed in"

    Community ||--o{ CommunityReviewer : "designates"
    Community ||--o{ CommunityVerification : "verifies"
    MisuseReport ||--o{ ReportEvidence : "contains"
```

---

## 6. Installation & Setup Instructions

The application is fully runnable on your local development machine without requiring paid third-party subscriptions.

### Prerequisites
- **Python**: Version 3.10 or newer (tested on Python 3.14)
- **Node.js**: Version 18 or newer (tested on Node v26)
- **Git**: Installed and configured

### Step 1: Clone the Repository
```bash
git clone https://github.com/joseph-k-joy/Artogram.git
cd Artogram
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
python -m pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Seed sample demonstration data (realistic artists, artworks, provenance, posts, and reports)
python manage.py seed_data

# Start the Django development server
python manage.py runserver 127.0.0.1:8000
```
*The backend API will be available at `http://127.0.0.1:8000`.*

### Step 3: Frontend Setup
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install Node modules
npm install

# Start Vite development server
npm run dev
```
*The application interface will be live at `http://localhost:5173`.*

### Step 4: Running Automated Tests
To execute the complete backend automated test suite:
```bash
cd backend
python manage.py test
```
*Result: 17/17 tests passing cleanly (`OK`).*

To verify the production frontend build:
```bash
cd frontend
npm run build
```
*Result: Vite production build succeeds with PWA precache assets in under 2 seconds.*

---

## 7. Environment Variables

Artogram ships with secure local defaults and includes a `.env.example` file in the root directory:

```env
# ==========================================
# ARTOGRAM BACKEND CONFIGURATION (.env)
# ==========================================

# Django Core
DJANGO_SECRET_KEY=artogram-production-secret-cultural-heritage-key-2026-change-me
DJANGO_DEBUG=True

# Database Configuration (PostgreSQL with automatic SQLite fallback)
# Leave commented to use the built-in local SQLite development database:
# DATABASE_URL=postgres://artogram_user:artogram_pass@localhost:5432/artogram_db
# POSTGRES_DB=artogram_db
# POSTGRES_USER=artogram_user
# POSTGRES_PASSWORD=artogram_pass
# POSTGRES_HOST=localhost
# POSTGRES_PORT=5432

# Media & Storage (Optional: defaults to local media folder if unset)
USE_CLOUDINARY=False
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ==========================================
# ARTOGRAM FRONTEND CONFIGURATION (frontend/.env)
# ==========================================
VITE_API_URL=http://localhost:8000
```

---

## 8. Usage Instructions

### Pre-Seeded Demonstration Accounts
The database includes pre-configured demo users to explore all roles:

| Role | Username | Password | Purpose & Capabilities |
|---|---|---|---|
| **Administrator / Curator** | `artogram_admin` | `AdminArtogram2026!` | Access `/admin/dashboard`, review misuse reports, update verification badges, inspect audit log |
| **Traditional Master Artist** | `maya_warli` | `ArtistPass2026!` | Warli tribal artist with registered artworks, incoming permission requests |
| **Cultural Artisan** | `kwame_adire` | `ArtistPass2026!` | Yoruba indigo textile master with registered provenance and social posts |
| **Patron / Researcher** | `catherine_curator` | `UserPass2026!` | Museum researcher who likes, comments, bookmarks, and requests permissions |

*Tip: The Sign In page features **1-Click Demo Login** buttons to switch between personas instantly without typing.*

### Core User Journeys

#### 1. Showcasing Artwork as an Artist (The Instagram Model)
1. Sign in as `maya_warli`.
2. Click **"+ Register Art"** in the top navigation.
3. Fill in the title, select an art category, upload an image file, and provide cultural lineage context.
4. Select your declaration (*"I created this artwork"*), set reuse covenants, and leave *"Publish to Artogram Social Feed"* checked.
5. Click **"Register Artwork & Generate Identity Card"**.
6. The system generates your sequential Provenance ID (`ART-2026-000001`), computes the SHA-256 fingerprint, renders a QR code, and shows your **Artogram Identity Card**.
7. Click **"Download Identity Card (PNG)"** to save an exhibition-ready graphic.
8. Navigate to `/feed` to see your post appearing in the timeline.

#### 2. Engaging as a Cultural Patron
1. Sign in as `catherine_curator` (or browse as a guest).
2. Browse the **Feed** or **Explore** page (`/explore`).
3. Click the **Heart** to like a post or open the **Comment** bubble to leave feedback.
4. Click the **Bookmark** icon to store the artwork in your private saved vault (`/saved`).
5. Click **"Request Permission"** on an artwork detail page to request an educational exhibition license.
6. If an attribution omission is observed on an external website, click **"Report"** to submit evidence to the moderation council.

#### 3. Verifying Authenticity via Public QR & Hash
1. Open any public provenance certificate URL: `http://localhost:5173/artworks/ART-2026-000001/provenance/`.
2. Note that this page works completely without logging in.
3. Inspect the cryptographic SHA-256 fingerprint, registration date, and audit trail.
4. Go to **"Verify Hash"** (`/verify-hash`), drop the original image file or paste its SHA-256 hash, and click **Verify** to validate its exact byte-level authenticity.

---

## 9. Demonstration Screenshots

| Interface Screen | Description & Workflow |
|---|---|
| **1. Cultural Landing Page** | Warm earthy visual branding, featured interactive Artogram Identity Card, value proposition, and core pillars. |
| **2. Instagram-Model Social Feed (`/feed`)** | Responsive photo timeline, artist avatars, verified badges, like counters, threaded comments drawer, and share triggers. |
| **3. Artwork Registration (`/register-artwork`)** | 3-stage form with real-time file upload, byte-level SHA-256 calculation, cultural origin metadata, and reuse covenants. |
| **4. The Artogram Identity Card** | Signature digital card featuring artwork preview, creator attribution, QR code, SHA-256 hash, covenants, and 1-click PNG export. |
| **5. Public Provenance Certificate** | Persistent public verification route showing verified guild badge, file technical specs, lineage context, and append-only audit trail. |
| **6. Public Hash Verification Tool (`/verify-hash`)** | Drag-and-drop file inspection certifying byte-level matches against registered artworks in the registry. |
| **7. Artist Profile Gallery (`/profile/:username`)** | Visual portfolio showcase, bio, cultural region, primary art form, follower/following count, and registered works gallery. |
| **8. Permission Management Hub (`/permission-requests`)** | Inbound/outbound reuse license management with approve, reject, or clarification actions. |
| **9. Governance & Admin Console (`/admin/dashboard`)** | 8-metric platform dashboard, user role administration, artwork review, misuse report investigation, and audit trail. |

*(High-resolution screenshots and slide diagrams are also compiled in the companion presentation PDF `Artogram_Presentation_Deck.pdf`)*.

---

## 10. Team Members

- **Joseph K Joy** — *Lead Full-Stack Software Engineer, System Architect & UI/UX Designer*
  - GitHub: [@joseph-k-joy](https://github.com/joseph-k-joy)
  - Project Repository: [https://github.com/joseph-k-joy/Artogram](https://github.com/joseph-k-joy/Artogram)

---

## 11. Limitations & Future Scope

### Current Limitations
1. **Cryptographic Scope of SHA-256**: SHA-256 hashes certify byte-level file integrity. If an image is cropped, resized, recompressed, or watermarked, its cryptographic hash changes. It does not perform computer vision perceptual hashing.
2. **Attribution Claims vs. Legal Copyright**: Registration on Artogram documents attribution claims and lineage context; it does not automatically constitute a government copyright registration.
3. **Simulated Community Consensus**: While designated guild reviewers can approve cultural claims, a single reviewer's validation does not imply universal indigenous community consensus.
4. **Local Host Demonstration Target**: In this hackathon environment, media files are stored locally in Django media storage and served over localhost.

### Future Scope & Roadmap
1. **Perceptual Image Hashing (pHash / Neural Fingerprinting)**: Integrate dual-layer verification combining exact SHA-256 with perceptual neural embeddings to identify cropped, altered, or filter-modified art copies across external web crawlers.
2. **Automated Web Misuse Crawler**: Background scanning daemon that periodically queries public image search engines and social platforms to alert artists if their registered artwork appears online without attribution.
3. **Multi-Signature Community Governance**: Require multiple verified tribal elders or guild trustees to sign off on community-held cultural heritage registrations before granting verified badges.
4. **Decentralized Storage Bridging (IPFS / Arweave)**: Optional decentralized storage anchoring for creators who desire redundant, permanent decentralized provenance storage alongside relational databases.
5. **Direct Patron Support & Micro-Grants**: Introduce fair-trade micro-patronage and print ordering directly to accredited indigenous artisan cooperatives.

---

## 12. License & Attribution

### License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

### Cultural Heritage Attribution & Ethics
- Sample demonstration artworks and creator profiles are clearly labeled fictional representations created solely for technological demonstration purposes.
- Artogram respects the sovereignty of indigenous and traditional cultural expressions. Platform covenants are inspired by the *WIPO Intergovernmental Committee on Intellectual Property and Genetic Resources, Traditional Knowledge and Folklore (IGC)* guidelines.
