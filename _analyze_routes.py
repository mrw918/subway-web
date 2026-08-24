import re
import os
from collections import Counter, defaultdict

base = os.path.dirname(os.path.abspath(__file__))
files = sorted(f for f in os.listdir(base) if f.endswith(".svg"))

out = open(os.path.join(base, "_analyze_routes_out.txt"), "w", encoding="utf-8")
for fn in files:
    path = os.path.join(base, fn)
    text = open(path, encoding="utf-8").read()
    track_colors = sorted(
        set(m.group(1).lower() for m in re.finditer(r'stroke-width="5[^"]*"[^>]*stroke="(#[0-9a-fA-F]{6})"', text))
    )
    badges = []
    for m in re.finditer(r'<text[^>]*font-size="([^"]+)"[^>]*>.*?<tspan[^>]*>([SMTEC]\d+)</tspan>', text, re.S):
        badges.append((m.group(2), float(m.group(1))))
    large_fills = [m.group(1).lower() for m in re.finditer(r'C13\.955.*?fill="(#[0-9a-fA-F]{6})"', text)]
    small_sw = [m.group(1).lower() for m in re.finditer(
        r'C5\.257.*?fill="(#[0-9a-fA-F]{6})" fill-rule="evenodd"', text)]
    small_ids = sorted({b[0] for b in badges if b[1] <= 14})
    large_ids = sorted({b[0] for b in badges if b[1] > 14})
    out.write("=== %s ===\n" % fn)
    out.write("track: %s\n" % track_colors)
    out.write("header fills: %s\n" % large_fills)
    out.write("legend swatches: %s\n" % small_sw)
    out.write("small badges: %s large: %s\n\n" % (small_ids, large_ids))
out.close()
print("done")
