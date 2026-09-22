#!/usr/bin/env python3
"""Import course links from xlsx into node-data-*.js files."""

from __future__ import annotations

import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
XLSX = Path("/Users/maruowen/Desktop/副本Training_反向对应_5728 (4).xlsx")
JS_DIR = ROOT / "js"

ROUTE_MAP = {
    "C": "node-data-calibration.js",
    "D": "node-data.js",
    "E": "node-data-embedded.js",
    "M": "node-data-mbse.js",
    "S": "node-data-soa.js",
    "T": "node-data-network-test.js",
    "DG": "node-data-diagnostic.js",
}

SITE_ALIASES = {
    "标定协议_XCP": "标定协议XCP",
    "CANoe.Diva": "CANoe.DiVa",
    "AUTOSAR概论": "ASR概论",
}

PDF_Q_URL = (
    "https://vgroup-my.sharepoint.com/:b:/r/personal/ext_zoe_wen_vector_com/"
    "Documents/Microsoft%20Teams%20Chat%20Files/"
    "canoe-canalyzer-option-can-can-fd-%E8%BD%BB%E9%87%8F%E7%89%88%E8%87%AA%E5%AD%A6%E8%AF%BE.pdf"
    "?d=w1f4c658feba44930b4a134b15865d650&csf=1&web=1&e=j7bFxY"
)
PDF_T_URL = (
    "https://vgroup-my.sharepoint.com/:b:/r/personal/ext_zoe_wen_vector_com/"
    "Documents/Microsoft%20Teams%20Chat%20Files/"
    "canoe-canalyzercan-can-fd-trainingcar%E7%89%88%E8%87%AA%E5%AD%A6%E8%AF%BE%201.pdf"
    "?d=w5cca6efa8ca849739377e6d574f2a719&csf=1&web=1&e=r2T1QK"
)
PAID_TAIL = (
    "单人价格（一价包含Vector学习中心所有自学课程）：\n"
    "4,000元+VAT 6%/月\n40,000元+VAT 6%/年\n"
    "如您有意向购买该类课程，请您联系您的对接销售，或发送邮件至Vector学习中心进行咨询："
    "training@cn.vector.com"
)

D1_URL_CONST = {
    PDF_Q_URL: "D1_PDF_QINGLIANG",
    PDF_T_URL: "D1_PDF_TRAININGCAR",
    "https://vector-external.atalent.com/Saba/Web_spf/A501PRD0117/common/ledetail/cours000000000003440/latestversion": "D1_ATALENT_AUTOSAR",
    "https://vector-external.atalent.com/Saba/Web_spf/A501PRD0117/common/ledetail/cours000000000003420/latestversion": "D1_ATALENT_CAN",
    "https://vector-external.atalent.com/Saba/Web_spf/A501PRD0117/common/ledetail/cours000000000003520/latestversion": "D1_ATALENT_CANFD",
}

D1_DETAIL_BY_COURSE = {
    ("AUTOSAR协议", "D1_ATALENT_AUTOSAR"): "D1_DETAIL_AUTOSAR",
    ("CAN协议", "D1_ATALENT_CAN"): "D1_DETAIL_CAN",
    ("CAN FD协议", "D1_ATALENT_CANFD"): "D1_DETAIL_CANFD",
    ("CANoe/CANalyzer.CAN/CAN FD_轻量版", "D1_PDF_QINGLIANG"): "D1_DETAIL_PDF_QINGLIANG",
    ("CANoe/CANalyzer.CAN/CAN FD_TrainingCar版", "D1_PDF_TRAININGCAR"): "D1_DETAIL_PDF_TRAININGCAR",
}

TYPE_RANK = {
    "视频课": 0,
    "直播课": 1,
    "公开课": 2,
    "自学课": 3,
    "内训课": 4,
}


def norm(text: str) -> str:
    return re.sub(r"\s+", "", text or "").lower()


