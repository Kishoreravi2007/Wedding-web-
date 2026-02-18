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

                const placeholders: Record<string, string> = {
                    '{{GroomName}}': weddingData.groomName || 'Groom',
                    '{{BrideName}}': weddingData.brideName || 'Bride',
                    '{{GroomInitial}}': (weddingData.groomName || 'G').charAt(0),
                    '{{BrideInitial}}': (weddingData.brideName || 'B').charAt(0),
                    '{{WeddingDate}}': formattedDate,
                    '{{Venue}}': weddingData.venue || 'TBD',
                    '{{WeddingTime}}': weddingData.weddingTime || '10:00',
                    '{{GuestCount}}': String(weddingData.guestCount || 0),
                    '{{Slug}}': weddingData.slug || '',
                    '{{MapLink}}': weddingData.venueMapUrl || '#',
                    '{{MapEmbedLink}}': weddingData.venueMapUrl ? weddingData.venueMapUrl.replace('maps/place/', 'maps/embed/place/').replace('maps/dir/', 'maps/embed/dir/') : '',
                };

                // 2. Perform Replacements (Text Placeholders)
                Object.entries(placeholders).forEach(([key, value]) => {
                    const regex = new RegExp(key, 'g');
                    html = html.replace(regex, value);
                });

                // 3. Complex Injection (Timeline & Gallery) using DOM parser
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

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
                if (mapContainer && weddingData.venueMapUrl) {
                    const embedUrl = weddingData.venueMapUrl.replace('maps/place/', 'maps/embed/place/').replace('maps/dir/', 'maps/embed/dir/');

                    // If the container is an iframe, set its src
                    if (mapContainer.tagName.toLowerCase() === 'iframe') {
                        mapContainer.setAttribute('src', embedUrl);
                    } else {
                        // Look for an iframe inside or a link
                        const iframe = mapContainer.querySelector('iframe');
                        if (iframe) {
                            iframe.setAttribute('src', embedUrl);
                        }

                        const link = mapContainer.querySelector('a');
                        if (link) {
                            link.setAttribute('href', weddingData.venueMapUrl);
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
    }, [weddingData.theme, weddingData.groomName, weddingData.brideName, weddingData.weddingDate, weddingData.venue]);

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
