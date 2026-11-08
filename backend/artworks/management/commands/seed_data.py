import os
import shutil
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from profiles.models import UserProfile, Follow
from artworks.models import Artwork, ArtworkContributor
from provenance.models import ArtworkProvenance
from provenance.services import register_artwork_provenance
from permissions.models import ArtworkPermission, PermissionRequest
from social.models import SocialPost, Like, Comment, Bookmark, InternalShare
from reports.models import MisuseReport, ReportEvidence
from communities.models import Community, CommunityReviewer, CommunityVerification
from notifications.models import notify_user
from audit.services import record_audit_event


class Command(BaseCommand):
    help = "Seed realistic demonstration data for Artogram"

    def handle(self, *args, **options):
        self.stdout.write("Starting Artogram database seeding...")

        # 1. Admin User
        admin_user, created = User.objects.get_or_create(
            username='artogram_admin',
            defaults={
                'email': 'admin@artogram.cultural',
                'first_name': 'Artogram',
                'last_name': 'Moderator',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('AdminArtogram2026!')
        admin_user.save()
        admin_profile = admin_user.profile
        admin_profile.display_name = "Artogram Cultural Trust"
        admin_profile.role = "admin"
        admin_profile.bio = "Official platform curator and community governance administrator for Artogram."
        admin_profile.location = "Geneva / Global"
        admin_profile.primary_art_form = "Cultural Heritage Preservation"
        admin_profile.save()

        # 2. Artist Accounts
        artists_data = [
            {
                'username': 'maya_warli',
                'name': 'Maya Dhas',
                'email': 'maya@warliart.org',
                'bio': 'Third-generation Warli tribal artist preserving rice-paste geometric storytelling on earthen ochre canvases.',
                'location': 'Dahanu, Maharashtra, India',
                'art_form': 'Tribal & Ritual Painting',
                'avatar_url': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
            },
            {
                'username': 'kwame_adire',
                'name': 'Kwame Adeleke',
                'email': 'kwame@adirefabrics.ng',
                'bio': 'Yoruba indigo textile craftsman using cassava resist starch (Adire Eleko) techniques handed down from Osun state elders.',
                'location': 'Abeokuta, Ogun State, Nigeria',
                'art_form': 'Textile & Weaving',
                'avatar_url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
            },
            {
                'username': 'elena_celtic',
                'name': 'Elena MacLeod',
                'email': 'elena@hebridesceltic.scot',
                'bio': 'Scottish stone and bog-oak carver specializing in insular Celtic interlacing and spiral stone glyphs.',
                'location': 'Isle of Lewis, Outer Hebrides, Scotland',
                'art_form': 'Sculpture & Woodcarving',
                'avatar_url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            },
            {
                'username': 'mateo_talavera',
                'name': 'Mateo Morales',
                'email': 'mateo@pueblatalavera.mx',
                'bio': 'Master ceramic artisan at Taller San Francisco in Puebla, working with mineral glazes and tin-glazed majolica traditions.',
                'location': 'Puebla, Mexico',
                'art_form': 'Traditional Pottery & Ceramics',
                'avatar_url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
            },
            {
                'username': 'soraya_calligraphy',
                'name': 'Soraya Farhadi',
                'email': 'soraya@shikasteh.ir',
                'bio': 'Practitioner of classical Shikasteh Nasta\'liq script, illuminating historical Persian poetry with natural lapis lazuli pigments.',
                'location': 'Isfahan, Iran',
                'art_form': 'Calligraphy & Manuscript Art',
                'avatar_url': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
            }
        ]

        artist_users = []
        for ad in artists_data:
            u, _ = User.objects.get_or_create(
                username=ad['username'],
                defaults={'email': ad['email'], 'first_name': ad['name'].split()[0], 'last_name': ad['name'].split()[-1]}
            )
            u.set_password('ArtistPass2026!')
            u.save()
            p = u.profile
            p.display_name = ad['name']
            p.role = 'artist'
            p.bio = ad['bio']
            p.location = ad['location']
            p.primary_art_form = ad['art_form']
            p.avatar_url = ad['avatar_url']
            p.is_verified_artist = True
            p.save()
            artist_users.append(u)

        # 3. Community Users / Regular Visitors
        user_catherine, _ = User.objects.get_or_create(
            username='catherine_curator',
            defaults={'email': 'catherine@metcultural.org', 'first_name': 'Catherine', 'last_name': 'Vance'}
        )
        user_catherine.set_password('UserPass2026!')
        user_catherine.save()
        user_catherine.profile.display_name = "Catherine Vance"
        user_catherine.profile.bio = "Curatorial research associate focusing on intangible global artistic traditions."
        user_catherine.profile.location = "London, UK"
        user_catherine.profile.avatar_url = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80"
        user_catherine.profile.save()

        user_kenji, _ = User.objects.get_or_create(
            username='kenji_student',
            defaults={'email': 'kenji@designheritage.jp', 'first_name': 'Kenji', 'last_name': 'Sato'}
        )
        user_kenji.set_password('UserPass2026!')
        user_kenji.save()
        user_kenji.profile.display_name = "Kenji Sato"
        user_kenji.profile.bio = "Architecture and material culture student documenting global indigenous motifs."
        user_kenji.profile.location = "Kyoto, Japan"
        user_kenji.profile.avatar_url = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80"
        user_kenji.profile.save()

        # 4. Communities
        comm_warli, _ = Community.objects.get_or_create(
            slug='sahaydri-warli-guild',
            defaults={
                'name': 'Sahyadri Warli Artisan Council',
                'description': 'Indigenous representative council supporting traditional Warli painters and safeguarding communal motif integrity.',
                'geographic_region': 'North Sahyadri Range, Maharashtra',
                'cultural_tradition': 'Warli Tribal Heritage'
            }
        )

        comm_yoruba, _ = Community.objects.get_or_create(
            slug='egba-adire-collective',
            defaults={
                'name': 'Egba Adire Heritage Trust',
                'description': 'Dye guild safeguarding traditional indigo-dyeing and stenciled resist techniques in Abeokuta.',
                'geographic_region': 'Southwestern Nigeria',
                'cultural_tradition': 'Yoruba Textile Traditions'
            }
        )

        CommunityReviewer.objects.get_or_create(
            community=comm_warli,
            user=artist_users[0], # Maya
            defaults={'title_or_role': 'Master Painter & Lineage Trustee'}
        )

        # 5. Artworks & Provenance
        sample_artworks = [
            {
                'title': 'The Tarpa Dance of the Harvest Moon',
                'author': artist_users[0],
                'category': 'Tribal & Ritual Painting',
                'origin': 'Warli Tribe, Western Ghats, India',
                'region': 'Thane and Palghar Districts, Maharashtra',
                'language': 'Warli / Marathi dialect',
                'classification': 'traditional',
                'period': 'Harvest Season Cycle (Annual ritual)',
                'image_url': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=900&auto=format&fit=crop&q=80',
                'desc': 'A depiction of the spiral Tarpa dance where village participants intertwine without breaking the sacred concentric circle, honoring Mother Earth (Palghat) and the rice bounty.',
                'cultural_bg': 'Warli paintings traditionally adorn the mud walls (Khati) of tribal dwellings during weddings and harvest cycles. White pigment is made from rice paste and water with gum binding.',
                'historical_context': 'Recognized as one of the oldest continuing artistic traditions in the subcontinent, tracing structural roots to Neolithic rock shelters.',
                'tags': 'warli, tribal, harvest, spiral, indigenous, india',
                'required_credit': 'Artwork: The Tarpa Dance by Maya Dhas. Cultural lineage: Sahyadri Warli Tribal Heritage.',
                'preferred_attribution': 'Maya Dhas (Warli Lineage, India) / Artogram Provenance Registry',
                'declaration': 'created_by_me',
                'status': 'community_reviewed',
                'badge': 'Verified by Sahyadri Warli Artisan Council',
            },
            {
                'title': 'Adire Eleko: Sacred River Goddess Lattice',
                'author': artist_users[1],
                'category': 'Textile & Weaving',
                'origin': 'Yoruba Culture, Abeokuta, Nigeria',
                'region': 'Ogun State & Yorubaland',
                'language': 'Yoruba',
                'classification': 'traditional',
                'period': 'Mid 20th Century Revival Style',
                'image_url': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=900&auto=format&fit=crop&q=80',
                'desc': 'Hand-painted cassava starch resist cloth dipped in fermented organic indigo vats sixteen times, featuring the Ibadandun and water ripple glyphs.',
                'cultural_bg': 'Adire patterns encode proverbs, clan allegiances, and spiritual blessings. Cassava root starch is applied with chicken feathers and palm frond combs before cold-vat indigo immersion.',
                'historical_context': 'Centuries-old Yoruba dyeing tradition centered around natural Elu leaf indigo fermentation.',
                'tags': 'adire, yoruba, indigo, textile, nigeria, resist-dye',
                'required_credit': 'Adire Eleko by Kwame Adeleke. Yoruba Textile Heritage / Egba Guild.',
                'preferred_attribution': 'Kwame Adeleke (Yoruba Adire Master) via Artogram',
                'declaration': 'created_by_me',
                'status': 'registered',
                'badge': 'Self-Registered Cultural Work',
            },
            {
                'title': 'Isle of Lewis Interlaced St. Columba Knot',
                'author': artist_users[2],
                'category': 'Sculpture & Woodcarving',
                'origin': 'Celtic Insular Art, Hebrides, Scotland',
                'region': 'Outer Hebrides & Western Isles',
                'language': 'Scottish Gaelic / Insular Latin',
                'classification': 'traditional',
                'period': 'Insular High Medieval style reconstruction',
                'image_url': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=900&auto=format&fit=crop&q=80',
                'desc': 'High-relief relief panel hand-carved from reclaimed 4,000-year-old peat bog oak, featuring unending zoomorphic serpent knots and triquetra terminals.',
                'cultural_bg': 'Celtic knots represent the continuity of existence and divine eternity. Insular knotwork flourished in monastic scriptoria and high cross stone monuments across northern Britain and Ireland.',
                'historical_context': 'Evolving between the 6th and 10th centuries CE as an amalgamation of Pictish symbols, Irish Christian monasticism, and Anglo-Saxon metalcraft.',
                'tags': 'celtic, bog-oak, knotwork, scotland, carving, hebrides',
                'required_credit': 'Isle of Lewis Knot by Elena MacLeod. Hebridean Celtic Cultural Tradition.',
                'preferred_attribution': 'Elena MacLeod (Hebrides, Scotland) on Artogram',
                'declaration': 'created_by_me',
                'status': 'registered',
                'badge': 'Self-Registered Cultural Work',
            },
            {
                'title': 'Plato de Mayólica Azul: Talavera Imperial Peacock',
                'author': artist_users[3],
                'category': 'Traditional Pottery & Ceramics',
                'origin': 'Talavera Poblana, Puebla, Mexico',
                'region': 'Puebla de los Ángeles',
                'language': 'Spanish / Nahuatl cultural influences',
                'classification': 'traditional',
                'period': 'Contemporary continuation of 16th c. DO tradition',
                'image_url': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=900&auto=format&fit=crop&q=80',
                'desc': 'Tin-glazed earthenware plate painted entirely by hand with cobalt oxide, featuring the plumaged peacock motif and baroque raised stippling (almohadillado).',
                'cultural_bg': 'Certified under Mexico\'s Denominación de Origen and inscribed on UNESCO\'s Intangible Cultural Heritage list, blending Spanish Talavera de la Reina, indigenous earthenware clay, and Asian porcelain influences.',
                'historical_context': 'Established in Puebla around 1550 CE following the arrival of Andalusian potters who combined techniques with local red and black volcanic clays.',
                'tags': 'talavera, puebla, ceramic, mexico, cobalt, majolica',
                'required_credit': 'Talavera Imperial Peacock by Mateo Morales. Taller San Francisco, Puebla.',
                'preferred_attribution': 'Mateo Morales / Puebla Talavera Heritage / Artogram',
                'declaration': 'created_by_me',
                'status': 'registered',
                'badge': 'Self-Registered Cultural Work',
            },
            {
                'title': 'Rumi Verses in Shikasteh Nasta\'liq Script',
                'author': artist_users[4],
                'category': 'Calligraphy & Manuscript Art',
                'origin': 'Persian Calligraphic Tradition, Isfahan, Iran',
                'region': 'Central Iranian Plateau',
                'language': 'Classical Persian',
                'classification': 'traditional',
                'period': 'Classical Safavid style revival',
                'image_url': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=900&auto=format&fit=crop&q=80',
                'desc': 'Illuminated quatrain from Jalal al-Din Rumi written with dried reed qalam on hand-burnished tea-stained rag paper, framed in gold leaf and crushed lapis illumination.',
                'cultural_bg': 'Shikasteh (broken style) is celebrated for its fluid, musical rhythm and interconnected ligatures that evoke mystical transcendence and natural grace.',
                'historical_context': 'Developed during the 17th century CE in Herat and Isfahan to facilitate both administrative elegance and sufi lyrical expression.',
                'tags': 'calligraphy, shikasteh, rumi, persian, manuscript, isfahan',
                'required_credit': 'Shikasteh Rumi Calligraphy by Soraya Farhadi. Classical Persian Calligraphic Lineage.',
                'preferred_attribution': 'Soraya Farhadi (Isfahan) via Artogram Provenance Registry',
                'declaration': 'created_by_me',
                'status': 'registered',
                'badge': 'Self-Registered Cultural Work',
            }
        ]

        created_artworks = []
        for ad in sample_artworks:
            art, _ = Artwork.objects.get_or_create(
                title=ad['title'],
                defaults={
                    'submitted_by': ad['author'],
                    'creator_user': ad['author'],
                    'original_creator_name': ad['author'].profile.display_name,
                    'art_category': ad['category'],
                    'cultural_origin': ad['origin'],
                    'geographic_region': ad['region'],
                    'language': ad['language'],
                    'classification': ad['classification'],
                    'creation_period': ad['period'],
                    'description': ad['desc'],
                    'cultural_background': ad['cultural_bg'],
                    'historical_context': ad['historical_context'],
                    'tags': ad['tags'],
                    'required_credit': ad['required_credit'],
                    'preferred_attribution_format': ad['preferred_attribution'],
                    'declaration_type': ad['declaration'],
                    'image_url': ad['image_url'],
                    'visibility': 'public',
                    'status': ad['status']
                }
            )

            # Contributor
            ArtworkContributor.objects.get_or_create(
                artwork=art,
                name=f"{ad['author'].first_name} Studio Apprentices",
                defaults={'role': 'Natural Dye & Material Preparation'}
            )

            # Digital Provenance
            if not hasattr(art, 'provenance'):
                prov = register_artwork_provenance(
                    artwork=art,
                    user=ad['author'],
                    client_host="http://localhost:5173"
                )
                if ad.get('badge'):
                    prov.verification_status = ad['status']
                    prov.verification_badge_label = ad['badge']
                    prov.save()

            # Permissions
            ArtworkPermission.objects.get_or_create(
                artwork=art,
                defaults={
                    'viewing_allowed': True,
                    'downloading_allowed': False,
                    'educational_use_allowed': True,
                    'commercial_use_allowed': False,
                    'modification_allowed': False,
                    'redistribution_allowed': False,
                    'attribution_required': True,
                    'additional_conditions': 'Requires prior consultation for museum exhibition or academic publication. Commercial reproduction strictly prohibited.'
                }
            )

            # Social Post
            post, _ = SocialPost.objects.get_or_create(
                artwork=art,
                defaults={
                    'author': ad['author'],
                    'caption': f"Honored to register '{art.title}' on Artogram. Rooted in {art.cultural_origin}.",
                    'visibility': 'public'
                }
            )

            created_artworks.append(art)

        # 6. Social Engagements: Follows, Likes, Comments, Bookmarks
        # Catherine follows Maya, Kwame, and Elena
        Follow.objects.get_or_create(follower=user_catherine, following=artist_users[0])
        Follow.objects.get_or_create(follower=user_catherine, following=artist_users[1])
        Follow.objects.get_or_create(follower=user_catherine, following=artist_users[2])
        # Kenji follows Maya and Mateo
        Follow.objects.get_or_create(follower=user_kenji, following=artist_users[0])
        Follow.objects.get_or_create(follower=user_kenji, following=artist_users[3])

        # Likes & Comments on Post 1 (Warli)
        first_post = SocialPost.objects.filter(artwork=created_artworks[0]).first()
        if first_post:
            Like.objects.get_or_create(post=first_post, user=user_catherine)
            Like.objects.get_or_create(post=first_post, user=user_kenji)
            Like.objects.get_or_create(post=first_post, user=artist_users[1])

            Comment.objects.get_or_create(
                post=first_post,
                user=user_catherine,
                defaults={'text': 'The balance of the central Tarpa spiral captures motion so vibrantly. An incredible cultural artifact.'}
            )
            Comment.objects.get_or_create(
                post=first_post,
                user=user_kenji,
                defaults={'text': 'Studying the sacred geometry here for our traditional architecture seminar. Thank you for registering this provenance!'}
            )

        # Likes on Post 2 (Adire)
        second_post = SocialPost.objects.filter(artwork=created_artworks[1]).first()
        if second_post:
            Like.objects.get_or_create(post=second_post, user=user_catherine)
            Like.objects.get_or_create(post=second_post, user=artist_users[0])
            Comment.objects.get_or_create(
                post=second_post,
                user=user_catherine,
                defaults={'text': 'The indigo depth and cassava stencil clarity are breathtaking. Essential Yoruba heritage.'}
            )

        # Bookmarks
        Bookmark.objects.get_or_create(user=user_catherine, artwork=created_artworks[0])
        Bookmark.objects.get_or_create(user=user_catherine, artwork=created_artworks[1])
        Bookmark.objects.get_or_create(user=user_kenji, artwork=created_artworks[3])

        # Internal Share
        InternalShare.objects.get_or_create(
            sender=user_catherine,
            recipient=user_kenji,
            artwork=created_artworks[0],
            defaults={'note': 'Kenji, take a look at the provenance card for this Warli artwork — exactly what we discussed.'}
        )

        # 7. Permission Requests
        # Catherine requests permission to feature Warli artwork in educational monograph
        PermissionRequest.objects.get_or_create(
            artwork=created_artworks[0],
            requester=user_catherine,
            defaults={
                'intended_usage': 'Educational Exhibition',
                'is_commercial': False,
                'description': 'We would like to display high-resolution imagery and the Artogram Identity Card in the University Intangible Heritage symposium catalogue.',
                'expected_platform': 'Academic Print & University Open-Access Repository',
                'status': 'approved',
                'artist_response_note': 'Approved with pleasure. Please include the complete provenance credit line and QR code in the catalogue appendix.'
            }
        )

        # Kenji requests commercial licensing for textile merchandise (pending/rejected scenario)
        PermissionRequest.objects.get_or_create(
            artwork=created_artworks[1],
            requester=user_kenji,
            defaults={
                'intended_usage': 'Commercial Publication',
                'is_commercial': True,
                'description': 'Proposal to print pattern motifs onto modern streetwear apparel capsule collection.',
                'expected_platform': 'Online Retail & Boutique store',
                'status': 'rejected',
                'artist_response_note': 'Adire sacred motifs carry ritual spiritual meanings and cannot be licensed for commercial mass-market fashion without community elder council approval.'
            }
        )

        # 8. Misuse Report
        # Catherine reports an external drop-shipping website copying the Celtic carving
        report, _ = MisuseReport.objects.get_or_create(
            artwork=created_artworks[2],
            reporter=user_catherine,
            defaults={
                'report_type': 'unauthorised_commercial_use',
                'suspected_external_url': 'https://example-unauthorized-replicas.com/products/celtic-oak-board',
                'description': 'An overseas e-commerce vendor has ripped the high-res photo from Artogram and is selling plastic molded replicas claiming original copyright.',
                'status': 'under_review',
                'admin_notes': 'Verified seller URL. IP takedown notice drafted citing original provenance registration ART-2026-000003.'
            }
        )
        ReportEvidence.objects.get_or_create(
            report=report,
            defaults={
                'file_url': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
                'description': 'Screenshot of third-party shop listing with stolen artwork photography'
            }
        )

        # 9. Community Verification Request
        CommunityVerification.objects.get_or_create(
            artwork=created_artworks[0],
            community=comm_warli,
            defaults={
                'reviewer': artist_users[0],
                'status': 'approved',
                'comments': 'Authentic traditional rice-paste formulation on mud canvas verified by village artisan elders.',
                'evidence_reference': 'Council Field Registry #WAR-2026-08'
            }
        )

        # 10. Sample Notifications
        notify_user(
            recipient=artist_users[0],
            sender=user_catherine,
            notification_type='like',
            title='Artwork Liked',
            message="@catherine_curator liked your post on 'The Tarpa Dance of the Harvest Moon'.",
            target_url=f"/post/{first_post.id}"
        )
        notify_user(
            recipient=artist_users[0],
            sender=user_catherine,
            notification_type='comment',
            title='New Comment',
            message="@catherine_curator commented on your artwork.",
            target_url=f"/post/{first_post.id}"
        )
        notify_user(
            recipient=user_catherine,
            sender=artist_users[0],
            notification_type='permission_decision',
            title='Permission Request Approved',
            message="Your permission request for 'The Tarpa Dance of the Harvest Moon' was approved.",
            target_url="/permission-requests"
        )

        self.stdout.write(self.style.SUCCESS("Artogram sample data seeded successfully!"))
        self.stdout.write(self.style.SUCCESS("Admin Account: username='artogram_admin' / password='AdminArtogram2026!'"))
        self.stdout.write(self.style.SUCCESS("Artist Account: username='maya_warli' / password='ArtistPass2026!'"))
        self.stdout.write(self.style.SUCCESS("User Account: username='catherine_curator' / password='UserPass2026!'"))
