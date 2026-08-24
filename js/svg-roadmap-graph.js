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
    if (station.isJunction) {
      points.push(
        { x: cx, y: bb.y + bb.height * 0.12 },
        { x: cx, y: bb.y + bb.height * 0.38 },
        { x: cx, y: bb.y + bb.height * 0.62 },
        { x: cx, y: bb.y + bb.height * 0.88 }
      );
    }
    return points;
  }

  function routesForStation(station, routes, svg) {
    var points = stationSamplePoints(station);
    var tol = station.isJunction ? 26 : 16;
    var routeIds = [];
    Object.keys(routes).forEach(function (rid) {
      var hit = (routes[rid].pathIds || []).some(function (pid) {
        var path = svg.querySelector('[data-path-id="' + pid + '"]');
        if (!path) return false;
        return points.some(function (pt) {
          return pathDistanceToPoint(path, pt) <= tol;
        });
      });
      if (hit) routeIds.push(rid);
    });
    if (!routeIds.length) {
      var best = { id: null, dist: Infinity };
      Object.keys(routes).forEach(function (rid) {
        points.forEach(function (pt) {
          (routes[rid].pathIds || []).forEach(function (pid) {
            var path = svg.querySelector('[data-path-id="' + pid + '"]');
            if (!path) return;
            var d = pathDistanceToPoint(path, pt);
            if (d < best.dist) best = { id: rid, dist: d };
          });
        });
      });
      if (best.id && best.dist <= (station.isJunction ? 36 : 28)) routeIds.push(best.id);
    }
    return routeIds;
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

  function assignKnowledgeIds(svg, stations, labelNodes, nodeData) {
    var stationRects = stations.map(function (station) {
      return elRectInSvg(svg, station.el);
    });

    var candidates = [];
    Object.keys(labelNodes).forEach(function (id) {
      var info = nodeData[id];
      if (!info || !(String(info.description || "").trim())) return;
      labelNodes[id].forEach(function (el, labelIndex) {
        var labelRect = elRectInSvg(svg, el);
        var anchor = rectCenter(labelRect);
        stationRects.forEach(function (rect, index) {
          var score = distToRect(rect, anchor);
          var limit = stations[index].isJunction ? 92 : 70;
          if (score > limit) return;
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
        var limit = stations[item.stationIndex].isJunction ? 92 : 70;
        if (item.score > limit * limitScale) return;
        if (usedStation[item.stationIndex] || usedLabel[item.labelKey]) return;
        usedStation[item.stationIndex] = true;
        usedLabel[item.labelKey] = true;
        assignments[item.stationIndex] = {
          id: item.knowledgeId,
          labelEl: item.labelEl,
          labelKey: item.labelKey,
        };
      });
      return assignments;
    }

    var assignments = take(1);
    var usedLabel = {};
    Object.keys(assignments).forEach(function (index) {
      usedLabel[assignments[index].labelKey] = true;
    });
    var leftover = take(1.45);
    Object.keys(leftover).forEach(function (index) {
      if (assignments[index]) return;
      if (usedLabel[leftover[index].labelKey]) return;
      assignments[index] = leftover[index];
      usedLabel[leftover[index].labelKey] = true;
    });
    return assignments;
  }

  function attachMissingTextLabels(svg, labelNodes, nodeData) {
    // ids already bound via data-node-id attribute — skip those entirely
    var hardBound = {};
    Object.keys(labelNodes).forEach(function (id) {
      hardBound[id] = true;
    });
    svg.querySelectorAll("g.labels text").forEach(function (textEl) {
      var content = (textEl.textContent || "").replace(/\s+/g, "");
      if (content.length < 2) return;
      var fontSize = parseFloat(textEl.getAttribute("font-size") || "0");
      if (fontSize > 16) return;
      // A single text element may contain labels for many nodes (aggregated text).
      // Allow multiple node ids to share the same text element so that
      // assignKnowledgeIds can later pick the closest station by geometry.
      Object.keys(nodeData).forEach(function (id) {
        if (hardBound[id]) return;
        var info = nodeData[id];
        if (!info || !String(info.description || "").trim()) return;
        var aliases = (info.match && info.match.length ? info.match.slice() : [id]);
        aliases.sort(function (a, b) {
          return String(b).length - String(a).length;
        });
        var hit = aliases.some(function (alias) {
          var a = String(alias || "").replace(/\s+/g, "");
          return a.length >= 4 && content.indexOf(a) !== -1;
        });
        if (!hit) return;
        if (!labelNodes[id]) labelNodes[id] = [];
        // avoid duplicate entries for the same text element
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
    var colorGroups = {};
    segments.forEach(function (path) {
      var color = normalizeColor(path.getAttribute("stroke"));
      if (!colorGroups[color]) colorGroups[color] = [];
      colorGroups[color].push(path);
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
      var swatch = null;
      if (!color) {
        swatch = nearestSwatch(badge, unusedSwatches);
        if (!swatch && unusedSwatches.length) {
          swatch = unusedSwatches[Math.min(badgeIndex, unusedSwatches.length - 1)];
        }
        color = swatch ? swatch.color : null;
      } else {
        swatch = unusedSwatches.find(function (sw) {
          return sw.color === color;
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
      var segs = colorGroups[color];
      var pathIds = [];

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
        clone.setAttribute("stroke", color);
        clone.setAttribute("fill", "none");
        flowLayer.appendChild(clone);
      });

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
      });
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
      var id = el.getAttribute("data-node-id");
      if (!id || /^n\d+$/.test(id)) return;
      if (!labelNodes[id]) labelNodes[id] = [];
      labelNodes[id].push(el);
    });

    var nodes = {};
    var knowledgeAssignments = {};
    var useDirectSvgIndex = roadmapId === "calibration";
    if (!useDirectSvgIndex) {
      attachMissingTextLabels(svg, labelNodes, nodeData);
      knowledgeAssignments = assignKnowledgeIds(svg, layers.stations, labelNodes, nodeData);
    }

    // For node data entries that specify svgIndex, assign them directly by station index.
    // This handles SVGs where node labels are aggregated into a single text element
    // and should bypass generic text matching (e.g. calibration roadmap).
    Object.keys(nodeData).forEach(function (id) {
      var info = nodeData[id];
      if (typeof info.svgIndex !== "number") return;
      var idx = info.svgIndex;
      if (idx < 0 || idx >= layers.stations.length) return;
      knowledgeAssignments[idx] = { id: id, labelEl: null, labelKey: id + "#svgIndex" };
    });

    layers.stations.forEach(function (station, index) {
      var routeIds = routesForStation(station, routes, svg);
      var assignment = knowledgeAssignments[index];
      var knowledgeId = assignment ? assignment.id : null;

      var info = (knowledgeId && nodeData[knowledgeId]) || {};
      var desc = (info.description || "").trim();
      if (!desc) {
        station.el.classList.add("node--empty");
        var emptyHit = station.el.querySelector(".node-hit");
        if (emptyHit) emptyHit.remove();
        station.el.querySelectorAll(".node-ripple").forEach(function (ripple) {
          ripple.remove();
        });
        return;
      }

      var nodeId = "n" + (index + 1);
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
