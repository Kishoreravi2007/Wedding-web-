import os
import re

base_dir = r'c:\Users\kr577\Documents\Dev\Wedding-web-\frontend\public\stitch_weddingweb_professional_home'

months = r'(?:January|February|March|April|May|June|July|August|September|October|November|December)'
date_pattern = rf'{months}\s+\d{{1,2}}(?:st|nd|rd|th)?,\s+\d{{4}}'

def inject_id(html_content, section_id, target_id):
    # Find the section
    section_pattern = rf'<section[^>]*id="{section_id}"[^>]*>(.*?)</section>'
    section_match = re.search(section_pattern, html_content, re.DOTALL)
    if not section_match:
        return html_content
    
    full_section = section_match.group(0)
    section_body = section_match.group(1)
    
    # Find the first div that's likely a container
    # We look for space-y or grid
    tag_match = re.search(r'<div[^>]*class="[^"]*(?:space-y|grid)[^"]*"', section_body)
    if tag_match:
        tag = tag_match.group(0)
        if f'id="{target_id}"' not in tag:
            new_tag = tag.replace('<div ', f'<div id="{target_id}" ')
            new_section = full_section.replace(tag, new_tag)
            return html_content.replace(full_section, new_section)
    return html_content

def refactor_template(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 0. DEEP CLEANUP of previous failed attempts
    # Remove any id="wedding-timeline" or id="wedding-gallery" that are malformed or misplaced
    content = re.sub(r'\s*id="wedding-[^"]+"', '', content)
    content = content.replace(' id="wedding-timeline""', '')
    content = content.replace(' id="wedding-gallery""', '')
    content = content.replace('""', '"')
    content = re.sub(r'class="([^"]+)"\s+id="wedding-timeline"', r'id="wedding-timeline" class="\1"', content)

    # 1. Standardize Header 1 names
    content = re.sub(r'(<h1[^>]*>)([^&<]+)(?:&amp;|&)([^<]+)(</h1>)', r'\1{{GroomName}} & {{BrideName}}\4', content)

    # 2. Standardize Title
    content = re.sub(rf'(<title>)([^<]*{months}[^<]*)(</title>)', r'\1{{GroomName}} & {{BrideName}} | {{WeddingDate}}\3', content)
    content = re.sub(r'(<title>)(?:The Union of )?([^&<]+)(?:&amp;|&)([^<]+)(\s*\|.*)?(</title>)', r'\1{{GroomName}} & {{BrideName}} | {{WeddingDate}}\5', content)

    # 3. Standardize Dates
    content = re.sub(date_pattern, '{{WeddingDate}}', content)

    # 4. Standardize Initials
    content = re.sub(r'(<h2[^>]*>)([A-Z])(?:&amp;|&)([A-Z])(</h2>)', r'\1{{GroomInitial}}&{{BrideInitial}}\4', content)

    # 5. Injection
    content = inject_id(content, 'schedule', 'wedding-timeline')
    content = inject_id(content, 'gallery', 'wedding-gallery')

    # 6. Mark items
    if 'id="wedding-timeline"' in content and 'data-timeline-item' not in content:
        content = re.sub(r'(id="wedding-timeline"[^>]*>.*?)(<div[^>]*class="[^"]*flex[^"]*")', r'\1\2 data-timeline-item="true"', content, flags=re.DOTALL)

    if 'id="wedding-gallery"' in content and 'data-gallery-item' not in content:
        content = re.sub(r'(id="wedding-gallery"[^>]*>.*?)(<div[^>]*class="[^"]*(?:relative|col-span)[^"]*")', r'\1\2 data-gallery-item="true"', content, flags=re.DOTALL)

    # 7. Placeholder content
    content = content.replace('03:00 PM', '{{EventTime}}')
    content = content.replace('05:00 PM', '{{EventTime}}')
    content = content.replace('06:30 PM', '{{EventTime}}')
    content = content.replace('08:00 PM', '{{EventTime}}')
    content = content.replace('09:00 PM', '{{EventTime}}')

    # 8. BRANDING INJECTION
    # Footer Branding
    branding_footer = '<p class="mt-4 text-xs opacity-50 font-bold tracking-widest uppercase">Powered by WeddingWeb AI Inc.</p>'
    if 'WeddingWeb AI' not in content:
        # Try to find the copyright notice in footer
        content = re.sub(r'(©\s*202\d[^<]+)(</p>)', rf'\1\2\n                {branding_footer}', content)

    # Watermark Badge
    watermark_html = '''
    <!-- WeddingWeb Watermark -->
    <div style="position: fixed; bottom: 20px; left: 20px; z-index: 9999; pointer-events: none; opacity: 0.3; transform: rotate(-15deg); font-family: sans-serif;">
        <div style="background: #000; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            WeddingWeb AI
        </div>
    </div>
    '''
    if 'WeddingWeb Watermark' not in content:
        content = content.replace('</body>', f'{watermark_html}\n</body>')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file == 'code.html':
            refactor_template(os.path.join(root, file))

print("Cleaned and refactored bulkly.")
