import React, { useState, useEffect } from 'react';

interface ProfessionalStitchV2Props {
    weddingData: any;
    timeline: any[];
    photos: any[];
}

const ProfessionalStitchV2: React.FC<ProfessionalStitchV2Props> = ({ weddingData, timeline, photos }) => {
    const [templateHtml, setTemplateHtml] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTemplate = async () => {
            try {
                setLoading(true);
                // Convert theme name to directory suffix: "Art Deco Glamour" -> "art_deco_glamour"
                const themeDir = weddingData.theme.toLowerCase()
                    .replace(/\(premium\)/g, '')
                    .trim()
                    .replace(/ /g, '_')
                    .replace(/&/g, 'and')
                    .replace(/\+/g, '_');

                const response = await fetch(`/stitch_weddingweb_professional_home/template__${themeDir}/code.html`);
                if (!response.ok) throw new Error(`Template not found: ${themeDir}`);

                let html = await response.text();

                // 1. Define Placeholders Mapping
                const dateObj = weddingData.weddingDate ? new Date(weddingData.weddingDate) : new Date();
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });

                const customizations = weddingData.customizations || {};

                const placeholders: Record<string, string> = {
                    '{{GroomName}}': weddingData.groomName || 'Groom',
                    '{{BrideName}}': weddingData.brideName || 'Bride',
                    '{{GroomFirst}}': (weddingData.groomName || 'Groom').split(' ')[0],
                    '{{BrideFirst}}': (weddingData.brideName || 'Bride').split(' ')[0],
                    '{{GroomInitial}}': (weddingData.groomName || 'G').charAt(0),
                    '{{BrideInitial}}': (weddingData.brideName || 'B').charAt(0),
                    '{{WeddingDate}}': formattedDate,
                    '{{Venue}}': weddingData.venue || 'TBD',
                    '{{Location}}': weddingData.venue || 'TBD',
                    '{{WeddingTime}}': weddingData.weddingTime || '10:00',
                    '{{GuestCount}}': String(weddingData.guestCount || 0),
                    '{{Slug}}': weddingData.slug || '',
                    '{{Year}}': String(dateObj.getFullYear()),
                    '{{MapLink}}': weddingData.venueMapUrl || '#',
                    '{{MapEmbedLink}}': weddingData.venueMapUrl ? weddingData.venueMapUrl.replace('maps/place/', 'maps/embed/place/').replace('maps/dir/', 'maps/embed/dir/') : '',
                    '{{CoupleLogo}}': customizations.coupleLogo || '/logo.png',
                    // Travel & Logistics Defaults
                    '{{Travel_Title}}': customizations.travelTitle || 'Travel & Transport',
                    '{{Travel_Railway}}': customizations.travelRailway || 'Nearest Railway Station: Central Station (10 mins away)',
                    '{{Travel_BusStand}}': customizations.travelBusStand || 'Nearest Bus Stand: Main Intercity Stand (15 mins away)',
                    '{{Travel_BusStop}}': customizations.travelBusStop || 'Nearest Bus Stop: Garden Gate (2 mins walk)',
                    '{{Travel_Airport}}': customizations.travelAirport || 'Nearest Airport: International Airport (45 mins drive)',
                    // Inner Content Defaults
                    '{{Story_Title}}': customizations.storyTitle || customizations.timelineTitle || 'Our Story',
                    '{{Story_Subtitle}}': customizations.storySubtitle || customizations.timelineSubtitle || 'Growing together',
                    '{{Story_Body}}': customizations.storyBody || customizations.storyIntro || 'Our journey has been filled with laughter, adventure, and an ever-growing love. We can\'t wait to start this next chapter of our lives surrounded by our closest family and friends.',
                    '{{Lodging_Title}}': customizations.lodgingTitle || 'Travel & Lodging',
                    '{{Lodging_Body}}': customizations.lodgingBody || 'We have reserved a block of rooms for our guests at nearby hotels. Please mention our wedding when booking for a special rate.',
                    '{{Registry_Title}}': customizations.registryTitle || 'Gift Registry',
                    '{{Registry_Body}}': customizations.registryBody || 'Your presence at our wedding is the greatest gift of all. However, if you wish to honor us with a gift, we have curated a few registries.',
                    // Timeline Story Defaults (Generic)
                    '{{Story_Event1_Title}}': 'The First Meeting',
                    '{{Story_Event1_Date}}': 'The Beginning',
                    '{{Story_Event1_Desc}}': 'It all started with a simple hello and a shared interest that sparked something special.',
                    '{{Story_Event2_Title}}': 'The First Date',
                    '{{Story_Event2_Date}}': 'A New Chapter',
                    '{{Story_Event2_Desc}}': 'A beautiful evening filled with conversation and laughter that neither of us wanted to end.',
                    '{{Story_Event3_Title}}': 'The Proposal',
                    '{{Story_Event3_Date}}': 'The Promise',
                    '{{Story_Event3_Desc}}': 'Under a starry sky, a question was asked and a beautiful commitment was made.',
                };

                // Add all customizations as placeholders (e.g. {{heroPreTitle}})
                Object.entries(customizations).forEach(([key, value]) => {
                    if (typeof value === 'string') {
                        // Support both {{key}} and {{Key}} (capitalized)
                        placeholders[`{{${key}}}`] = value;
                        const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                        placeholders[`{{${capitalizedKey}}}`] = value;

                        // Support {{Key_Name}} (UI uses camelCase, Template might use Underscore)
                        const underscoreKey = key.replace(/([A-Z])/g, "_$1").replace(/^./, str => str.toUpperCase());
                        placeholders[`{{${underscoreKey}}}`] = value;
                    }
                });

                // 2. Perform Replacements (Text Placeholders)
                Object.entries(placeholders).forEach(([key, value]) => {
                    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                    html = html.replace(regex, value);
                });

                // 3. Complex Injection (Timeline & Gallery) using DOM parser
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Inject Hero Background Override if it exists in customizations
                if (customizations.heroBgImage) {
                    const styleTag = doc.createElement('style');
                    styleTag.innerHTML = `
                        .hero-gradient, .hero-bg, [data-hero-bg="true"] {
                            background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url(${customizations.heroBgImage}) !important;
                            background-size: cover !important;
                            background-position: center !important;
                        }
                    `;
                    doc.head.appendChild(styleTag);
                }

                // Inject Timeline
                const timelineContainer = doc.getElementById('wedding-timeline');
                if (timelineContainer && timeline.length > 0) {
                    // Try to find a template item within the container or use a default structure
                    const templateItem = timelineContainer.querySelector('[data-timeline-item]');
                    const itemHtml = templateItem ? templateItem.outerHTML : null;

                    timelineContainer.innerHTML = ''; // Clear hardcoded examples

                    timeline.forEach(event => {
                        if (itemHtml) {
                            let eHtml = itemHtml;
                            eHtml = eHtml.replace(/{{EventTime}}/g, event.event_time);
                            eHtml = eHtml.replace(/{{EventTitle}}/g, event.title);
                            eHtml = eHtml.replace(/{{EventDescription}}/g, event.description);
                            eHtml = eHtml.replace(/{{EventLocation}}/g, event.location);

                            const div = doc.createElement('div');
                            div.innerHTML = eHtml;
                            if (div.firstElementChild) {
                                timelineContainer.appendChild(div.firstElementChild);
                            }
                        }
                    });
                }

                // Inject Gallery
                const galleryContainer = doc.getElementById('wedding-gallery');
                if (galleryContainer && photos.length > 0) {
                    const templateItem = galleryContainer.querySelector('[data-gallery-item]');
                    const itemHtml = templateItem ? templateItem.outerHTML : null;

                    galleryContainer.innerHTML = '';
                    photos.forEach(photo => {
                        if (itemHtml) {
                            let pHtml = itemHtml;
                            pHtml = pHtml.replace(/{{PhotoUrl}}/g, photo.url);
                            pHtml = pHtml.replace(/{{PhotoTitle}}/g, photo.title || '');

                            const div = doc.createElement('div');
                            div.innerHTML = pHtml;
                            if (div.firstElementChild) {
                                galleryContainer.appendChild(div.firstElementChild);
                            }
                        }
                    });
                }

                // Inject Map
                const mapContainer = doc.getElementById('wedding-map');
                if (mapContainer && (weddingData.venueMapUrl || customizations.mapEmbedLink)) {
                    const embedUrl = (customizations.mapEmbedLink || weddingData.venueMapUrl || '').replace('maps/place/', 'maps/embed/place/').replace('maps/dir/', 'maps/embed/dir/');

                    if (embedUrl) {
                        // If the container is an iframe, set its src
                        if (mapContainer.tagName.toLowerCase() === 'iframe') {
                            mapContainer.setAttribute('src', embedUrl);
                        } else {
                            // Look for an iframe inside
                            let iframe = mapContainer.querySelector('iframe');
                            if (!iframe) {
                                // Create one if it doesn't exist and the container is for a map
                                iframe = doc.createElement('iframe');
                                iframe.setAttribute('width', '100%');
                                iframe.setAttribute('height', '100%');
                                iframe.setAttribute('style', 'border:0');
                                iframe.setAttribute('loading', 'lazy');
                                iframe.setAttribute('allowfullscreen', 'true');
                                mapContainer.innerHTML = ''; // Clear anything else
                                mapContainer.appendChild(iframe);
                            }
                            iframe.setAttribute('src', embedUrl);

                            // Update links if they exist
                            const link = mapContainer.querySelector('a');
                            if (link && (weddingData.venueMapUrl || customizations.mapLink)) {
                                link.setAttribute('href', customizations.mapLink || weddingData.venueMapUrl);
                            }
                        }
                    }
                }

                setTemplateHtml(doc.documentElement.innerHTML);
            } catch (err) {
                console.error("Failed to load stitched template:", err);
                setTemplateHtml('<div style="padding: 5rem; text-align: center; color: #64748b;">Failed to load designer template. Please check your theme selection.</div>');
            } finally {
                setLoading(false);
            }
        };

        loadTemplate();
    }, [weddingData, timeline, photos]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading your designer template...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="stitched-template-container"
            dangerouslySetInnerHTML={{ __html: templateHtml }}
        />
    );
};

export default ProfessionalStitchV2;
