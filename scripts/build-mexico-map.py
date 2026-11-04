"""Project Natural Earth's public-domain Mexico boundary into a local SVG dataset."""
import hashlib
import json
import math
import sys
from pathlib import Path
from urllib.request import urlopen

SOURCE = 'https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@v5.1.2/geojson/ne_50m_admin_0_countries.geojson'
raw = Path(sys.argv[1]).read_bytes() if len(sys.argv) > 1 else urlopen(SOURCE, timeout=30).read()
country = next(f for f in json.loads(raw)['features'] if f['properties']['ADM0_A3'] == 'MEX')
polygons = country['geometry']['coordinates']
assert country['geometry']['type'] == 'MultiPolygon'

def mercator(lon, lat):
    return math.radians(lon), -math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))

points = [mercator(*p) for polygon in polygons for ring in polygon for p in ring]
xs, ys = zip(*points)
left, right, top, bottom = min(xs), max(xs), min(ys), max(ys)
width, height, pad = 800, 520, 28
scale = min((width - pad * 2) / (right - left), (height - pad * 2) / (bottom - top))
xoff = (width - (right - left) * scale) / 2
yoff = (height - (bottom - top) * scale) / 2

def project(lon, lat):
    x, y = mercator(lon, lat)
    return [round(xoff + (x - left) * scale, 2), round(yoff + (y - top) * scale, 2)]

paths = []
for polygon in polygons:
    parts = []
    for ring in polygon:
        projected = [project(*p) for p in ring]
        parts.append('M' + 'L'.join(f'{x},{y}' for x, y in projected) + 'Z')
    paths.append(''.join(parts))

# Diagram reference points only: these do not identify Vialterna offices or installations.
locations = [
    ('northwest', -117.04, 32.51), ('north', -110.96, 29.07),
    ('northeast', -100.31, 25.69), ('west', -103.35, 20.67),
    ('center', -99.13, 19.43), ('southeast', -89.62, 20.97),
    ('caribbean', -86.85, 21.16),
]
nodes = [dict(id=name, x=project(lon, lat)[0], y=project(lon, lat)[1]) for name, lon, lat in locations]
lookup = {n['id']: n for n in nodes}
connections = [('northwest', 'north'), ('north', 'northeast'), ('north', 'west'), ('northeast', 'center'), ('west', 'center'), ('center', 'southeast'), ('southeast', 'caribbean')]
links = [f"M{lookup[a]['x']},{lookup[a]['y']}L{lookup[b]['x']},{lookup[b]['y']}" for a, b in connections]
output = {'source': SOURCE, 'dataset': 'Natural Earth v5.1.2 — Admin 0 Countries 1:50m', 'license': 'Public domain', 'sourceSha256': hashlib.sha256(raw).hexdigest(), 'projection': 'Mercator, uniformly scaled', 'viewBox': f'0 0 {width} {height}', 'paths': paths, 'nodes': nodes, 'links': links}
Path('src/data/mexico-map.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n')
print(f"Generated Mexico: {len(paths)} polygons, {len(points)} vertices, {len(nodes)} illustrative network nodes.")
