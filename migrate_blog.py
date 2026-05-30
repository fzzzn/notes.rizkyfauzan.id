#!/usr/bin/env python3
"""Migrate Ghost blog posts to Quartz markdown with images - v2."""

import re
import os
import urllib.request
import urllib.parse
from bs4 import BeautifulSoup

CONTENT_DIR = "/home/debian/Projects/notes.rizkyfauzan.id/content"
IMAGES_DIR = os.path.join(CONTENT_DIR, "images")
os.makedirs(IMAGES_DIR, exist_ok=True)

POSTS = [
    {
        "url": "https://blog.rizkyfauzan.id/cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init/",
        "slug": "blog/cara-membuat-vm-template-ubuntu-22-04-di-proxmox-dengan-cloud-init",
        "title": "Cara Membuat VM Template Ubuntu 22.04 di Proxmox Dengan Cloud Init",
        "date": "2024-04-17",
        "tags": ["proxmox", "ubuntu", "cloud-init", "virtualization"],
    },
    {
        "url": "https://blog.rizkyfauzan.id/install-icinga2-di-ubuntu-sever/",
        "slug": "blog/install-icinga2-di-ubuntu-server-dengan-postgresql",
        "title": "Install Icinga2 di Ubuntu Server dengan PostgreSQL",
        "date": "2024-04-06",
        "tags": ["icinga2", "ubuntu", "postgresql", "monitoring"],
    },
    {
        "url": "https://blog.rizkyfauzan.id/seleksi-itnsa-smkn-2-depok-sleman/",
        "slug": "blog/seleksi-itnsa-smkn-2-depok-sleman",
        "title": "Seleksi ITNSA SMKN 2 Depok Sleman",
        "date": "2024-04-06",
        "tags": ["itnsa", "smk", "networking"],
    },
    {
        "url": "https://blog.rizkyfauzan.id/hello/",
        "slug": "blog/hello",
        "title": "Hello!",
        "date": "2024-02-25",
        "tags": ["personal"],
    },
]

def fetch(url):
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        print(f"  ERROR fetching {url}: {e}")
        return None

def download_image(img_url, post_slug, index):
    if not img_url or img_url.startswith('data:'):
        return None
    if 'images.unsplash.com' in img_url:
        return None

    if img_url.startswith('/'):
        img_url = 'https://blog.rizkyfauzan.id' + img_url

    parsed = urllib.parse.urlparse(img_url)
    path = parsed.path
    ext = os.path.splitext(path)[1] or '.png'
    if '?' in ext: ext = ext.split('?')[0]
    if not ext or len(ext) > 6: ext = '.png'

    filename = f"{post_slug.replace('/', '-')}-{index}{ext}"
    local_path = os.path.join(IMAGES_DIR, filename)

    if not os.path.exists(local_path):
        try:
            print(f"    Downloading {img_url}")
            req = urllib.request.Request(img_url, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            })
            with urllib.request.urlopen(req, timeout=30) as resp:
                with open(local_path, 'wb') as f:
                    f.write(resp.read())
            print(f"    Saved to images/{filename}")
        except Exception as e:
            print(f"    ERROR downloading {img_url}: {e}")
            return None
    else:
        print(f"    Already exists: images/{filename}")

    return f"images/{filename}"

