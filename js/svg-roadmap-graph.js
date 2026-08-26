/**
 * 图数据：routes / nodes
 * routes[T12] = { name, pathIds, desc }
 * nodes[n1]  = { name, routeIds, desc }
 * 路径写入 id / data-path-id / data-route-id，不写死 d
 */
(function (global) {
  var SVG_NS = "http://www.w3.org/2000/svg";

  var ROUTE_BADGE_RE = /^[A-Z]+\d+$/;

  function normalizeColor(value) {
    return String(value || "").trim().toLowerCase();
  }

  function parseHexColor(value) {
    var c = normalizeColor(value);
    if (!c || c.charAt(0) !== "#" || (c.length !== 4 && c.length !== 7)) return null;
    if (c.length === 4) {
      c = "#" + c.charAt(1) + c.charAt(1) + c.charAt(2) + c.charAt(2) + c.charAt(3) + c.charAt(3);
    }
    var n = parseInt(c.slice(1), 16);
    if (!isFinite(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, hex: c };
  }

  function colorDistance(a, b) {
    var ca = parseHexColor(a);
    var cb = parseHexColor(b);
    if (!ca || !cb) return Infinity;
    var dr = ca.r - cb.r;
    var dg = ca.g - cb.g;
    var db = ca.b - cb.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  function closestColor(target, colors, maxDist) {
    maxDist = maxDist == null ? 48 : maxDist;
    var best = null;
    var bestDist = Infinity;
    (colors || []).forEach(function (color) {
      var d = colorDistance(target, color);
      if (d < bestDist) {
        bestDist = d;
        best = color;
      }
    });
    return bestDist <= maxDist ? best : null;
  }

  function badgeLegendColor(badge) {
    if (!badge || !badge.el) return "";
    var parent = badge.el.parentNode;
    if (!parent) return "";
    var shape =
      parent.querySelector("circle[stroke], ellipse[stroke], path[stroke], circle, ellipse, path") ||
      null;
    if (!shape) return "";
    var stroke = shape.getAttribute("stroke");
    if (!stroke || stroke === "none") {
      try {
        stroke = window.getComputedStyle(shape).stroke;
      } catch (e) {
        stroke = "";
      }
    }
    var parsed = parseHexColor(stroke);
    if (parsed) return parsed.hex;
    // rgb()
    var m = String(stroke || "").match(/rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)/i);
    if (!m) return "";
    function hex(n) {
      var v = Math.max(0, Math.min(255, Math.round(Number(n))));
      return (v < 16 ? "0" : "") + v.toString(16);
    }
    return "#" + hex(m[1]) + hex(m[2]) + hex(m[3]);
  }

  function isRouteBadgeId(value) {
    return ROUTE_BADGE_RE.test(String(value || "").trim());
  }

  function getTextContent(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function parseMatrix(transform) {
    if (!transform) return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    var m = transform.match(/matrix\(([^)]+)\)/);
    if (!m) return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    var p = m[1].trim().split(/[\s,]+/).map(Number);
    if (p.length < 6) return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    return { a: p[0], b: p[1], c: p[2], d: p[3], e: p[4], f: p[5] };
  }

  function transformPoint(matrix, x, y) {
    return {
      x: matrix.a * x + matrix.c * y + matrix.e,
      y: matrix.b * x + matrix.d * y + matrix.f,
    };
  }

  function userCenter(el) {
    var bb = el.getBBox();
    var m = parseMatrix(el.getAttribute("transform"));
    return transformPoint(m, bb.x + bb.width / 2, bb.y + bb.height / 2);
  }

  function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function pathDistanceToPoint(path, point) {
    try {
      var len = path.getTotalLength();
      if (!len) return Infinity;
      var m = parseMatrix(path.getAttribute("transform"));
      var steps = Math.max(16, Math.ceil(len / 6));
      var min = Infinity;
      for (var i = 0; i <= steps; i += 1) {
        var p = path.getPointAtLength((len * i) / steps);
        var tp = transformPoint(m, p.x, p.y);
        var d = distance(tp, point);
        if (d < min) min = d;
      }
      return min;
    } catch (e) {
      return Infinity;
    }
  }

  function splitTspanFragments(textEl) {
    var m = parseMatrix(textEl.getAttribute("transform"));
    var fragments = [];
    Array.prototype.forEach.call(textEl.querySelectorAll("tspan"), function (tspan) {
      var raw = tspan.textContent || "";
      var chars = Array.from(raw);
      if (!chars.length) return;
      var xs = String(tspan.getAttribute("x") || "0")
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      var y = parseFloat(tspan.getAttribute("y") || "0");
      var groups = [];
      var current = { chars: [chars[0]], minX: xs[0] || 0, maxX: xs[0] || 0 };
      for (var i = 1; i < chars.length; i += 1) {
        var x = xs[i] != null ? xs[i] : current.maxX + 10;
        if (x - current.maxX > 36) {
          groups.push(current);
          current = { chars: [chars[i]], minX: x, maxX: x };
        } else {
          current.chars.push(chars[i]);
          current.maxX = x;
        }
      }
      groups.push(current);
      groups.forEach(function (g) {
        var title = g.chars.join("").replace(/\s+/g, " ").trim();
        if (!title || isRouteBadgeId(title)) return;
        fragments.push({
          title: title,
          el: textEl,
          x: transformPoint(m, g.minX, y).x,
          y: transformPoint(m, g.minX, y).y,
        });
      });
    });
    return fragments;
  }

  function collectLegendFragments(svg) {
    var list = [];
    svg.querySelectorAll("text").forEach(function (textEl) {
      var tf = textEl.getAttribute("transform") || "";
      if (!/matrix\(1[\s,]+0[\s,]+-?0[\s,]+1/.test(tf) && !/matrix\(1 /.test(tf)) return;
      var content = getTextContent(textEl);
      if (!content || isRouteBadgeId(content)) return;
      if (/工程师/.test(content) && content.length <= 8) return;
      var fontSize = parseFloat(textEl.getAttribute("font-size") || "0");
      if (fontSize && fontSize > 16) return;
      splitTspanFragments(textEl).forEach(function (frag) {
        list.push(frag);
      });
    });
    return list;
  }

  function collectBadgeTexts(svg) {
    var badges = [];
    svg.querySelectorAll("text").forEach(function (textEl) {
      // 跳过隐藏延伸层，避免抢走正式路线颜色
      if (textEl.closest && textEl.closest('#延申, #延伸, [display="none"], .st26')) return;
      try {
        var cs = window.getComputedStyle(textEl);
        if (cs && (cs.display === "none" || cs.visibility === "hidden")) return;
      } catch (e) {}
      var raw = getTextContent(textEl);
      if (!isRouteBadgeId(raw)) return;
      badges.push({
        id: raw,
        el: textEl,
        fontSize: parseFloat(textEl.getAttribute("font-size") || "0"),
        center: userCenter(textEl),
      });
    });
    return badges;
  }

  function collectColorSwatches(svg) {
    var swatches = [];
    var nodesLayer = svg.querySelector("g.nodes");
    svg.querySelectorAll("path[fill]").forEach(function (path) {
      var fill = normalizeColor(path.getAttribute("fill"));
      if (!fill || fill === "none" || fill === "#ffffff" || fill === "#fff") return;
      if (fill === "#6f7173" || fill === "#2c292a") return; // station stroke / text colors
      if (path.classList.contains("line-segment")) return;
      // Exclude anything already inside the nodes layer
      if (nodesLayer && nodesLayer.contains(path)) return;
      try {
        var bb = path.getBBox();
        var size = Math.max(bb.width, bb.height);
        // Legend swatches are small squares/circles; station fills are already #fff so excluded above.
        // Tighten upper bound to avoid grabbing large decorative fills.
        if (size < 6 || size > 40) return;
        swatches.push({
          el: path,
          color: fill,
          center: { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 },
        });
      } catch (e) {}
    });
    return swatches;
  }

  function sortSpatially(list) {
    return list.slice().sort(function (a, b) {
      return a.center.y - b.center.y || a.center.x - b.center.x;
    });
  }

  function orderedRouteColors(colorGroups) {
    return Object.keys(colorGroups).sort(function (a, b) {
      function groupCenter(color) {
        var path = colorGroups[color] && colorGroups[color][0];
        if (!path || !path.getBBox) return { x: 0, y: 0 };
        try {
          var bb = path.getBBox();
          return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
        } catch (e) {
          return { x: 0, y: 0 };
        }
      }
      var ca = groupCenter(a);
      var cb = groupCenter(b);
      return ca.y - cb.y || ca.x - cb.x;
    });
  }

  function nearestSwatch(badge, swatches) {
    var best = null;
    var bestDist = Infinity;
    swatches.forEach(function (sw) {
      var d = distance(badge.center, sw.center);
      if (d < bestDist) {
        bestDist = d;
        best = sw;
      }
    });
    // Tightened from 56 → 40 to avoid cross-matching distant swatches
    return bestDist < 40 ? best : null;
  }

  function nearestLabel(badge, fragments, used) {
    var best = null;
    var bestScore = Infinity;
    fragments.forEach(function (frag, index) {
      if (used[index]) return;
      var dx = frag.x - badge.center.x;
      var dy = Math.abs(frag.y - badge.center.y);
      if (dx < -12 || dx > 220 || dy > 24) return;
      var score = dy * 3 + dx;
      if (score < bestScore) {
        bestScore = score;
        best = { frag: frag, index: index };
      }
    });
    return best;
  }

  function collectHeaderCircles(svg) {
    var circles = [];
    var nodesLayer = svg.querySelector("g.nodes");
    svg.querySelectorAll("path[fill]").forEach(function (path) {
      var fill = normalizeColor(path.getAttribute("fill"));
      if (!fill || fill === "none" || fill === "#ffffff" || fill === "#fff") return;
      if (fill === "#6f7173" || fill === "#2c292a") return;
      if (path.classList.contains("line-segment")) return;
      if (nodesLayer && nodesLayer.contains(path)) return;
      try {
        var bb = path.getBBox();
        var size = Math.max(bb.width, bb.height);
        if (size < 35 || size > 72) return;
        circles.push({
          el: path,
          color: fill,
          center: { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 },
        });
      } catch (e) {}
    });
    return sortSpatially(circles);
  }

  function nearestHeaderCircle(badge, circles, used) {
    var best = null;
    var bestDist = Infinity;
    circles.forEach(function (circle) {
      if (used[circle.el]) return;
      var d = distance(badge.center, circle.center);
      if (d < bestDist) {
        bestDist = d;
        best = circle;
      }
    });
    return bestDist < 48 ? best : null;
  }

  function markRouteTriggers(routeId, elements) {
    elements.forEach(function (el) {
      if (!el) return;
      el.setAttribute("data-route-id", routeId);
      el.setAttribute("data-route", routeId);
      el.setAttribute("data-trigger-route", routeId);
      el.classList.add("legend-target");
    });
  }

  function addLegendHit(labelsLayer, routeId, elements, padding) {
    padding = padding || {};
    var padX = padding.x != null ? padding.x : 10;
    var padY = padding.y != null ? padding.y : 8;
    var boxes = [];
    elements.forEach(function (el) {
      if (!el || !el.getBBox) return;
      try {
        boxes.push(el.getBBox());
      } catch (e) {}
    });
    if (!boxes.length) return;
    var minX = boxes[0].x;
    var minY = boxes[0].y;
    var maxX = boxes[0].x + boxes[0].width;
    var maxY = boxes[0].y + boxes[0].height;
    boxes.forEach(function (bb) {
      minX = Math.min(minX, bb.x);
      minY = Math.min(minY, bb.y);
      maxX = Math.max(maxX, bb.x + bb.width);
      maxY = Math.max(maxY, bb.y + bb.height);
    });
    var hit = document.createElementNS(SVG_NS, "rect");
    hit.setAttribute("class", "legend-hit");
    hit.setAttribute("data-route-id", routeId);
    hit.setAttribute("data-route", routeId);
    hit.setAttribute("data-trigger-route", routeId);
    hit.setAttribute("x", String(minX - padX));
    hit.setAttribute("y", String(minY - padY));
    hit.setAttribute("width", String(Math.max(16, maxX - minX + padX * 2)));
    hit.setAttribute("height", String(Math.max(16, maxY - minY + padY * 2)));
    hit.setAttribute("fill", "transparent");
    labelsLayer.appendChild(hit);
  }

  function stationSamplePoints(station) {
    var bb = station.bbox;
    if (!bb) return [station.center];
    var cx = bb.x + bb.width / 2;
    var cy = bb.y + bb.height / 2;
    var points = [{ x: cx, y: cy }];
    if (!station.isJunction) return points;

    var hw = bb.width / 2;
    var hh = bb.height / 2;
    // 所有换乘站沿轮廓取样，避免只取中心漏掉上下/左右支线
    points.push(
      { x: cx, y: bb.y + Math.min(6, hh * 0.35) },
      { x: cx, y: bb.y + bb.height - Math.min(6, hh * 0.35) },
      { x: bb.x + Math.min(6, hw * 0.35), y: cy },
      { x: bb.x + bb.width - Math.min(6, hw * 0.35), y: cy },
      { x: cx, y: bb.y + bb.height * 0.33 },
      { x: cx, y: bb.y + bb.height * 0.66 }
    );

    // 高立柱：加密取样 + 右侧支线常见出口
    if (bb.height > 72) {
      points.push(
        { x: cx, y: bb.y + bb.height * 0.12 },
        { x: cx, y: bb.y + bb.height * 0.38 },
        { x: cx, y: bb.y + bb.height * 0.62 },
        { x: cx, y: bb.y + bb.height * 0.88 },
        { x: cx + 16, y: cy },
        { x: cx + 28, y: bb.y + bb.height * 0.22 },
        { x: cx + 28, y: bb.y + bb.height * 0.5 },
        { x: cx + 28, y: bb.y + bb.height * 0.78 },
        { x: cx - 12, y: cy }
      );
    }
    return points;
  }

  function stationRoundCap(station) {
    var el = station && station.el;
    if (!el || !el.querySelector) return null;
    var caps = el.querySelectorAll("circle, ellipse");
    for (var i = 0; i < caps.length; i += 1) {
      var cap = caps[i];
      var cls = cap.getAttribute("class") || "";
      if (/\bnode-ripple\b/.test(cls)) continue;
      if (cap.getAttribute("display") === "none") continue;
      try {
        var bb = cap.getBBox();
        if (!(bb.width > 0 || bb.height > 0)) continue;
        if (Math.max(bb.width, bb.height) > 28) continue;
        return { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
      } catch (e) {}
    }
    return null;
  }

  function routesForStation(station, routes, svg) {
    var bb = station.bbox || { width: 0, height: 0 };
    var tallJunction = !!(station.isJunction && bb.height > 72);
    var capsuleJunction =
      !!(station.isJunction && bb.height > 12 && bb.height <= 72 && bb.height >= bb.width * 1.15);
    // 高立柱才是多线枢纽；带圆点的短立柱只是单线站台，不能按整根柱子扫线
    var points = tallJunction
      ? stationSamplePoints(station)
      : [stationRoundCap(station) || station.center];
    var maxTol = tallJunction ? 28 : capsuleJunction && bb.height <= 24 ? 12 : 10;

    var scored = [];
    Object.keys(routes).forEach(function (rid) {
      var minD = Infinity;
      (routes[rid].pathIds || []).forEach(function (pid) {
        var path = svg.querySelector('[data-path-id="' + pid + '"]');
        if (!path) return;
        points.forEach(function (pt) {
          var d = pathDistanceToPoint(path, pt);
          if (d < minD) minD = d;
        });
      });
      if (minD <= maxTol) scored.push({ id: rid, dist: minD });
    });

    if (!scored.length) return [];
    scored.sort(function (a, b) {
      return a.dist - b.dist;
    });
    // 高立柱枢纽：落入容差的线路全部联动
    if (tallJunction) {
      return scored
        .filter(function (item) {
          return item.dist <= maxTol;
        })
        .map(function (item) {
          return item.id;
        });
    }
    // 矮换乘条（两线间距内）：允许最近的两三条
    if (capsuleJunction && bb.height <= 24) {
      var best = scored[0].dist;
      return scored
        .filter(function (item) {
          return item.dist <= best + 6;
        })
        .map(function (item) {
          return item.id;
        });
    }
    // 普通站点 / 单线站台立柱：只绑最近一条，避免把穿过立柱的无关线一起点亮
    return [scored[0].id];
  }

  function pathUserEndpoints(path) {
    try {
      var len = path.getTotalLength();
      if (!len) return null;
      var m = parseMatrix(path.getAttribute("transform"));
      var s = path.getPointAtLength(0);
      var e = path.getPointAtLength(len);
      return {
        start: transformPoint(m, s.x, s.y),
        end: transformPoint(m, e.x, e.y),
      };
    } catch (err) {
      return null;
    }
  }

  // 同一路线内统一知识流方向（左→右为主，竖段下→上）
  function orientRouteFlowDirection(flowEls) {
    if (!flowEls || flowEls.length < 2) {
      if (flowEls && flowEls[0]) {
        var alone = pathUserEndpoints(flowEls[0]);
        if (alone) {
          var adx = alone.end.x - alone.start.x;
          var ady = alone.end.y - alone.start.y;
          var reverseAlone =
            Math.abs(adx) >= Math.abs(ady) ? adx < 0 : ady > 0;
          flowEls[0].classList.toggle("flow-reverse", reverseAlone);
        }
      }
      return;
    }

    var items = [];
    flowEls.forEach(function (el) {
      var ep = pathUserEndpoints(el);
      if (!ep) return;
      items.push({ el: el, start: ep.start, end: ep.end });
    });
    if (!items.length) return;

    var tips = [];
    items.forEach(function (it, idx) {
      tips.push({ x: it.start.x, y: it.start.y, idx: idx, atStart: true });
      tips.push({ x: it.end.x, y: it.end.y, idx: idx, atStart: false });
    });
    tips.sort(function (a, b) {
      return a.x - b.x || b.y - a.y;
    });

    var used = {};
    var cur = { x: tips[0].x, y: tips[0].y };
    var guard = 0;
    while (Object.keys(used).length < items.length && guard < items.length + 2) {
      guard += 1;
      var bestIdx = -1;
      var bestDist = Infinity;
      var bestAtStart = true;
      items.forEach(function (it, idx) {
        if (used[idx]) return;
        var ds = distance(cur, it.start);
        var de = distance(cur, it.end);
        if (ds < bestDist) {
          bestDist = ds;
          bestIdx = idx;
          bestAtStart = true;
        }
        if (de < bestDist) {
          bestDist = de;
          bestIdx = idx;
          bestAtStart = false;
        }
      });
      if (bestIdx < 0) break;
      used[bestIdx] = true;
      var pick = items[bestIdx];
      // 从当前 tip 接到该段的 end → 该段方向与链式前进相反，需反转动画
      pick.el.classList.toggle("flow-reverse", !bestAtStart);
      cur = bestAtStart ? pick.end : pick.start;
    }
  }

  function svgPointFromClient(svg, clientX, clientY) {
    var p = svg.createSVGPoint();
    p.x = clientX;
    p.y = clientY;
    var ctm = svg.getScreenCTM();
    if (!ctm) return { x: clientX, y: clientY };
    return p.matrixTransform(ctm.inverse());
  }

  function elRectInSvg(svg, el) {
    var r = el.getBoundingClientRect();
    var a = svgPointFromClient(svg, r.left, r.top);
    var b = svgPointFromClient(svg, r.right, r.bottom);
    var x = Math.min(a.x, b.x);
    var y = Math.min(a.y, b.y);
    return {
      x: x,
      y: y,
      width: Math.abs(b.x - a.x),
      height: Math.abs(b.y - a.y),
    };
  }

  function rectCenter(rect) {
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }

  function distToRect(rect, point) {
    var x = Math.max(rect.x, Math.min(point.x, rect.x + rect.width));
    var y = Math.max(rect.y, Math.min(point.y, rect.y + rect.height));
    return distance(point, { x: x, y: y });
  }

  function aliasMinLength(alias) {
    // 中文站名常为 2–3 字（如「追溯性」「V模型」）
    return /[\u4e00-\u9fff]/.test(alias) ? 2 : 3;
  }

  function normalizeLabelText(value) {
    return String(value || "")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/g, "'")
      .replace(/[\u200b\u200c\u200d\ufeff]/g, "")
      .replace(/\s+/g, "")
      // AI 导出偶发康熙部首，归一成常用汉字
      .replace(/⻋/g, "车")
      .replace(/⼦/g, "子")
      .replace(/⾯/g, "面")
      .replace(/⽰/g, "示")
      .replace(/⼀/g, "一")
      .replace(/⼆/g, "二")
      .replace(/⼈/g, "人")
      .replace(/⼒/g, "力")
      .replace(/⽤/g, "用")
      .replace(/⽅/g, "方")
      .replace(/⽂/g, "文")
      .replace(/⽇/g, "日")
      .replace(/⽔/g, "水")
      .replace(/⽕/g, "火")
      .replace(/⽊/g, "木")
      .replace(/⾦/g, "金")
      .replace(/⼟/g, "土");
  }

  function labelAnchor(el, svg) {
    var tf = parseMatrix(el.getAttribute("transform"));
    // 斜向站名：用变换后的文字包围盒中心，避免锚在字串起点导致绑错站
    if (Math.abs(tf.b) > 0.05 || Math.abs(tf.c) > 0.05) {
      try {
        var bb = el.getBBox();
        return transformPoint(tf, bb.x + bb.width / 2, bb.y + bb.height / 2);
      } catch (e) {
        return { x: tf.e, y: tf.f };
      }
    }
    return rectCenter(elRectInSvg(svg, el));
  }

  function contentMatchesAlias(content, alias) {
    var a = normalizeLabelText(alias);
    var c = normalizeLabelText(content);
    if (!a || !c || a.length < aliasMinLength(a)) return false;
    if (c === a) return true;
    // 文案包含别名（如「诊断安全配置」含「安全配置」）
    if (c.indexOf(a) !== -1) return true;
    // 别名包含文案：仅允许几乎完整前缀，避免「诊断安全」误绑「诊断安全配置」
    if (a.indexOf(c) !== -1) {
      return c.length >= a.length - 1;
    }
    return false;
  }

  function findKnowledgeIdForText(content, nodeData, usedIds) {
    var best = null;
    Object.keys(nodeData || {}).forEach(function (id) {
      if (usedIds && usedIds[id]) return;
      var info = nodeData[id];
      if (!info || !String(info.description || "").trim()) return;
      var aliases = info.match && info.match.length ? info.match.slice() : [id];
      aliases.forEach(function (alias) {
        if (!contentMatchesAlias(content, alias)) return;
        var score = normalizeLabelText(alias).length;
        if (!best || score > best.score) best = { id: id, score: score };
      });
    });
    return best ? best.id : null;
  }

  function stationMatchLimit(station) {
    return station && station.isJunction ? 140 : 110;
  }

  function assignKnowledgeIds(svg, stations, labelNodes, nodeData) {
    var candidates = [];
    Object.keys(labelNodes).forEach(function (id) {
      var info = nodeData[id];
      if (!info || !(String(info.description || "").trim())) return;
      labelNodes[id].forEach(function (el, labelIndex) {
        var anchor = labelAnchor(el, svg);
        stations.forEach(function (station, index) {
          var score = distance(station.center, anchor);
          // 换乘枢纽范围大，强惩罚，避免抢走支线站名（如 DiVa）
          if (station.isJunction) {
            var h = (station.bbox && station.bbox.height) || 0;
            score += h > 72 ? 110 : 28;
          }
          // 「诊断/测试工具链」才对齐高立柱；ASR工具链是左侧支线站，不能抢枢纽
          if (
            /^(诊断工具链|测试工具链|Vector诊断工具链)$/.test(id) &&
            station.isJunction &&
            station.bbox &&
            station.bbox.height > 72
          ) {
            score -= 70;
          }
          var limit = stationMatchLimit(station);
          // 生成候选时放宽，正式分配仍由 take(1)/take(1.55) 收紧
          if (score > limit * 1.6) return;
          candidates.push({
            stationIndex: index,
            knowledgeId: id,
            score: score,
            labelKey: id + "#" + labelIndex,
            labelEl: el,
          });
        });
      });
    });

    candidates.sort(function (a, b) {
      return a.score - b.score || a.stationIndex - b.stationIndex;
    });

    function take(limitScale) {
      var usedStation = {};
      var usedLabel = {};
      var assignments = {};
      candidates.forEach(function (item) {
        var limit = stationMatchLimit(stations[item.stationIndex]);
        if (item.score > limit * limitScale) return;
        // 同一知识可绑多个站（如 OBDonUDS / ZEVonUDS 共用一条介绍）
        if (usedStation[item.stationIndex] || usedLabel[item.labelKey]) return;
        usedStation[item.stationIndex] = true;
        usedLabel[item.labelKey] = true;
        assignments[item.stationIndex] = {
          id: item.knowledgeId,
          labelEl: item.labelEl,
          labelKey: item.labelKey,
          score: item.score,
        };
      });
      return assignments;
    }

    // 交叉标签时贪心会绑反（如 CDD/Bootloader），成对交换使总距离下降
    function scoreLookup(labelKey, stationIndex) {
      for (var i = 0; i < candidates.length; i += 1) {
        var c = candidates[i];
        if (c.labelKey === labelKey && c.stationIndex === stationIndex) return c.score;
      }
      return Infinity;
    }

    function improveBySwaps(assignments) {
      var keys = Object.keys(assignments);
      var improved = true;
      while (improved) {
        improved = false;
        for (var i = 0; i < keys.length; i += 1) {
          for (var j = i + 1; j < keys.length; j += 1) {
            var si = Number(keys[i]);
            var sj = Number(keys[j]);
            var ai = assignments[si];
            var aj = assignments[sj];
            if (!ai || !aj) continue;
            var now = ai.score + aj.score;
            var swapA = scoreLookup(ai.labelKey, sj);
            var swapB = scoreLookup(aj.labelKey, si);
            if (!(swapA + swapB < now - 0.5)) continue;
            assignments[si] = {
              id: aj.id,
              labelEl: aj.labelEl,
              labelKey: aj.labelKey,
              score: swapB,
            };
            assignments[sj] = {
              id: ai.id,
              labelEl: ai.labelEl,
              labelKey: ai.labelKey,
              score: swapA,
            };
            improved = true;
          }
        }
      }
      return assignments;
    }

    var assignments = take(1);
    var usedLabel = {};
    Object.keys(assignments).forEach(function (index) {
      usedLabel[assignments[index].labelKey] = true;
    });
    var leftover = take(1.55);
    Object.keys(leftover).forEach(function (index) {
      if (assignments[index]) return;
      if (usedLabel[leftover[index].labelKey]) return;
      assignments[index] = leftover[index];
      usedLabel[leftover[index].labelKey] = true;
    });
    return improveBySwaps(assignments);
  }

  function attachStationTextLabels(svg, labelNodes, nodeData) {
    var root = svg.getElementById("站点文字");
    var texts = root
      ? root.querySelectorAll("text")
      : svg.querySelectorAll("g.labels text");
    Array.prototype.forEach.call(texts, function (textEl) {
      var content = normalizeLabelText(textEl.textContent);
      if (content.length < 2) return;
      var fontSize = parseFloat(textEl.getAttribute("font-size") || "0");
      if (fontSize > 18) return;
      var id = findKnowledgeIdForText(content, nodeData, null);
      if (!id) return;
      if (!labelNodes[id]) labelNodes[id] = [];
      if (labelNodes[id].indexOf(textEl) === -1) {
        labelNodes[id].push(textEl);
      }
    });
  }

  function attachMissingTextLabels(svg, labelNodes, nodeData) {
    // 新图优先用「站点文字」层；旧逻辑作补充
    attachStationTextLabels(svg, labelNodes, nodeData);

    var hardBound = {};
    Object.keys(labelNodes).forEach(function (id) {
      hardBound[id] = true;
    });
    svg.querySelectorAll("g.labels text").forEach(function (textEl) {
      // 跳过图例条带 / 标题，避免「诊断安全」等抢走站点知识 id
      if (textEl.closest && textEl.closest("#路线名, #标题, #延申")) return;
      var content = normalizeLabelText(textEl.textContent);
      if (content.length < 2) return;
      var fontSize = parseFloat(textEl.getAttribute("font-size") || "0");
      if (fontSize > 18) return;
      Object.keys(nodeData).forEach(function (id) {
        if (hardBound[id]) return;
        var info = nodeData[id];
        if (!info || !String(info.description || "").trim()) return;
        var aliases = info.match && info.match.length ? info.match.slice() : [id];
        aliases.sort(function (a, b) {
          return String(b).length - String(a).length;
        });
        var hit = aliases.some(function (alias) {
          return contentMatchesAlias(content, alias);
        });
        if (!hit) return;
        if (!labelNodes[id]) labelNodes[id] = [];
        if (labelNodes[id].indexOf(textEl) === -1) {
          labelNodes[id].push(textEl);
        }
      });
    });
  }

  function build(svg, options) {
    options = options || {};
    var nodeData = options.nodeData || {};
    var roadmapId = options.roadmapId || "";
    var presets = (global.ROUTE_PRESETS && global.ROUTE_PRESETS[roadmapId]) || {};
    var layers = global.SvgRoadmapLayers.restructure(svg);
    var flowLayer = layers.flowLines;
    var labelsLayer = layers.labels;
    // Always clear flow layer and stale path attributes before rebuilding
    while (flowLayer.firstChild) flowLayer.removeChild(flowLayer.firstChild);
    svg.querySelectorAll("[data-path-id]").forEach(function (el) {
      el.removeAttribute("data-path-id");
      el.removeAttribute("data-route-id");
      el.removeAttribute("data-route");
    });
    svg.querySelectorAll("[data-trigger-route]").forEach(function (el) {
      el.removeAttribute("data-trigger-route");
      el.classList.remove("legend-target", "legend-hit", "is-active", "is-dimmed");
    });

    var segments = Array.prototype.slice.call(svg.querySelectorAll("g.lines .line-segment"));
    // 近色合并（如 #89B33D / #89B43B），保证同色链路整段同属一条路线
    var colorGroups = {};
    segments.forEach(function (path) {
      var color = normalizeColor(path.getAttribute("stroke"));
      if (!color || color === "none") return;
      var key = null;
      Object.keys(colorGroups).some(function (existing) {
        if (colorDistance(existing, color) <= 36) {
          key = existing;
          return true;
        }
        return false;
      });
      if (!key) key = color;
      if (!colorGroups[key]) colorGroups[key] = [];
      colorGroups[key].push(path);
    });

    var badges = collectBadgeTexts(svg);
    var smallBadges = badges
      .filter(function (b) { return !b.fontSize || b.fontSize <= 14; })
      .sort(function (a, b) { return a.center.y - b.center.y || a.center.x - b.center.x; });
    var largeBadges = badges.filter(function (b) { return b.fontSize > 14; });
    var swatches = collectColorSwatches(svg);
    var orderedSwatches = sortSpatially(swatches);
    var fragments = collectLegendFragments(svg);
    var usedFrag = {};

    var routes = {};
    var usedColors = {};
    var pathCounter = 1;
    var spatialColors = orderedRouteColors(colorGroups);

    smallBadges.forEach(function (badge, badgeIndex) {
      if (routes[badge.id]) return;
      var preset = presets[badge.id] || {};
      var color = preset.color ? normalizeColor(preset.color) : null;
      var unusedSwatches = orderedSwatches.filter(function (sw) {
        return !usedColors[sw.color];
      });
      var unusedTrackColors = Object.keys(colorGroups).filter(function (c) {
        return !usedColors[c];
      });
      var swatch = null;

      // 1) 图例圆点描边色 → 最近轨道色（新 AI 图主路径）
      if (!color || !colorGroups[color] || usedColors[color]) {
        var legendColor = badgeLegendColor(badge);
        if (legendColor) {
          var matchedTrack = closestColor(legendColor, unusedTrackColors, 56);
          if (matchedTrack) color = matchedTrack;
        }
      }

      if (!color) {
        swatch = nearestSwatch(badge, unusedSwatches);
        if (!swatch && unusedSwatches.length) {
          swatch = unusedSwatches[Math.min(badgeIndex, unusedSwatches.length - 1)];
        }
        color = swatch ? swatch.color : null;
      } else if (colorGroups[color] && !usedColors[color]) {
        swatch = unusedSwatches.find(function (sw) {
          return sw.color === color;
        }) || null;
      } else {
        // preset / legend 色与轨道不完全一致时，模糊匹配
        color = closestColor(color, unusedTrackColors, 56) || color;
        swatch = unusedSwatches.find(function (sw) {
          return colorDistance(sw.color, color) <= 56;
        }) || null;
      }
      if (!color || !colorGroups[color] || usedColors[color]) {
        var unusedSpatialColors = spatialColors.filter(function (c) {
          return !usedColors[c];
        });
        if (unusedSpatialColors.length) {
          color = unusedSpatialColors[Math.min(badgeIndex, unusedSpatialColors.length - 1)];
        }
      }
      if (!color || !colorGroups[color] || usedColors[color]) return;
      if (!color || !colorGroups[color]) return;

      var matched = nearestLabel(badge, fragments, usedFrag);
      var title = badge.id;
      var legendEls = [];
      if (matched) {
        usedFrag[matched.index] = true;
        title = matched.frag.title;
        legendEls.push(matched.frag.el);
      }

      usedColors[color] = true;
      var segs = colorGroups[color].slice();
      (preset.colors || []).forEach(function (extraColor) {
        extraColor = normalizeColor(extraColor);
        if (!extraColor || extraColor === color) return;
        var unused = Object.keys(colorGroups).filter(function (c) {
          return !usedColors[c];
        });
        var matchedExtra = colorGroups[extraColor] && !usedColors[extraColor]
          ? extraColor
          : closestColor(extraColor, unused, 36);
        if (!matchedExtra || !colorGroups[matchedExtra] || usedColors[matchedExtra]) return;
        usedColors[matchedExtra] = true;
        segs = segs.concat(colorGroups[matchedExtra]);
      });
      // 再吸收未占用的极近色段，避免后半段落单
      Object.keys(colorGroups).forEach(function (other) {
        if (usedColors[other]) return;
        if (colorDistance(color, other) > 36) return;
        usedColors[other] = true;
        segs = segs.concat(colorGroups[other]);
      });
      var pathIds = [];
      var flowEls = [];

      segs.forEach(function (path) {
        var pathId = "p" + pathCounter;
        pathCounter += 1;
        path.setAttribute("id", pathId);
        path.setAttribute("data-path-id", pathId);
        path.setAttribute("data-route-id", badge.id);
        path.setAttribute("data-route", badge.id);
        pathIds.push(pathId);

        var clone = path.cloneNode(true);
        clone.setAttribute("id", "flow-" + pathId);
        clone.classList.remove("line-segment");
        clone.classList.add("flow-segment");
        clone.setAttribute("data-path-id", pathId);
        clone.setAttribute("data-route-id", badge.id);
        clone.setAttribute("data-route", badge.id);
        clone.setAttribute("stroke", path.getAttribute("stroke") || color);
        clone.setAttribute("fill", "none");
        flowLayer.appendChild(clone);
        flowEls.push(clone);
      });
      orientRouteFlowDirection(flowEls);

      var targets = [badge.el].concat(legendEls);
      largeBadges.forEach(function (lb) {
        if (lb.id === badge.id) targets.push(lb.el);
      });
      if (swatch) targets.push(swatch.el);
      targets.forEach(function (el) {
        el.setAttribute("data-route-id", badge.id);
        el.setAttribute("data-route", badge.id);
        el.setAttribute("data-trigger-route", badge.id);
        el.classList.add("legend-target");
      });
      addLegendHit(labelsLayer, badge.id, targets);

      routes[badge.id] = {
        name: preset.title || preset.name || title,
        pathIds: pathIds,
        desc: preset.desc || preset.description || ("本路线涵盖「" + (preset.title || title) + "」相关知识站点。"),
        color: normalizeColor((segs[0] && segs[0].getAttribute("stroke")) || color),
        nodeIds: [],
      };
    });

    Object.keys(colorGroups).forEach(function (color) {
      if (usedColors[color]) return;
      var autoId = "R-" + color.replace("#", "");
      var pathIds = [];
      var flowEls = [];
      colorGroups[color].forEach(function (path) {
        var pathId = "p" + pathCounter;
        pathCounter += 1;
        path.setAttribute("id", pathId);
        path.setAttribute("data-path-id", pathId);
        path.setAttribute("data-route-id", autoId);
        path.setAttribute("data-route", autoId);
        pathIds.push(pathId);
        var clone = path.cloneNode(true);
        clone.setAttribute("id", "flow-" + pathId);
        clone.classList.remove("line-segment");
        clone.classList.add("flow-segment");
        clone.setAttribute("data-path-id", pathId);
        clone.setAttribute("data-route-id", autoId);
        clone.setAttribute("data-route", autoId);
        clone.setAttribute("stroke", color);
        clone.setAttribute("fill", "none");
        flowLayer.appendChild(clone);
        flowEls.push(clone);
      });
      orientRouteFlowDirection(flowEls);
      routes[autoId] = {
        name: "路线",
        pathIds: pathIds,
        desc: "沿此颜色路径学习相关知识站点。",
        color: color,
        nodeIds: [],
      };
    });

    var labelNodes = {};
    svg.querySelectorAll("[data-node-id]").forEach(function (el) {
      if (el.closest && el.closest("#hover-hit-layer")) return;
      var id = el.getAttribute("data-node-id");
      if (!id || /^n\d+$/.test(id)) return;
      if (!labelNodes[id]) labelNodes[id] = [];
      labelNodes[id].push(el);
    });

    var nodes = {};
    var knowledgeAssignments = {};
    // 标定图新版同样有「站点文字」，走通用文字匹配（旧 svgIndex 与新站序已错位）
    attachMissingTextLabels(svg, labelNodes, nodeData);
    knowledgeAssignments = assignKnowledgeIds(svg, layers.stations, labelNodes, nodeData);

    // 仅当条目显式声明 svgIndex 且非标定图时，才按索引强绑
    if (roadmapId !== "calibration") {
      Object.keys(nodeData).forEach(function (id) {
        var info = nodeData[id];
        if (typeof info.svgIndex !== "number") return;
        var idx = info.svgIndex;
        if (idx < 0 || idx >= layers.stations.length) return;
        knowledgeAssignments[idx] = { id: id, labelEl: null, labelKey: id + "#svgIndex" };
      });
    }

    layers.stations.forEach(function (station, index) {
      var routeIds = routesForStation(station, routes, svg);
      var assignment = knowledgeAssignments[index];
      var knowledgeId = assignment ? assignment.id : null;

      var info = (knowledgeId && nodeData[knowledgeId]) || {};
      var desc = (info.description || "").trim();
      var nodeId = "n" + (index + 1);

      // 无文案的多线换乘枢纽仍可悬停，以便高亮全部相关链路
      if (!desc && station.isJunction && routeIds.length > 1) {
        desc = "此换乘站连接多条学习路线，悬停可查看全部相关链路。";
        info = {
          nodeName: "换乘枢纽",
          type: [],
          match: [],
          description: desc,
        };
        station.el.classList.add("node--junction-hub");
      }

      if (!desc) {
        station.el.classList.add("node--empty");
        var emptyHit = station.el.querySelector(".node-hit");
        if (emptyHit) emptyHit.remove();
        station.el.querySelectorAll(".node-ripple").forEach(function (ripple) {
          ripple.remove();
        });
        return;
      }

      var rawLabelEls = knowledgeId && labelNodes[knowledgeId] ? labelNodes[knowledgeId].slice() : [];
      rawLabelEls.forEach(function (el) {
        el.classList.add("node-label");
      });

      var node = {
        name: info.nodeName || knowledgeId || "知识站点",
        routeIds: routeIds,
        desc: desc,
        type: info.type || [],
        match: info.match || [],
        el: station.el,
        isJunction: !!station.isJunction,
        labelEl: assignment ? assignment.labelEl : null,
        labelEls: rawLabelEls,
      };

      station.el.setAttribute("data-node-id", nodeId);
      station.el.setAttribute("data-route-id", routeIds.join(" "));
      if (knowledgeId) station.el.setAttribute("data-node-key", knowledgeId);
      nodes[nodeId] = node;
      routeIds.forEach(function (rid) {
        if (routes[rid] && routes[rid].nodeIds.indexOf(nodeId) === -1) {
          routes[rid].nodeIds.push(nodeId);
        }
      });
    });

    global.ROADMAP_GRAPH = { routes: routes, nodes: nodes };
    return { routes: routes, nodes: nodes };
  }

  global.SvgRoadmapGraph = { build: build };
})(window);
