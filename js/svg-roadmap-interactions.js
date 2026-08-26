/**
 * 路线悬浮高亮 + 知识流；节点/路线信息仅用悬浮 Tooltip
 */
(function (global) {
  function normalizeKeyword(value) {
    return String(value || "").replace(/\s+/g, "").toLowerCase();
  }

  function matchesQuery(query, text) {
    var q = String(query || "").trim();
    var t = String(text || "");
    if (!q || !t) return false;
    if (normalizeKeyword(t).indexOf(normalizeKeyword(q)) !== -1) return true;
    return t.toLowerCase().indexOf(q.toLowerCase()) !== -1;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function mount(options) {
    var stage = options.stage;
    var svg = options.svg;
    var panel = options.panel || null;
    var searchInput = options.searchInput || null;
    var searchResultsEl = options.searchResultsEl || null;
    var nodeData = options.nodeData || {};

    if (!stage || !svg || typeof SvgRoadmapGraph === "undefined") return null;

    var graph = SvgRoadmapGraph.build(svg, {
      roadmapId: options.roadmapId || "",
      nodeData: nodeData,
    });
    var routes = graph.routes;
    var nodes = graph.nodes;
    var roadmapId = options.roadmapId || "";
    var calibrationFallbackByStation = {};
    if (roadmapId === "calibration") {
      Object.keys(nodeData || {}).forEach(function (id) {
        var info = nodeData[id] || {};
        if (typeof info.svgIndex !== "number") return;
        calibrationFallbackByStation[String(info.svgIndex)] = {
          name: info.nodeName || id,
          desc: String(info.description || "").trim(),
          type: info.type || [],
        };
      });
    }

    var hoverRouteId = null;
    var hoverNodeId = null;
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var isMobileLayout = function () {
      return window.matchMedia("(max-width: 768px)").matches;
    };
    var isNarrow = function () {
      return window.matchMedia("(max-width: 480px)").matches;
    };

    var tooltip = document.createElement("div");
    tooltip.className = "node-tooltip";
    tooltip.innerHTML = [
      '<div class="node-tooltip__title"></div>',
      '<div class="node-tooltip__types"></div>',
      '<p class="node-tooltip__desc"></p>',
    ].join("");
    stage.appendChild(tooltip);
    tooltip.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    function renderPanel(title, desc, types) {
      if (!panel) return;
      if (!isMobileLayout()) {
        panel.hidden = true;
        return;
      }
      var typeList = types && types.length ? types : [];
      var hasContent = !!(title || desc || typeList.length);
      panel.hidden = false;
      panel.innerHTML =
        '<div class="info-panel__header">' +
          '<h3 class="info-panel__title">' +
            escapeHtml(title || "点击站点查看详情") +
          "</h3>" +
          '<button type="button" class="info-panel__close" aria-label="关闭详情">×</button>' +
        "</div>" +
        (typeList.length
          ? '<div class="info-panel__types">' +
              typeList.map(function (t) {
                return '<span class="info-panel__type">' + escapeHtml(t) + "</span>";
              }).join("") +
            "</div>"
          : "") +
        '<p class="info-panel__desc">' +
          escapeHtml(desc || "选择上方路线图中的站点，查看标签与说明。") +
        "</p>";
      var closeEl = panel.querySelector(".info-panel__close");
      if (closeEl) {
        closeEl.addEventListener("click", function (event) {
          event.stopPropagation();
          clearFocusState();
        });
      }
      panel.classList.toggle("is-empty", !hasContent);
    }

    function resetPanel() {
      if (!panel) return;
      if (!isMobileLayout()) {
        panel.hidden = true;
        return;
      }
      renderPanel("", "", []);
    }

    function resetSmartZoom(animate) {
      svg.style.transition =
        animate === false ? "none" : "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)";
      svg.style.transform = "";
      svg.style.transformOrigin = "0 0";
      stage.classList.remove("is-node-focused");
    }

    function smartZoomToNode(nodeEl) {
      if (!isMobileLayout() || !nodeEl) return;
      resetSmartZoom(false);
      void svg.getBoundingClientRect();

      var stageRect = stage.getBoundingClientRect();
      var svgRect = svg.getBoundingClientRect();
      var nodeRect = nodeEl.getBoundingClientRect();
      var nx = nodeRect.left + nodeRect.width / 2 - svgRect.left;
      var ny = nodeRect.top + nodeRect.height / 2 - svgRect.top;
      var targetX = stageRect.left + stageRect.width / 2 - svgRect.left;
      var targetY = stageRect.top + stageRect.height / 2 - svgRect.top;
      var scale = 2.35;
      var tx = targetX - nx * scale;
      var ty = targetY - ny * scale;

      svg.style.transformOrigin = "0 0";
      svg.style.transition = "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1)";
      svg.style.transform =
        "translate(" + tx.toFixed(2) + "px, " + ty.toFixed(2) + "px) scale(" + scale + ")";
      stage.classList.add("is-node-focused");
    }

    function clearFocusState() {
      hoverRouteId = null;
      hoverNodeId = null;
      clearNodeHover();
      hideTooltip();
      restoreVisual();
      resetSmartZoom(true);
      if (panel) resetPanel();
    }

    function pathIdsForRoutes(routeIds) {
      var seen = {};
      var out = [];
      (routeIds || []).forEach(function (rid) {
        var route = routes[rid];
        if (!route) return;
        (route.pathIds || []).forEach(function (pid) {
          if (seen[pid]) return;
          seen[pid] = true;
          out.push(pid);
        });
      });
      return out;
    }

    // 站点悬停：只高亮本站所属链路（高立柱换乘站才多条）；不做全图相关扩散
    function highlightNodeRoutes(routeIds, nodeEl) {
      var ownIds = (routeIds || []).filter(Boolean);
      var tallHub = false;
      if (nodeEl && nodeEl.getBBox) {
        try {
          var bb = nodeEl.getBBox();
          tallHub = !!(bb && bb.height > 72);
        } catch (e) {}
      }
      if (!tallHub && ownIds.length > 1) ownIds = ownIds.slice(0, 1);
      var paths = pathIdsForRoutes(ownIds);
      highlightPathIds(paths, paths);
    }

    // pathIds: 高亮并保留的链路；flowPathIds: 仅这些链路播放知识流（默认=全部高亮）
    function highlightPathIds(pathIds, flowPathIds) {
      var set = {};
      (pathIds || []).forEach(function (id) {
        set[id] = true;
      });
      var flowSet = {};
      var flowSrc = flowPathIds == null ? pathIds : flowPathIds;
      (flowSrc || []).forEach(function (id) {
        flowSet[id] = true;
      });
      var on = !!(pathIds && pathIds.length);
      svg.classList.toggle("is-route-locked", on);
      svg.classList.remove("is-node-route-focus");

      svg.querySelectorAll("g.lines .line-segment").forEach(function (path) {
        var pid = path.getAttribute("data-path-id");
        var active = on && !!set[pid];
        path.classList.toggle("is-active", active);
        path.classList.toggle("is-dimmed", on && !active);
        path.classList.toggle("active-flow", on && !!flowSet[pid]);
        var flowTwin = pid
          ? svg.querySelector('g.flow-lines .flow-segment[data-path-id="' + pid + '"]')
          : null;
        path.classList.toggle(
          "flow-reverse",
          !!(flowTwin && flowTwin.classList.contains("flow-reverse"))
        );
      });
      svg.querySelectorAll("g.flow-lines .flow-segment").forEach(function (path) {
        var pid = path.getAttribute("data-path-id");
        path.classList.toggle("active-flow", on && !!flowSet[pid]);
      });

      var activeRoutes = {};
      Object.keys(routes).forEach(function (rid) {
        activeRoutes[rid] = (routes[rid].pathIds || []).some(function (pid) {
          return set[pid];
        });
      });
      svg.querySelectorAll(".legend-target, .legend-hit").forEach(function (el) {
        var rid = el.getAttribute("data-route-id");
        var knownRoute = rid && routes[rid];
        el.classList.toggle("is-active", on && !!activeRoutes[rid]);
        el.classList.toggle("is-dimmed", on && !!knownRoute && !activeRoutes[rid]);
      });
      svg.querySelectorAll("g.nodes .node").forEach(function (el) {
        var ids = (el.getAttribute("data-route-id") || "").split(/\s+/).filter(Boolean);
        var hit = ids.some(function (id) {
          return activeRoutes[id];
        });
        el.classList.toggle("is-on-active-route", on && hit);
        el.classList.toggle("is-dimmed", on && !hit);
      });

      Object.keys(nodes).forEach(function (nodeId) {
        var node = nodes[nodeId];
        var hit = (node.routeIds || []).some(function (rid) {
          return activeRoutes[rid];
        });
        (node.labelEls || []).forEach(function (el) {
          el.classList.add("node-label");
          el.classList.toggle("is-active-route-label", on && hit);
          el.classList.toggle("is-dimmed-route-label", on && !hit);
        });
      });

      var stationTextRoot = svg.getElementById("站点文字");
      var textRoot = stationTextRoot || svg.querySelector("g.labels");
      if (textRoot) {
        textRoot.querySelectorAll("text").forEach(function (el) {
          if (el.closest && el.closest("#标题, #路线名")) return;
          el.classList.add("node-label");
          var rid = el.getAttribute("data-route-id");
          var activeByRoute = !!(rid && activeRoutes[rid]);
          var activeByClass = el.classList.contains("is-active-route-label");
          var active = on && (activeByRoute || activeByClass);
          if (on) {
            el.classList.toggle("is-active-route-label", active);
            el.classList.toggle("is-dimmed-route-label", !active);
          } else {
            el.classList.remove("is-active-route-label", "is-dimmed-route-label");
          }
        });
      }
    }

    function restoreVisual() {
      if (hoverRouteId && routes[hoverRouteId]) {
        highlightPathIds(routes[hoverRouteId].pathIds);
        return;
      }
      highlightPathIds([]);
    }

    function hideTooltip() {
      tooltip.classList.remove("is-visible");
    }

    function positionTooltip(anchorEl) {
      var pad = 10;
      var gap = 16;
      var vw = window.innerWidth || document.documentElement.clientWidth || 0;
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;

      tooltip.style.position = "fixed";

      if (isNarrow()) {
        tooltip.style.left = pad + "px";
        tooltip.style.right = pad + "px";
        tooltip.style.width = "auto";
        tooltip.style.top = "auto";
        tooltip.style.bottom =
          Math.max(pad, (window.visualViewport && window.visualViewport.offsetTop) || 0) + pad + "px";
        return;
      }

      var nodeWrap = anchorEl.closest ? anchorEl.closest(".node") : null;
      var hitEl = (nodeWrap && nodeWrap.querySelector(".node-hit")) || anchorEl;
      var nodeRect = hitEl.getBoundingClientRect();
      var nodeCx = nodeRect.left + nodeRect.width / 2;
      var nodeCy = nodeRect.top + nodeRect.height / 2;

      var nodeId = nodeWrap && nodeWrap.getAttribute("data-node-id");
      var nodeKey = nodeWrap && nodeWrap.getAttribute("data-node-key");
      var ownNode = (nodeId && nodes[nodeId]) || null;
      var ownLabels = (ownNode && ownNode.labelEls) || [];
      if (!ownLabels.length && nodeKey) {
        svg.querySelectorAll('[data-node-id="' + nodeKey + '"]').forEach(function (el) {
          ownLabels.push(el);
        });
      }

      // 本站站名合并框 + 相对圆点的方位（方案2）
      var ownLabelBox = null;
      var labelDx = 0;
      var labelDy = 0;
      ownLabels.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        if (!ownLabelBox) {
          ownLabelBox = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
        } else {
          ownLabelBox.left = Math.min(ownLabelBox.left, r.left);
          ownLabelBox.top = Math.min(ownLabelBox.top, r.top);
          ownLabelBox.right = Math.max(ownLabelBox.right, r.right);
          ownLabelBox.bottom = Math.max(ownLabelBox.bottom, r.bottom);
        }
      });
      if (ownLabelBox) {
        labelDx = (ownLabelBox.left + ownLabelBox.right) / 2 - nodeCx;
        labelDy = (ownLabelBox.top + ownLabelBox.bottom) / 2 - nodeCy;
        // 站名离圆点过远时不参与锚点（避免卡片被拉到角落）
        if (labelDx * labelDx + labelDy * labelDy > 90 * 90) {
          ownLabelBox = null;
          labelDx = 0;
          labelDy = 0;
        }
      }

      var tw = tooltip.offsetWidth || 280;
      var th = tooltip.offsetHeight || 80;
      var minLeft = pad;
      var maxLeft = Math.max(pad, vw - tw - pad);
      var minTop = pad;
      var maxTop = Math.max(pad, vh - th - pad);
      var maxNear = Math.max(tw, th) * 1.15 + 56;
      var stageRect = stage.getBoundingClientRect();
      var stageCx = stageRect.left + stageRect.width / 2;
      var stageCy = stageRect.top + stageRect.height * 0.42;

      function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
      }

      function intersectArea(a, b) {
        var x1 = Math.max(a.left, b.left);
        var y1 = Math.max(a.top, b.top);
        var x2 = Math.min(a.right, b.right);
        var y2 = Math.min(a.bottom, b.bottom);
        return x2 > x1 && y2 > y1 ? (x2 - x1) * (y2 - y1) : 0;
      }

      function inflate(r, m) {
        return {
          left: r.left - m,
          top: r.top - m,
          right: r.right + m,
          bottom: r.bottom + m,
        };
      }

      // 方案1：邻近障碍 = 本站名 + 同链路附近站名 + 附近高亮路径采样点
      var blockers = [];
      function addBlocker(rect, weight) {
        if (!rect || !(rect.right > rect.left) || !(rect.bottom > rect.top)) return;
        blockers.push({ rect: rect, weight: weight || 1 });
      }

      addBlocker(inflate(nodeRect, 6), 50);
      if (ownLabelBox) addBlocker(inflate(ownLabelBox, 8), 80);

      var nearLimit = 220;
      svg.querySelectorAll(
        "g.labels .node-label.is-active-route-label, g.labels #站点文字 text.is-active-route-label"
      ).forEach(function (el) {
        if (ownLabels.indexOf(el) !== -1) return;
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var cx = (r.left + r.right) / 2;
        var cy = (r.top + r.bottom) / 2;
        var dx = cx - nodeCx;
        var dy = cy - nodeCy;
        if (dx * dx + dy * dy > nearLimit * nearLimit) return;
        addBlocker(inflate(r, 4), 12);
      });

      svg.querySelectorAll("g.lines .line-segment.is-active").forEach(function (path) {
        try {
          var len = path.getTotalLength();
          if (!len) return;
          var steps = Math.max(8, Math.min(24, Math.ceil(len / 18)));
          var ctm = path.getScreenCTM();
          if (!ctm) return;
          for (var i = 0; i <= steps; i += 1) {
            var p = path.getPointAtLength((len * i) / steps);
            var sp = svg.createSVGPoint();
            sp.x = p.x;
            sp.y = p.y;
            var screen = sp.matrixTransform(ctm);
            var dx = screen.x - nodeCx;
            var dy = screen.y - nodeCy;
            if (dx * dx + dy * dy > nearLimit * nearLimit) continue;
            addBlocker(
              {
                left: screen.x - 5,
                top: screen.y - 5,
                right: screen.x + 5,
                bottom: screen.y + 5,
              },
              6
            );
          }
        } catch (e) {
          /* ignore path sample errors */
        }
      });

      // 优先放在节点朝向地图视觉中心的一侧，避免贴边；站名近时再避开同侧
      var toCx = stageCx - nodeCx;
      var toCy = stageCy - nodeCy;
      var sideOrder =
        Math.abs(toCx) >= Math.abs(toCy)
          ? toCx >= 0
            ? ["right", "bottom", "top", "left"]
            : ["left", "bottom", "top", "right"]
          : toCy >= 0
            ? ["bottom", "right", "left", "top"]
            : ["top", "right", "left", "bottom"];
      if (ownLabelBox) {
        if (Math.abs(labelDy) >= Math.abs(labelDx)) {
          if (labelDy >= 0) sideOrder = sideOrder.filter(function (s) { return s !== "bottom"; }).concat(["bottom"]);
          else sideOrder = sideOrder.filter(function (s) { return s !== "top"; }).concat(["top"]);
        } else {
          if (labelDx >= 0) sideOrder = sideOrder.filter(function (s) { return s !== "right"; }).concat(["right"]);
          else sideOrder = sideOrder.filter(function (s) { return s !== "left"; }).concat(["left"]);
        }
      }
      var sideRank = {};
      sideOrder.forEach(function (side, idx) {
        sideRank[side] = idx;
      });

      var anchor = {
        left: nodeRect.left,
        top: nodeRect.top,
        right: nodeRect.right,
        bottom: nodeRect.bottom,
      };
      if (ownLabelBox) {
        // 选位相对「圆点」，但间距按站名外缘再让一点，避免压住斜标签
        anchor = {
          left: Math.min(nodeRect.left, ownLabelBox.left),
          top: Math.min(nodeRect.top, ownLabelBox.top),
          right: Math.max(nodeRect.right, ownLabelBox.right),
          bottom: Math.max(nodeRect.bottom, ownLabelBox.bottom),
        };
      }

      var midX = nodeCx - tw / 2;
      var midY = nodeCy - th / 2;
      var sideMap = {
        top: { left: midX, top: anchor.top - th - gap, prefer: "top" },
        bottom: { left: midX, top: anchor.bottom + gap, prefer: "bottom" },
        left: { left: anchor.left - tw - gap, top: midY, prefer: "left" },
        right: { left: anchor.right + gap, top: midY, prefer: "right" },
      };
      var extras = [
        { left: anchor.right + gap, top: anchor.top - th - gap, prefer: "top" },
        { left: anchor.left - tw - gap, top: anchor.top - th - gap, prefer: "top" },
        { left: anchor.right + gap, top: anchor.bottom + gap, prefer: "bottom" },
        { left: anchor.left - tw - gap, top: anchor.bottom + gap, prefer: "bottom" },
      ];

      var raw = [];
      sideOrder.forEach(function (side) {
        if (sideMap[side]) raw.push(sideMap[side]);
      });
      extras.forEach(function (c) {
        raw.push(c);
      });

      function scoreCandidate(rawPos) {
        var left = clamp(rawPos.left, minLeft, maxLeft);
        var top = clamp(rawPos.top, minTop, maxTop);
        var box = { left: left, top: top, right: left + tw, bottom: top + th };
        var score = 0;

        blockers.forEach(function (b) {
          score += intersectArea(box, b.rect) * b.weight;
        });

        // 裁切到视口边缘的惩罚
        score += Math.abs(left - rawPos.left) * 16 + Math.abs(top - rawPos.top) * 16;

        // 必须待在节点附近，禁止飞远
        var bx = left + tw / 2;
        var by = top + th / 2;
        var dist = Math.sqrt((bx - nodeCx) * (bx - nodeCx) + (by - nodeCy) * (by - nodeCy));
        score += dist * 0.42;
        if (dist > maxNear) score += (dist - maxNear) * 10;

        // 靠近地图视觉中心，避免贴在角落
        score += Math.sqrt((bx - stageCx) * (bx - stageCx) + (by - stageCy) * (by - stageCy)) * 0.22;

        // 偏好方位：按站名对面排序加分（分数越低越好）
        score += (sideRank[rawPos.prefer] != null ? sideRank[rawPos.prefer] : 3) * 16;

        // 站名方位：若卡片仍落在站名同侧，加重惩罚
        if (ownLabelBox) {
          var cardCx = bx;
          var cardCy = by;
          if (Math.abs(labelDy) >= Math.abs(labelDx)) {
            if (labelDy >= 0 && cardCy > nodeCy) score += 120;
            if (labelDy < 0 && cardCy < nodeCy) score += 120;
          } else {
            if (labelDx >= 0 && cardCx > nodeCx) score += 120;
            if (labelDx < 0 && cardCx < nodeCx) score += 120;
          }
        }

        return { left: left, top: top, score: score };
      }

      var ranked = raw.map(scoreCandidate).sort(function (a, b) {
        return a.score - b.score;
      });
      var best = ranked[0] || {
        left: clamp(nodeCx - tw / 2, minLeft, maxLeft),
        top: clamp(nodeRect.top - th - gap, minTop, maxTop),
      };

      tooltip.style.right = "auto";
      tooltip.style.bottom = "auto";
      tooltip.style.width = "";
      tooltip.style.left = best.left + "px";
      tooltip.style.top = best.top + "px";
    }

    function showTooltip(title, desc, types, anchorEl) {
      if (panel && isMobileLayout()) {
        renderPanel(title, desc, types);
        return;
      }
      tooltip.querySelector(".node-tooltip__title").textContent = title || "";
      tooltip.querySelector(".node-tooltip__desc").textContent = desc || "";
      var typesEl = tooltip.querySelector(".node-tooltip__types");
      var typeList = types && types.length ? types : [];
      if (typeList.length) {
        typesEl.innerHTML = typeList
          .map(function (t) {
            return '<span class="node-tooltip__type">' + escapeHtml(t) + "</span>";
          })
          .join("");
        typesEl.hidden = false;
      } else {
        typesEl.innerHTML = "";
        typesEl.hidden = true;
      }
      tooltip.classList.add("is-visible");
      positionTooltip(anchorEl);
      requestAnimationFrame(function () {
        positionTooltip(anchorEl);
      });
    }

    function showRouteTooltip(routeId, anchorEl) {
      var route = routes[routeId];
      if (!route) return;
      showTooltip(route.name, route.desc, [], anchorEl);
    }

    function showNodeTooltip(nodeId, anchorEl) {
      var node = nodes[nodeId];
      if (!node) return;
      if (panel && isMobileLayout()) {
        renderPanel(node.name, node.desc, node.type || []);
        smartZoomToNode(anchorEl);
        return;
      }
      showTooltip(node.name, node.desc, node.type || [], anchorEl);
    }

    function showCalibrationFallback(nodeEl, anchorEl) {
      var stationIndex = nodeEl.getAttribute("data-station-index");
      var info = calibrationFallbackByStation[String(stationIndex)];
      if (!info || !info.desc) return false;
      if (panel && isMobileLayout()) {
        renderPanel(info.name, info.desc, info.type || []);
        smartZoomToNode(anchorEl || nodeEl);
        return true;
      }
      showTooltip(info.name, info.desc, info.type || [], anchorEl);
      return true;
    }

    function bindRouteHover(triggerEl) {
      if (!triggerEl) return;
      var routeId = triggerEl.getAttribute("data-trigger-route");
      if (!routeId || !routes[routeId]) return;

      if (canHover) {
        triggerEl.addEventListener("mouseenter", function () {
          hoverRouteId = routeId;
          restoreVisual();
          if (!hoverNodeId) showRouteTooltip(routeId, triggerEl);
        });

        triggerEl.addEventListener("mouseleave", function () {
          hoverRouteId = null;
          restoreVisual();
          if (!hoverNodeId) {
            hideTooltip();
            if (panel) resetPanel();
          }
        });
        return;
      }

      triggerEl.addEventListener("click", function (event) {
        event.stopPropagation();
        if (hoverRouteId === routeId) {
          hoverRouteId = null;
          restoreVisual();
          hideTooltip();
          if (panel) resetPanel();
          return;
        }
        hoverNodeId = null;
        hoverRouteId = routeId;
        restoreVisual();
        showRouteTooltip(routeId, triggerEl);
      });
    }

    svg.querySelectorAll("[data-trigger-route]").forEach(bindRouteHover);

    function clearNodeHover() {
      svg.querySelectorAll("g.nodes .node.is-hover").forEach(function (n) {
        n.classList.remove("is-hover");
      });
    }

    function bindNodeHover(nodeEl) {
      var hitEl = nodeEl.querySelector(".node-hit") || nodeEl;
      var useClick = !canHover || isMobileLayout();
      // 同时绑节点组与 hit，避免 hit 几何异常时圆点无法触发
      var targets = hitEl === nodeEl ? [nodeEl] : [nodeEl, hitEl];

      function onEnter() {
        var nodeId = nodeEl.getAttribute("data-node-id");
        var hasNode = !!nodes[nodeId];
        if (!hasNode && !(roadmapId === "calibration" && showCalibrationFallback(nodeEl, nodeEl))) return;
        var routeIds = hasNode ? (nodes[nodeId].routeIds || []) : [];
        hoverNodeId = nodeId;
        clearNodeHover();
        nodeEl.classList.add("is-hover");
        if (hasNode) {
          highlightNodeRoutes(routeIds, nodeEl);
          showNodeTooltip(nodeId, nodeEl);
        }
      }

      function onLeave(event) {
        var related = event && event.relatedTarget;
        if (related && nodeEl.contains(related)) return;
        nodeEl.classList.remove("is-hover");
        hoverNodeId = null;
        hideTooltip();
        restoreVisual();
        resetSmartZoom(true);
        if (hoverRouteId && routes[hoverRouteId]) {
          var trigger = svg.querySelector('[data-trigger-route="' + hoverRouteId + '"]');
          if (trigger) showRouteTooltip(hoverRouteId, trigger);
        } else if (panel) {
          resetPanel();
        }
      }

      if (!useClick) {
        targets.forEach(function (el) {
          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);
        });
        return;
      }

      targets.forEach(function (el) {
        el.addEventListener("click", function (event) {
          event.stopPropagation();
          var nodeId = nodeEl.getAttribute("data-node-id");
          if (!nodes[nodeId] && !(roadmapId === "calibration" && showCalibrationFallback(nodeEl, nodeEl))) return;
          if (hoverNodeId === nodeId) {
            clearFocusState();
            return;
          }
          var routeIds = nodes[nodeId] ? (nodes[nodeId].routeIds || []) : [];
          hoverNodeId = nodeId;
          clearNodeHover();
          nodeEl.classList.add("is-hover");
          if (nodes[nodeId]) {
            highlightNodeRoutes(routeIds, nodeEl);
            showNodeTooltip(nodeId, nodeEl);
          }
        });
      });
    }

    var nodeSelector = roadmapId === "calibration"
      ? "g.nodes .node"
      : "g.nodes .node:not(.node--empty)";
    svg.querySelectorAll(nodeSelector).forEach(bindNodeHover);

    function isInteractiveTarget(target) {
      return !!(
        target &&
        target.closest &&
        target.closest(".node, .node-hit, .legend-hit, .legend-target, [data-trigger-route], .node-tooltip")
      );
    }

    function clearHoverIfBlank(target) {
      if (isInteractiveTarget(target)) return;
      if (!hoverNodeId && !hoverRouteId && !tooltip.classList.contains("is-visible")) return;
      hoverNodeId = null;
      hoverRouteId = null;
      clearNodeHover();
      hideTooltip();
      restoreVisual();
      if (panel && isMobileLayout()) resetPanel();
    }

    svg.addEventListener("mousemove", function (event) {
      if (!canHover || isMobileLayout()) return;
      clearHoverIfBlank(event.target);
    });

    stage.addEventListener("mouseleave", function () {
      if (!canHover || isMobileLayout()) return;
      clearHoverIfBlank(null);
    });

    svg.addEventListener("click", function (event) {
      if (canHover && !isMobileLayout()) return;
      var target = event.target;
      if (
        target.closest &&
        target.closest(".node, .node-hit, .legend-hit, .legend-target, [data-trigger-route]")
      ) {
        return;
      }
      clearFocusState();
    });

    if (panel && isMobileLayout()) {
      resetPanel();
    }

    function clearSearch() {
      if (searchResultsEl) {
        searchResultsEl.hidden = true;
        searchResultsEl.innerHTML = "";
      }
    }

    function renderSearchResults(keyword, matched) {
      if (!searchResultsEl) return;
      var q = String(keyword || "").trim();
      if (!q) {
        clearSearch();
        return;
      }

      if (!matched.length) {
        searchResultsEl.hidden = false;
        searchResultsEl.innerHTML = '<p class="roadmap-search-results__empty">未找到匹配站点</p>';
        return;
      }

      function highlightMatch(text, keyword) {
        var t = String(text || "");
        var k = String(keyword || "");
        if (!k) return escapeHtml(t);
        var idx = t.toLowerCase().indexOf(k.toLowerCase());
        if (idx === -1) return escapeHtml(t);
        return (
          escapeHtml(t.slice(0, idx)) +
          '<mark class="search-highlight">' +
          escapeHtml(t.slice(idx, idx + k.length)) +
          "</mark>" +
          escapeHtml(t.slice(idx + k.length))
        );
      }

      var html = ['<ul class="roadmap-search-list">'];
      matched.forEach(function (item) {
        html.push(
          '<li class="roadmap-search-list__item" data-node-id="' +
            escapeHtml(item.id) +
            '">' +
            highlightMatch(item.name, q) +
            "</li>"
        );
      });
      html.push("</ul>");
      searchResultsEl.hidden = false;
      searchResultsEl.innerHTML = html.join("");

      searchResultsEl.querySelectorAll(".roadmap-search-list__item").forEach(function (el) {
        el.addEventListener("click", function () {
          var nodeId = el.getAttribute("data-node-id");
          var nodeEl = svg.querySelector('g.nodes .node[data-node-id="' + nodeId + '"]');
          // Close search dropdown first
          clearSearch();
          if (searchInput) searchInput.value = "";
          if (nodeEl && nodes[nodeId]) {
            var routeIds = nodes[nodeId].routeIds || [];
            hoverNodeId = nodeId;
            clearNodeHover();
            nodeEl.classList.add("is-hover");
            highlightNodeRoutes(routeIds, nodeEl);
            showNodeTooltip(nodeId, nodeEl);
          }
        });
      });
    }

    function runSearch(keyword) {
      clearSearch();
      var q = String(keyword || "").trim();
      if (!q) return;

      var matched = [];
      Object.keys(nodes).forEach(function (id) {
        var node = nodes[id];
        var fields = [node.name];
        if (fields.some(function (f) { return matchesQuery(q, f); })) {
          matched.push({ id: id, name: node.name, desc: node.desc });
        }
      });

      matched.sort(function (a, b) {
        return String(a.name).localeCompare(String(b.name), "zh-CN");
      });

      renderSearchResults(q, matched);
    }

    var searchTimer = null;
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(function () {
          runSearch(searchInput.value);
        }, 180);
      });
      searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          searchInput.value = "";
          clearSearch();
          hoverNodeId = null;
          hoverRouteId = null;
          hideTooltip();
          if (typeof clearNodeHover === "function") clearNodeHover();
          restoreVisual();
        }
      });
      // Close dropdown when clicking outside the search wrap
      document.addEventListener("click", function (event) {
        if (!searchResultsEl) return;
        var wrap = searchInput.closest(".roadmap-search-wrap") || searchInput.parentNode;
        if (wrap && !wrap.contains(event.target)) {
          clearSearch();
          searchInput.value = "";
        }
      });
    }

    return {
      graph: graph,
      destroy: function () {
        clearSearch();
        hoverNodeId = null;
        hoverRouteId = null;
        hideTooltip();
        clearNodeHover();
        resetSmartZoom(false);
        if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
        restoreVisual();
        if (panel) {
          panel.hidden = true;
          resetPanel();
        }
      },
    };
  }

  global.SvgRoadmapInteractions = { mount: mount };
})(window);
