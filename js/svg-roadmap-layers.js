/**
 * SVG 图层重构
 * 顺序：g.lines → g.flow-lines → g.nodes → g.labels
 * 优先使用新图分组 id：背景 / 线路 / 站点 / 路线名 / 站点文字 / 标题
 */
(function (global) {
  var SVG_NS = "http://www.w3.org/2000/svg";

  function tagNameOf(el) {
    return String((el && el.tagName) || "").toLowerCase();
  }

  function createLayer(className) {
    var g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", className);
    return g;
  }

  function placePaintLayers(svg, lines, flowLines, nodes, labels) {
    svg.appendChild(lines);
    svg.appendChild(flowLines);
    svg.appendChild(nodes);
    svg.appendChild(labels);
  }

  function readCssNumber(value) {
    var n = parseFloat(value);
    return isFinite(n) ? n : 0;
  }

  function cssColorToHex(value) {
    var raw = String(value || "").trim().toLowerCase();
    if (!raw || raw === "none") return "";
    if (raw.charAt(0) === "#") {
      if (raw.length === 4) {
        return (
          "#" +
          raw.charAt(1) +
          raw.charAt(1) +
          raw.charAt(2) +
          raw.charAt(2) +
          raw.charAt(3) +
          raw.charAt(3)
        );
      }
      return raw;
    }
    var m = raw.match(/^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)/);
    if (!m) return raw;
    function hex(n) {
      var v = Math.max(0, Math.min(255, Math.round(Number(n))));
      return (v < 16 ? "0" : "") + v.toString(16);
    }
    return "#" + hex(m[1]) + hex(m[2]) + hex(m[3]);
  }

  function bakePresentation(el) {
    if (!el || !el.ownerSVGElement) return;
    var cs;
    try {
      cs = window.getComputedStyle(el);
    } catch (e) {
      return;
    }
    if (!cs) return;
    var stroke = cssColorToHex(cs.stroke);
    if (stroke && stroke !== "none" && !el.getAttribute("stroke")) {
      el.setAttribute("stroke", stroke);
    }
    var fill = cssColorToHex(cs.fill);
    if (fill && fill !== "none" && !el.getAttribute("fill")) {
      el.setAttribute("fill", fill);
    }
    var sw = readCssNumber(cs.strokeWidth);
    if (sw > 0 && !el.getAttribute("stroke-width")) {
      el.setAttribute("stroke-width", String(sw));
    }
  }

  function lineToPath(line) {
    var path = document.createElementNS(SVG_NS, "path");
    Array.prototype.forEach.call(line.attributes || [], function (attr) {
      if (attr.name === "x1" || attr.name === "y1" || attr.name === "x2" || attr.name === "y2") return;
      path.setAttribute(attr.name, attr.value);
    });
    var x1 = line.getAttribute("x1") || "0";
    var y1 = line.getAttribute("y1") || "0";
    var x2 = line.getAttribute("x2") || "0";
    var y2 = line.getAttribute("y2") || "0";
    path.setAttribute("d", "M" + x1 + "," + y1 + " L" + x2 + "," + y2);
    if (line.parentNode) line.parentNode.replaceChild(path, line);
    return path;
  }

  function looksLikeJunction(el, bb) {
    var d = (el && el.getAttribute && el.getAttribute("d")) || "";
    if (/V-?[0-9]{2,}/.test(d) || /v-?[0-9]{2,}/.test(d)) return true;
    var maxSide = Math.max(bb.width, bb.height);
    var minSide = Math.min(bb.width, bb.height) || 1;
    return maxSide > 20 && maxSide > minSide * 1.45;
  }

  function addRipple(wrap, geo, delayClass) {
    var ripple = document.createElementNS(SVG_NS, "circle");
    ripple.setAttribute("class", "node-ripple" + (delayClass ? " " + delayClass : ""));
    ripple.setAttribute("cx", String(geo.x));
    ripple.setAttribute("cy", String(geo.y));
    ripple.setAttribute("r", String(Math.max(5.5, geo.r)));
    ripple.setAttribute("fill", "none");
    ripple.setAttribute("stroke", "#4b67af");
    ripple.setAttribute("stroke-width", "1.2");
    ripple.setAttribute("opacity", "0");
    wrap.appendChild(ripple);
    return ripple;
  }

  function wrapStationParts(parts, nodesLayer, index) {
    // 在元素仍挂在原树时量几何，避免父层未入 SVG 时 getBBox 为 0
    var measureRoot = document.createElementNS(SVG_NS, "g");
    var host = (parts[0] && parts[0].ownerSVGElement) || nodesLayer.ownerSVGElement;
    if (host) host.appendChild(measureRoot);
    (parts || []).forEach(function (part) {
      if (part) measureRoot.appendChild(part);
    });

    var bb;
    try {
      bb = measureRoot.getBBox();
    } catch (e) {
      bb = { x: 0, y: 0, width: 12, height: 12 };
    }

    var wrap = document.createElementNS(SVG_NS, "g");
    wrap.setAttribute("class", "node");
    wrap.setAttribute("data-station-index", String(index));
    nodesLayer.appendChild(wrap);
    while (measureRoot.firstChild) {
      wrap.appendChild(measureRoot.firstChild);
    }
    if (measureRoot.parentNode) measureRoot.parentNode.removeChild(measureRoot);

    if (!bb.width && !bb.height) {
      try {
        bb = wrap.getBBox();
      } catch (e2) {
        bb = { x: 0, y: 0, width: 12, height: 12 };
      }
    }

    var geo = {
      x: bb.x + bb.width / 2,
      y: bb.y + bb.height / 2,
      r: Math.max(bb.width, bb.height) / 2,
    };

    var probe = parts && parts.length ? parts[0] : null;
    var isJunction = looksLikeJunction(probe, bb);
    if (isJunction) wrap.classList.add("node--junction");

    addRipple(wrap, geo, "");
    addRipple(wrap, geo, "node-ripple--delay");

    var pad = isJunction ? 12 : 11;
    var hit = document.createElementNS(SVG_NS, "rect");
    hit.setAttribute("class", "node-hit");
    hit.setAttribute("x", String(bb.x - pad));
    hit.setAttribute("y", String(bb.y - pad));
    hit.setAttribute("width", String(Math.max(bb.width + pad * 2, isJunction ? 22 : 18)));
    hit.setAttribute("height", String(Math.max(bb.height + pad * 2, isJunction ? 22 : 18)));
    hit.setAttribute("rx", String(Math.min(Math.max(bb.width, bb.height) / 2 + pad, isJunction ? 14 : 11)));
    hit.setAttribute("fill", "transparent");
    wrap.appendChild(hit);

    return {
      el: wrap,
      center: { x: geo.x, y: geo.y },
      radius: geo.r,
      bbox: { x: bb.x, y: bb.y, width: bb.width, height: bb.height },
      isJunction: isJunction,
    };
  }

  function moveTrackElements(trackLayer, linesLayer) {
    if (!trackLayer) return;
    var kids = Array.prototype.slice.call(trackLayer.querySelectorAll("path, line, polyline, polygon"));
    kids.forEach(function (el) {
      if (tagNameOf(el) === "line") el = lineToPath(el);
      bakePresentation(el);
      el.classList.add("line-segment");
      if (!el.getAttribute("fill")) el.setAttribute("fill", "none");
      linesLayer.appendChild(el);
    });
  }

  function isTransferRailPath(el) {
    if (tagNameOf(el) !== "path") return false;
    try {
      var bb = el.getBBox();
      return bb.height > 72 && bb.width < 28;
    } catch (e) {
      return false;
    }
  }

  function wrapStationsFromLayer(stationLayer, nodesLayer) {
    var stations = [];
    if (!stationLayer) return stations;
    var children = Array.prototype.filter.call(stationLayer.childNodes, function (child) {
      return child && child.nodeType === 1;
    });

    for (var i = 0; i < children.length; i += 1) {
      var child = children[i];
      if (!child.parentNode) continue;
      var tag = tagNameOf(child);

      if (tag === "g") {
        var inner = Array.prototype.slice.call(
          child.querySelectorAll("path, circle, ellipse, rect")
        );
        inner.forEach(bakePresentation);
        if (inner.length) {
          stations.push(wrapStationParts(inner, nodesLayer, stations.length));
        } else {
          stations.push(wrapStationParts([child], nodesLayer, stations.length));
        }
        continue;
      }

      if (tag === "circle" || tag === "ellipse") {
        var r = parseFloat(child.getAttribute("r") || child.getAttribute("rx") || "0");
        // 仅跳过极小装饰点；图中大量站点为 r=2.1
        if (r > 0 && r < 1.8) continue;
      }

      if (tag !== "circle" && tag !== "ellipse" && tag !== "path" && tag !== "rect") continue;

      bakePresentation(child);
      var parts = [child];

      // 高立柱换乘条 + 紧随的圆点/椭圆合并为一个换乘站
      if (isTransferRailPath(child)) {
        var next = children[i + 1];
        var nextTag = tagNameOf(next);
        if (next && (nextTag === "circle" || nextTag === "ellipse")) {
          bakePresentation(next);
          parts.push(next);
          i += 1;
        }
      }

      stations.push(wrapStationParts(parts, nodesLayer, stations.length));
    }
    return stations;
  }

  function findGroupById(svg, id) {
    if (!svg || !id) return null;
    if (svg.getElementById) {
      var byId = svg.getElementById(id);
      if (byId) return byId;
    }
    try {
      return svg.querySelector('[id="' + id + '"]');
    } catch (e) {
      return null;
    }
  }

  function moveLabelLayers(svg, labelsLayer, ids) {
    ids.forEach(function (id) {
      var layer = findGroupById(svg, id);
      if (!layer || labelsLayer.contains(layer)) return;
      labelsLayer.appendChild(layer);
    });
  }

  function hideTitleLogo(svg) {
    var title = findGroupById(svg, "标题");
    if (!title) return;
    Array.prototype.forEach.call(title.children, function (child) {
      if (tagNameOf(child) === "text") return;
      child.setAttribute("display", "none");
    });
  }

  function restructureGrouped(svg) {
    var trackLayer = findGroupById(svg, "线路");
    var stationLayer = findGroupById(svg, "站点");
    if (!trackLayer || !stationLayer) return null;

    var lines = createLayer("lines");
    var flowLines = createLayer("flow-lines");
    flowLines.setAttribute("pointer-events", "none");
    var nodes = createLayer("nodes");
    var labels = createLayer("labels");

    // 先挂到 SVG 再量 getBBox，否则命中区会落到 (0,0)
    placePaintLayers(svg, lines, flowLines, nodes, labels);

    moveTrackElements(trackLayer, lines);
    var stations = wrapStationsFromLayer(stationLayer, nodes);
    moveLabelLayers(svg, labels, ["路线名", "站点文字", "路线序号", "标题"]);
    hideTitleLogo(svg);

    var extendLayer = findGroupById(svg, "延申") || findGroupById(svg, "延伸");
    if (extendLayer) extendLayer.setAttribute("display", "none");

    // 再次保证绘制顺序：线路 → 流动 → 站点 → 文字
    placePaintLayers(svg, lines, flowLines, nodes, labels);
    svg.setAttribute("data-layers-ready", "1");
    svg.classList.add("roadmap-layered");

    return {
      lines: lines,
      flowLines: flowLines,
      nodes: nodes,
      labels: labels,
      stations: stations,
    };
  }

  function restructure(svg) {
    if (!svg) return null;
    if (svg.getAttribute("data-layers-ready") === "1") {
      var cachedStations = Array.prototype.map
        .call(svg.querySelectorAll("g.nodes > .node"), function (wrap) {
          var bb = wrap.getBBox();
          return {
            el: wrap,
            center: { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 },
            radius: Math.max(bb.width, bb.height) / 2,
            bbox: { x: bb.x, y: bb.y, width: bb.width, height: bb.height },
            isJunction: wrap.classList.contains("node--junction"),
            stationIndex: parseInt(wrap.getAttribute("data-station-index") || "0", 10),
          };
        })
        .sort(function (a, b) {
          return a.stationIndex - b.stationIndex;
        });
      return {
        lines: svg.querySelector("g.lines"),
        flowLines: svg.querySelector("g.flow-lines"),
        nodes: svg.querySelector("g.nodes"),
        labels: svg.querySelector("g.labels"),
        stations: cachedStations,
      };
    }

    var grouped = restructureGrouped(svg);
    if (grouped) return grouped;

    // 兜底：无分组时也保证线路在下、站点层在上
    var lines = createLayer("lines");
    var flowLines = createLayer("flow-lines");
    flowLines.setAttribute("pointer-events", "none");
    var nodes = createLayer("nodes");
    var labels = createLayer("labels");
    placePaintLayers(svg, lines, flowLines, nodes, labels);

    Array.prototype.forEach.call(svg.querySelectorAll("path, line"), function (el) {
      if (lines.contains(el) || nodes.contains(el) || labels.contains(el)) return;
      bakePresentation(el);
      var sw = parseFloat(el.getAttribute("stroke-width") || "0");
      var stroke = el.getAttribute("stroke");
      var fill = el.getAttribute("fill");
      if (sw >= 5 && stroke && (!fill || fill === "none")) {
        if (tagNameOf(el) === "line") el = lineToPath(el);
        el.classList.add("line-segment");
        lines.appendChild(el);
      }
    });

    svg.appendChild(nodes);
    svg.appendChild(labels);
    svg.setAttribute("data-layers-ready", "1");
    svg.classList.add("roadmap-layered");

    return {
      lines: lines,
      flowLines: flowLines,
      nodes: nodes,
      labels: labels,
      stations: [],
    };
  }

  global.SvgRoadmapLayers = { restructure: restructure };
})(window);