def js_str(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n") + '"'


def read_xlsx_rows() -> list[list[str]]:
    with zipfile.ZipFile(XLSX) as zf:
        shared: list[str] = []
        root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
        ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        for si in root.findall(".//m:si", ns):
            shared.append("".join((t.text or "") for t in si.findall(".//m:t", ns)))

        sheet = ET.fromstring(zf.read("xl/worksheets/sheet1.xml"))
        rows: list[list[str]] = []
        for row in sheet.findall(".//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row"):
            vals: list[str] = []
            for cell in row.findall("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c"):
                cell_type = cell.get("t")
                value = cell.find("{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v")
                if value is None:
                    vals.append("")
                elif cell_type == "s":
                    vals.append(shared[int(value.text)])
                else:
                    vals.append(value.text or "")
            if vals and vals[0] != "ID":
                rows.append(vals)
        return rows


def parse_nodes() -> dict[str, list[dict]]:
    nodes_by_route: dict[str, list[dict]] = {}
    for route, filename in ROUTE_MAP.items():
        text = (JS_DIR / filename).read_text(encoding="utf-8")
        nodes: list[dict] = []
        for match in re.finditer(r'"([^"]+)":\s*\{', text):
            chunk = text[match.start() : match.start() + 900]
            match_block = re.search(r"match:\s*\[(.*?)\]", chunk, re.S)
            matches = re.findall(r'"([^"]+)"', match_block.group(1)) if match_block else []
            nodes.append({"key": match.group(1), "matches": matches})
        nodes_by_route[route] = nodes
    return nodes_by_route


def parse_station(station: str) -> tuple[str, str] | None:
    matched = re.match(r"^([A-Z]+)(\d+)[：:](.+?)_(.+)$", station)
    if not matched:
        return None
    route, _, _, site = matched.groups()
    return route, SITE_ALIASES.get(site, site)


def find_node_key(nodes_by_route: dict[str, list[dict]], route: str, site: str) -> str | None:
    for node in nodes_by_route.get(route, []):
        for alias in node["matches"]:
            if norm(alias) == norm(site):
                return node["key"]
    for node in nodes_by_route.get(route, []):
        for alias in node["matches"]:
            if norm(alias) in norm(site) or norm(site) in norm(alias):
                return node["key"]
    return None


def clean_detail(text: str) -> str:
    lines: list[str] = []
    for line in (text or "").split("\n"):
        stripped = line.strip()
        if not stripped:
            continue
        if "插入链接" in stripped:
            continue
        if re.match(r"^https?://", stripped):
            continue
        if "加上课程大纲" in stripped:
            continue
        if "课程大纲请" in stripped and "pdf" in stripped.lower():
            continue
        lines.append(line.rstrip())
    return "\n".join(lines).strip()


def extract_url(text: str) -> str | None:
    matched = re.search(r"https?://[^\s\n]+", text or "")
    return matched.group(0) if matched else None


def is_link_fragment(link: str) -> bool:
    if not link.strip():
        return False
    if link.strip().startswith("暂无") or "不展示" in link:
        return False
    if extract_url(link):
        return False
    if "插入链接" in link or "本课程为" in link:
        return False
    if "课程大纲" in link or "同公开课" in link:
        return False
    return True


def is_price_only_fragment(link: str) -> bool:
    text = link.strip()
    if not text or extract_url(text) or "本课程为" in text:
        return False
    if len(text) >= 80:
        return False
    if "元+VAT" in text or text.startswith("单人价格") or text.startswith("如您有意向"):
        return True
    return False


def build_id_link_fallback(rows: list[list[str]]) -> dict[str, str]:
    grouped: dict[str, list[str]] = defaultdict(list)
    for row in rows:
        grouped[row[0]].append(row[5] if len(row) > 5 else "")

    fallback: dict[str, str] = {}
    for row_id, links in grouped.items():
        chosen = None
        for link in links:
            if extract_url(link):
                chosen = link
                break
        if not chosen:
            for link in links:
                if "本课程为" in link and len(link.strip()) > 80:
                    chosen = link
                    break
        if chosen:
            fallback[row_id] = chosen
    return fallback


def is_can_fd_pdf_course(course_name: str, link: str) -> bool:
    if "LIN" in course_name:
        return False
    if "CAN/CAN FD" not in course_name and "CAN FD" not in course_name:
        return False
    if "课程大纲" in link:
        return True
    if "轻量版" in course_name and "付费" in link:
        return True
    if "TrainingCar" in course_name and "付费" in link:
        return True
    return False


def course_key(course: dict) -> tuple[str, str]:
    return (course["name"], course["type"])


def dedupe_courses(courses: list[dict]) -> list[dict]:
    seen: set[tuple[str, str]] = set()
    result: list[dict] = []
    for course in courses:
        key = course_key(course)
        if key in seen:
            continue
        seen.add(key)
        result.append(course)
    result.sort(key=lambda item: (TYPE_RANK.get(item["type"], 99), item["name"]))
    return result


def parse_link_to_course(link: str, course_name: str, public_urls: dict[tuple[str, str], str]) -> dict | None:
    if "不展示" in link:
        return None
    if link.strip() in ("暂无", "暂无。", "暂无链接") or link.strip().startswith("暂无，"):
        return None

    course: dict = {}

    if not link.strip():
        return course

    if "同公开课" in link and "http" not in link:
        url = public_urls.get((course_name, "公开课"))
        if url:
            course["url"] = url
        return course

    url = extract_url(link)
    if url and (
        "合并" in link[: link.find(url)]
        or link.strip().startswith("和")
        or link.strip().startswith("与")
        or link.strip().startswith("http")
    ):
        course["url"] = url
        if "点击此处" in link and "插入链接" in link:
            detail = clean_detail(link)
            if detail:
                course["detail"] = detail
        return course

    if "插入链接" in link:
        if url:
            course["url"] = url
            detail = clean_detail(link)
            if detail:
                course["detail"] = detail
        return course

    if is_can_fd_pdf_course(course_name, link):
        if "轻量版" in course_name:
            course["url"] = PDF_Q_URL
            course["linkKind"] = "pdf"
        elif "TrainingCar" in course_name:
            course["url"] = PDF_T_URL
            course["linkKind"] = "pdf"
        detail = clean_detail(link)
        course["detail"] = detail or ("本课程为付费自学课\n" + PAID_TAIL)
        return course

    if url:
        course["url"] = url
        return course

    detail = clean_detail(link)
    if detail:
        course["detail"] = detail
    return course


def build_courses(rows: list[list[str]], nodes_by_route: dict[str, list[dict]]) -> dict[str, dict[str, list[dict]]]:
    id_fallback = build_id_link_fallback(rows)

    public_urls: dict[tuple[str, str], str] = {}
    for row in rows:
        if row[1] == "公开课":
            url = extract_url(row[5] if len(row) > 5 else "")
            if url:
                public_urls[(row[3].strip(), row[1])] = url

    courses_by_file: dict[str, dict[str, list[dict]]] = {filename: {} for filename in ROUTE_MAP.values()}
    unresolved: list[tuple[str, str, str]] = []

    for row in rows:
        course_type = row[1]
        course_name = row[3].strip()
        station = row[4]
        link = (row[5] if len(row) > 5 else "") or ""

        if is_link_fragment(link):
            link = id_fallback.get(row[0], link)

        if is_price_only_fragment(link):
            continue

        parsed = parse_station(station)
        if not parsed:
            unresolved.append(("station", station, course_name))
            continue
        route, site = parsed
        node_key = find_node_key(nodes_by_route, route, site)
        if not node_key:
            unresolved.append(("node", station, course_name))
            continue

        fields = parse_link_to_course(link, course_name, public_urls)
        if fields is None:
            continue

        filename = ROUTE_MAP[route]
        bucket = courses_by_file[filename].setdefault(node_key, [])

        course: dict = {"name": course_name, "type": course_type}
        course.update(fields)

        if "同公开课" in (row[5] or "") and "http" not in (row[5] or "") and not course.get("url"):
            unresolved.append(("same_public", station, course_name))

        if "插入链接" in (row[5] or "") and not course.get("url"):
            unresolved.append(("atalent", station, course_name))

        bucket.append(course)

    if unresolved:
        print("Unresolved entries:", file=sys.stderr)
        for item in unresolved:
            print(" ", item, file=sys.stderr)
        raise SystemExit(1)

    for filename in courses_by_file:
        for node_key in list(courses_by_file[filename].keys()):
            courses_by_file[filename][node_key] = dedupe_courses(courses_by_file[filename][node_key])

    return courses_by_file


def render_course(course: dict, use_d1_constants: bool) -> str:
    lines = [
        "      {",
        f"        name: {js_str(course['name'])},",
        f"        type: {js_str(course['type'])},",
    ]

    url = course.get("url")
    url_ref = None
    if url:
        if use_d1_constants and url in D1_URL_CONST:
            url_ref = D1_URL_CONST[url]
            lines.append(f"        url: {url_ref},")
        else:
            lines.append(f"        url: {js_str(url)},")

    detail = course.get("detail")
    if detail:
        detail_const = None
        if use_d1_constants and url_ref:
            detail_const = D1_DETAIL_BY_COURSE.get((course["name"], url_ref))
        if detail_const:
            lines.append(f"        detail: {detail_const},")
        else:
            lines.append(f"        detail: {js_str(detail)},")

    if course.get("linkKind"):
        lines.append(f'        linkKind: {js_str(course["linkKind"])},')

    if lines[-1].endswith(","):
        lines[-1] = lines[-1][:-1]
    lines.append("      }")
    return "\n".join(lines)


def render_courses_block(courses: list[dict], use_d1_constants: bool) -> str:
    if not courses:
        return ""
    body = ",\n".join(render_course(course, use_d1_constants) for course in courses)
    return f"    courses: [\n{body},\n    ],\n"


def find_object_end(text: str, start: int) -> int:
    depth = 0
    in_string = False
    escape = False
    for index in range(start, len(text)):
        char = text[index]
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return index
    raise ValueError("Unbalanced braces")


def patch_node_data_file(filename: str, courses_map: dict[str, list[dict]]) -> None:
    path = JS_DIR / filename
    text = path.read_text(encoding="utf-8")
    use_d1_constants = filename == "node-data.js"

    for node_key, courses in courses_map.items():
        pattern = re.compile(rf'"{re.escape(node_key)}":\s*\{{')
        match = pattern.search(text)
        if not match:
            print(f"Warning: node {node_key} not found in {filename}", file=sys.stderr)
            continue

        obj_start = match.end() - 1
        obj_end = find_object_end(text, obj_start)
        obj_text = text[obj_start : obj_end + 1]

        obj_text = re.sub(r"\n\s*courses:\s*\[[\s\S]*?\],", "", obj_text)
        courses_block = render_courses_block(courses, use_d1_constants)
        if courses_block:
            insertion = "\n" + courses_block.rstrip("\n")
            obj_text = obj_text[:-1] + insertion + "\n  }"

        text = text[:obj_start] + obj_text + text[obj_end + 1 :]

    path.write_text(text, encoding="utf-8")


def patch_match_aliases() -> None:
    path = JS_DIR / "node-data-network-test.js"
    text = path.read_text(encoding="utf-8")
    if "CANoe.Diva" not in text:
        text = text.replace(
            'match: ["CANoe.DiVa", "DiVa"],',
            'match: ["CANoe.DiVa", "CANoe.Diva", "DiVa"],',
            1,
        )
        path.write_text(text, encoding="utf-8")


def bump_index_versions() -> None:
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    bumps = {
        "node-data.js": 22,
        "node-data-network-test.js": 16,
        "node-data-diagnostic.js": 9,
        "node-data-embedded.js": 19,
        "node-data-mbse.js": 7,
        "node-data-soa.js": 6,
        "node-data-calibration.js": 5,
    }
    for filename, version in bumps.items():
        text = re.sub(
            rf"(\./js/{re.escape(filename)}\?v=)\d+",
            rf"\g<1>{version}",
            text,
        )
    path.write_text(text, encoding="utf-8")


def main() -> None:
    rows = read_xlsx_rows()
    nodes_by_route = parse_nodes()
    courses_by_file = build_courses(rows, nodes_by_route)

    for filename, courses_map in courses_by_file.items():
        if not courses_map:
            continue
        patch_node_data_file(filename, courses_map)
        total = sum(len(items) for items in courses_map.values())
        print(f"{filename}: {len(courses_map)} nodes, {total} courses")

    patch_match_aliases()
    bump_index_versions()
    print("Done.")


if __name__ == "__main__":
    main()
