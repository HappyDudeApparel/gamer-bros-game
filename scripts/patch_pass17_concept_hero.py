from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
p=ROOT/'pass17-world1'/'index.html'
s=p.read_text()
old='''<script type="importmap">{"imports":{"three":"../vendor/three/three.module.min.js","three/addons/":"../vendor/three/addons/"}}</script>'''
new='''<script type="importmap">{"imports":{"three":"../vendor/three/three.module.min.js","three/addons/":"../vendor/three/addons/","../playground-v2/gamer-bro.js?v=pass17":"../src/pass17-gamer-bro.js?v=17-hero-1"}}</script>'''
if new in s:
    print('PASS17_CONCEPT_HERO_ALREADY_WIRED')
elif old in s:
    p.write_text(s.replace(old,new,1))
    print('PASS17_CONCEPT_HERO_WIRED')
else:
    raise SystemExit('Pass 17 import-map marker missing')
