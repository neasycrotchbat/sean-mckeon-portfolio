"""Static page generator for the Classic portfolio.

Renders index.html (work grid), welcome/, contact/, and one directory per
project slug from tools/content.json. Run from the repo root:

    python tools/build.py

No dependencies. Re-run after editing content.json, then commit the output.
"""
import html
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = json.load(open(os.path.join(ROOT, 'tools', 'content.json'), encoding='utf-8'))
PROJECTS = CONTENT['projects']

FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='13' fill='%23111111'/%3E%3Ccircle cx='32' cy='32' r='13' fill='%23ffffff'/%3E%3C/svg%3E"
DESCRIPTION = "Sean McKeon is a multidisciplinary artist and motion designer in Richardson, TX — broadcast, brand film, experiential, and real-time work."

def esc(s):
    return html.escape(s, quote=True)

def head(title, extra_js=''):
    return f'''<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(DESCRIPTION)}">
  <link rel="icon" href="{FAVICON}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="/css/styles.css">
  <script src="/js/cursor.js" defer></script>
  <script src="/js/site.js" defer></script>
  <script src="/js/visits.js" defer></script>{extra_js}
</head>'''

def cursor_layers():
    return '''  <canvas id="gridCanvas" class="grid-canvas" aria-hidden="true"></canvas>
  <div id="blobLayer" class="blob-layer" aria-hidden="true"></div>'''

def sidebar(active_slug):
    links = []
    for p in PROJECTS:
        cls = ' class="active"' if p['slug'] == active_slug else ''
        links.append(f'          <a href="/{p["slug"]}/"{cls}>{esc(p["title"])}</a>')
    links = '\n'.join(links)
    email = CONTENT['moreInfo']['email']
    return f'''    <aside class="sidebar">
      <div class="who">
        <a class="name" href="/">Sean McKeon</a>
        <div class="tagline">Multidisciplinary Artist/Motion Designer</div>
      </div>
      <nav class="nav">
        <a class="nav-head" href="/">Work</a>
        <div class="nav-projects">
{links}
        </div>
        <a class="nav-head nav-more" href="/more-info/">More Info</a>
        <a class="nav-email" href="mailto:{email}">{email}</a>
      </nav>
      <a class="vimeo-link" href="https://vimeo.com/seanmckeon" target="_blank" rel="noopener">See more work on Vimeo</a>
    </aside>'''

def shell(title, active_slug, main_html, extra_js=''):
    return f'''<!DOCTYPE html>
<html lang="en">
{head(title, extra_js)}
<body>
{cursor_layers()}
  <div class="frame">
{sidebar(active_slug)}
    <main class="main">
{main_html}
      <footer class="foot"><a href="#" id="toTop">↑ Back to Top</a></footer>
    </main>
  </div>
</body>
</html>
'''

def cover_tile(p):
    href = '/welcome/' if p['slug'] == 'welcome' else f'/{p["slug"]}/'
    if p['coverType'] == 'video':
        media = f'<video src="{p["cover"]}" autoplay muted loop playsinline disablepictureinpicture aria-label="{esc(p["title"])}"></video>'
    else:
        media = f'<img src="{p["cover"]}" alt="{esc(p["title"])}" loading="lazy">'
    return f'''        <a class="tile" href="{href}" aria-label="{esc(p["title"])}">
          <div class="tile-media">{media}</div>
        </a>'''

def render_text_block(b):
    pre = esc(b.get('text', ''))
    if b.get('link'):
        link = f'<a href="{esc(b["link"]["href"])}" target="_blank" rel="noopener">{esc(b["link"]["label"])}</a>'
        post = esc(b.get('textAfter', ''))
        return f'      <p class="copy">{pre}{link}{post}</p>'
    return f'      <p class="copy">{pre}</p>'

def render_block(b):
    t = b['type']
    if t == 'text':
        return render_text_block(b)
    if t == 'video':
        return (f'      <div class="embed"><video src="{b["src"]}" poster="{b["poster"]}" '
                f'controls playsinline preload="metadata"></video></div>')
    if t == 'embed':
        return (f'      <div class="embed"><iframe src="{esc(b["src"])}" loading="lazy" '
                f'allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>')
    if t == 'image':
        return f'      <img class="full-img" src="{b["src"]}" alt="" loading="lazy">'
    if t == 'imageGrid':
        imgs = '\n'.join(f'        <img src="{i}" alt="" loading="lazy">' for i in b['images'])
        return f'      <div class="img-grid">\n{imgs}\n      </div>'
    raise ValueError('unknown block type ' + t)

def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print('wrote', path)

# ---- work grid ----
tiles = '\n'.join(cover_tile(p) for p in PROJECTS)
grid = f'''      <div class="work-grid">
{tiles}
      </div>'''
write('index.html', shell('Sean McKeon — Multidisciplinary Artist / Motion Designer', None, grid))

# ---- project pages (the reel included — it's a normal project now) ----
for p in PROJECTS:
    blocks = '\n'.join(render_block(b) for b in p['blocks'])
    article = f'''      <article class="project">
      <h1>{esc(p['title'])}</h1>
{blocks}
      </article>'''
    write(f'{p["slug"]}/index.html', shell(f'{p["title"]} — Sean McKeon', p['slug'], article))

# ---- more info ----
mi = CONTENT['moreInfo']
intro = '\n'.join(f'        <p>{esc(t)}</p>' for t in mi['intro'])
disciplines = '<br>'.join(esc(d) for d in mi['disciplines'])
toolkit = esc(', '.join(mi['toolkit']))
clients = esc(', '.join(mi['clients']))
more = f'''      <article class="more-info">
      <div class="mi-intro">
{intro}
      </div>
      <div class="mi-facts">
        <div class="mi-col"><div class="mi-head">Currently</div><div>{esc(mi['currently']['role'])}<br>{esc(mi['currently']['dates'])}</div></div>
        <div class="mi-col"><div class="mi-head">Disciplines</div><div>{disciplines}</div></div>
        <div class="mi-col"><div class="mi-head">Toolkit</div><div>{toolkit}</div></div>
      </div>
      <div class="mi-clients"><div class="mi-head">Selected Clients</div><div>{clients}</div></div>
      <div class="mi-contact"><div class="mi-head">Contact</div><a href="mailto:{mi['email']}">{mi['email']}</a></div>
      </article>'''
write('more-info/index.html', shell('More Info — Sean McKeon', 'more-info', more))

# ---- redirect stubs for retired routes ----
def redirect_stub(target):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url={target}">
  <link rel="canonical" href="https://seanrobertmckeon.com{target}">
  <title>Redirecting…</title>
</head>
<body><a href="{target}">Moved here</a></body>
</html>
'''
write('welcome/index.html', redirect_stub('/reel/'))
write('contact/index.html', redirect_stub('/more-info/'))

print('build complete:', 2 + len(PROJECTS), 'pages + 2 redirects')
