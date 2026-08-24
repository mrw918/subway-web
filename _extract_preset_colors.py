import re
import os
import json

BASE = os.path.dirname(os.path.abspath(__file__))
BADGE_RE = re.compile(r"^[A-Z]+\d+$")

def user_center_from_text(text_el):
    m = re.search(r'matrix\(([^)]+)\)', text_el.get("transform", ""))
    if not m:
        return 0, 0
    p = [float(x) for x in re.split(r"[\s,]+", m.group(1).strip())[:6]]
    fs = float(re.search(r'font-size="([^"]+)"', text_el).group(1))
    ym = re.search(r'y="([^"]+)"', text_el)
    y = float(ym.group(1)) if ym else 0
    xm = re.search(r'x="([^"]+)"', text_el)
    xs = [float(x) for x in (xm.group(1).split() if xm else ["0"])]
    x = sum(xs) / len(xs)
    return p[0] * x + p[2] * y + p[4], p[1] * x + p[3] * y + p[5]

def parse_badges(text):
    badges = []
    for m in re.finditer(r"<text([^>]*)>(.*?)</text>", text, re.S):
        attrs, inner = m.group(1), m.group(2)
        raw = re.sub(r"\s+", "", inner)
        raw = re.sub(r"<[^>]+>", "", raw)
        if not BADGE_RE.match(raw):
            continue
        fs = float(re.search(r'font-size="([^"]+)"', attrs).group(1))
        cx, cy = user_center_from_text({"transform": re.search(r'transform="([^"]+)"', attrs).group(1) if re.search(r'transform="([^"]+)"', attrs) else "", **{}})
        # rough center via tspan
        tm = re.search(r'transform="([^"]+)"', attrs)
        tf = tm.group(1) if tm else ""
        tspan = re.search(r'<tspan[^>]*y="([^"]+)"[^>]*x="([^"]+)"', inner)
        if tspan and tf:
            y = float(tspan.group(1).split()[0])
            xs = [float(v) for v in tspan.group(2).split()]
            x = sum(xs) / len(xs)
            mm = [float(v) for v in re.split(r"[\s,]+", re.search(r"matrix\(([^)]+)\)", tf).group(1).strip())[:6]]
            cx = mm[0] * x + mm[2] * y + mm[4]
            cy = mm[1] * x + mm[3] * y + mm[5]
        badges.append({"id": raw, "fontSize": fs, "center": (cx, cy)})
    return badges

def parse_header_circles(text):
    circles = []
    for m in re.finditer(r'<path[^>]*transform="matrix\(([^)]+)\)"[^>]*d="([^"]*C13\.955[^"]*)"[^>]*fill="(#[0-9a-fA-F]{6})"', text):
        tx = [float(v) for v in re.split(r"[\s,]+", m.group(1).strip())[:6]]
        # approximate center at transform translate
        cx, cy = tx[4], tx[5]
        circles.append({"color": m.group(3).lower(), "center": (cx, cy)})
    return circles

roadmap_map = {
    "知识路线图 新ci 1-1.svg": "soa",
    "知识路线图 新ci 1-2.svg": "calibration",
    "知识路线图 新ci 1-3.svg": "mbse",
    "知识路线图 新ci 1-4.svg": "network-test",
    "知识路线图 新ci 1-5.svg": "network-dev",
    "知识路线图 新ci 1-6.svg": "embedded",
    "知识路线图 新ci 1-7.svg": "diagnostic",
}

out = {}
for fn, rid in roadmap_map.items():
    text = open(os.path.join(BASE, fn), encoding="utf-8").read()
    badges = parse_badges(text)
    large = sorted([b for b in badges if b["fontSize"] > 14], key=lambda b: b["center"][0])
    circles = sorted(parse_header_circles(text), key=lambda c: c["center"][0])
    mapping = {}
    for i, b in enumerate(large):
        color = circles[i]["color"] if i < len(circles) else None
        if color:
            mapping[b["id"]] = color
    out[rid] = mapping

open(os.path.join(BASE, "_preset_colors.json"), "w", encoding="utf-8").write(json.dumps(out, indent=2, ensure_ascii=False))
print("ok")
