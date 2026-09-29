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
        <a class="nav-head nav-contact" href="/contact/">Contact</a>
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

# ---- project pages ----
for p in PROJECTS:
    if p['slug'] == 'welcome':
        continue
    blocks = '\n'.join(render_block(b) for b in p['blocks'])
    article = f'''      <article class="project">
      <h1>{esc(p['title'])}</h1>
{blocks}
      </article>'''
    write(f'{p["slug"]}/index.html', shell(f'{p["title"]} — Sean McKeon', p['slug'], article))

# ---- contact ----
contact = '''      <div class="contact">
      <h1>Contact</h1>
      <form id="contactForm" novalidate>
        <label>Name *<input required name="name" type="text"></label>
        <label>Email Address *<input required name="email" type="email"></label>
        <label>Message *<textarea required name="message" rows="6"></textarea></label>
        <input type="text" name="_honey" class="honey" tabindex="-1" autocomplete="off" aria-hidden="true">
        <button type="submit">Submit</button>
        <div class="form-error" hidden>Something went wrong — please try again, or email seanrobertmckeon@gmail.com directly.</div>
      </form>
      <div class="form-sent" hidden>Thank you!</div>
      </div>'''
write('contact/index.html', shell('Contact — Sean McKeon', 'contact', contact))

# ---- welcome ----
welcome = f'''<!DOCTYPE html>
<html lang="en">
{head('Sean McKeon — Reel 2026')}
<body>
{cursor_layers()}
  <div class="welcome">
    <div class="welcome-name">
      <a class="welcome-title" href="/">SEAN MCKEON</a>
      <div class="welcome-sub">Multidisciplinary Artist / Motion Designer</div>
    </div>
    <div class="welcome-reel">
      <iframe src="https://player.vimeo.com/video/1154777635?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
    </div>
    <div class="welcome-links">
      <a href="https://www.linkedin.com/in/sean-mckeon-77018557/" target="_blank" rel="noopener">LinkedIn</a>
      <a href="http://vimeo.com/seanmckeon" target="_blank" rel="noopener">Vimeo</a>
      <a href="mailto:seanrobertmckeon@gmail.com">Email</a>
    </div>
    <a class="welcome-enter" href="/">Enter site</a>
  </div>
</body>
</html>
'''
write('welcome/index.html', welcome)

print('build complete:', 3 + sum(1 for p in PROJECTS if p['slug'] != 'welcome'), 'pages')