def ghost_to_markdown(html, post_slug):
    """Extract article content from Ghost HTML and convert to clean markdown."""
    soup = BeautifulSoup(html, 'html.parser')
    
    # Find the article content - Ghost uses gh-content class
    article = soup.find('section', class_=re.compile(r'gh-content'))
    if not article:
        article = soup.find('article')
    if not article:
        # Try main
        article = soup.find('main')
    if not article:
        print("  Could not find article content")
        return None
    
    # Remove unwanted elements
    for tag in article.find_all(['script', 'iframe', 'aside']):
        tag.decompose()
    for tag in article.find_all('figcaption'):
        tag.decompose()
    
    # Process images: download and replace src
    img_counter = [0]
    for img in article.find_all('img'):
        src = img.get('src', '')
        if not src:
            continue
        if 'unsplash.com' in src:
            # Keep Unsplash images as-is
            continue
        
        img_counter[0] += 1
        local = download_image(src, post_slug, img_counter[0])
        if local:
            img['src'] = '/' + local
            img['data-src'] = ''  # clear any data-src
        else:
            # Remove image if we can't download it
            img.parent.unlink() if img.parent.name == 'figure' else img.extract()
    
    # Remove empty figure tags
    for fig in article.find_all('figure'):
        if not fig.find('img') and not fig.find('figcaption'):
            fig.decompose()
    
    # Remove Ghost-specific navigation/section footers
    for tag in article.find_all(['sectionfooter', 'footer']):
        tag.decompose()
    for tag in article.find_all(class_=re.compile(r'gh-navigation|gh-footer|subscribe|cta')):
        tag.decompose()
    
    # Convert to markdown using html2text
    import html2text
    h = html2text.HTML2Text()
    h.body_width = 0
    h.ignore_links = False
    h.ignore_images = False
    h.ignore_emphasis = False
    h.protect_links = True
    h.unicode_snob = True
    h.skip_internal_links = False
    h.reference_links = False
    h.wrap_links = False
    h.escape_snob = False
    h.images_to_alt = False
    
    md = h.handle(str(article))
    
    # Clean up
    # Remove the date/read-time metadata line at the top
    lines = md.split('\n')
    cleaned = []
    skip_meta = True
    for line in lines:
        # Skip metadata lines at the top (date, read time, author)
        if skip_meta:
            if line.startswith('#'):
                skip_meta = False
                cleaned.append(line)
                continue
            # Skip lines that are just metadata (date, read time, separator)
            stripped = line.strip()
            if not stripped or stripped.startswith('*') or re.match(r'^\w+\s+\d+', stripped) or 'min read' in stripped:
                continue
            skip_meta = False
            cleaned.append(line)
        else:
            # Remove Ghost footer links
            if 'Published by:' in line or line.strip().startswith('[ ]('):
                continue
            if re.match(r'^\[.*\]\(</', line.strip()):
                continue
            cleaned.append(line)
    
    md = '\n'.join(cleaned)
    
    # Clean up excessive whitespace
    md = re.sub(r'\n{4,}', '\n\n\n', md)
    md = md.strip()
    
    return md

def process_post(post):
    print(f"\n{'='*60}")
    print(f"Processing: {post['title']}")
    print(f"  URL: {post['url']}")
    
    filepath = os.path.join(CONTENT_DIR, f"{post['slug']}.md")
    if os.path.exists(filepath):
        print(f"  Already exists, re-processing markdown...")
    
    html = fetch(post['url'])
    if not html:
        print(f"  FAILED to fetch!")
        return False
    
    markdown = ghost_to_markdown(html, post['slug'])
    if markdown is None:
        print(f"  FAILED to convert!")
        return False
    
    # Build frontmatter
    tags_yaml = '\n'.join(f'  - {tag}' for tag in post['tags'])
    frontmatter = f"""---
title: "{post['title']}"
date: {post['date']}
tags:
{tags_yaml}
draft: false
---

"""
    
    full_content = frontmatter + markdown
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w') as f:
        f.write(full_content)
    
    print(f"  SAVED: {filepath}")
    return True

def main():
    existing = set()
    for root, dirs, files in os.walk(CONTENT_DIR):
        for f in files:
            if f.endswith('.md'):
                rel = os.path.relpath(os.path.join(root, f), CONTENT_DIR)
                existing.add(rel.replace('.md', ''))
    
    print(f"Existing content: {', '.join(sorted(existing))}")
    
    success = 0
    failed = 0
    for post in POSTS:
        if process_post(post):
            success += 1
        else:
            failed += 1
    
    print(f"\n{'='*60}")
    print(f"Migration complete: {success} succeeded, {failed} failed")

if __name__ == '__main__':
    # Check BeautifulSoup
    try:
        from bs4 import BeautifulSoup
    except ImportError:
        os.system('uv pip install beautifulsoup4')
    
    main()
