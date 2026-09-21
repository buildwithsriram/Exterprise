"""Presentation helpers: functional icons; all labels and prose remain source-backed."""
import re

ICONS = [
    '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 9h8M8 13h5M8 17h3"/>',
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v6m0 8v6M2 12h6m8 0h6M5 5l4 4m6 6 4 4M5 19l4-4m6-6 4-4"/>',
    '<path d="M4 6h16v11H9l-5 4V6Z"/><path d="m8 11 3 3 5-5"/>',
    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M17 3v6h4M3 17h6v4M17 9l-4-4M9 17l-4-4"/>',
    '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10v10M3 7l9 5 9-5"/>',
    '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M6 6h1m-1 11h1M11 6h7m-7 11h7"/>',
    '<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
    '<path d="M3 21V3m0 18h19M7 17v-5m6 5V8m6 9V4"/>',
    '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m10 8-4 4 4 4m4-8 4 4-4 4"/>',
]
SLUGS=['ai-agents-now-assist','servicenow-otto','customer-service-management','field-service-management','it-service-management','it-operations-management','hr-service-delivery','strategic-portfolio-management','now-platform']

def visual_icon(slug, offset=0):
    index=(SLUGS.index(slug)+offset)%len(ICONS)
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'+ICONS[index]+'</svg>'

def decorate_section(markup, slug):
    count=0
    def decorate(match):
        nonlocal count
        icon='<div class="service-glyph" aria-hidden="true">'+visual_icon(slug,count)+'</div>'
        count+=1
        return match.group(0)+icon
    markup=re.sub(r'<(?:div|article) class="(?:s-item|d-card|process-step|chal-item)"[^>]*>',decorate,markup)
    return markup
