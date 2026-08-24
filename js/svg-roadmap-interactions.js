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
      var typeList = types && types.length ? types : [];
      var hasContent = !!(title || desc || typeList.length);
      var closeBtn = isMobileLayout()
        ? '<button type="button" class="info-panel__close" aria-label="关闭详情">×</button>'
        : "";
      panel.hidden = false;
      panel.innerHTML =
        '<div class="info-panel__header">' +
          '<h3 class="info-panel__title">' +
            escapeHtml(title || (isMobileLayout() ? "点击站点查看详情" : "请选择路线或站点")) +
          "</h3>" +
          closeBtn +
        "</div>" +
        (typeList.length
          ? '<div class="info-panel__types">' +
              typeList.map(function (t) {
                return '<span class="info-panel__type">' + escapeHtml(t) + "</span>";
              }).join("") +
            "</div>"
          : "") +
        '<p class="info-panel__desc">' +
          escapeHtml(
            desc ||
              (isMobileLayout()
                ? "选择上方路线图中的站点，查看标签与说明。"
                : "悬停或点击左侧查看详情。")
          ) +
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

    function highlightPathIds(pathIds) {
      var set = {};
      (pathIds || []).forEach(function (id) {
        set[id] = true;
      });
      var on = !!(pathIds && pathIds.length);
      svg.classList.toggle("is-route-locked", on);

      svg.querySelectorAll("g.lines .line-segment").forEach(function (path) {
        var pid = path.getAttribute("data-path-id");
        var active = on && !!set[pid];
        path.classList.toggle("is-active", active);
        path.classList.toggle("is-dimmed", on && !active);
        path.classList.toggle("active-flow", active);
      });
      svg.querySelectorAll("g.flow-lines .flow-segment").forEach(function (path) {
        var pid = path.getAttribute("data-path-id");
        path.classList.toggle("active-flow", on && !!set[pid]);
      });

      var activeRoutes = {};
      Object.keys(routes).forEach(function (rid) {
        activeRoutes[rid] = (routes[rid].pathIds || []).some(function (pid) {
          return set[pid];
        });
      });
      svg.querySelectorAll(".legend-target, .legend-hit").forEach(function (el) {
        var rid = el.getAttribute("data-route-id");
        // Only dim elements that belong to a known route but not the active one.
        // Elements without a valid route-id (e.g. title text) must never be dimmed.
        var knownRoute = rid && routes[rid];
        el.classList.toggle("is-active", on && !!activeRoutes[rid]);
        el.classList.toggle("is-dimmed", on && !!knownRoute && !activeRoutes[rid]);
      });
      svg.querySelectorAll("g.nodes .node").forEach(function (el) {
        var ids = (el.getAttribute("data-route-id") || "").split(/\s+/).filter(Boolean);
        var hit = ids.some(function (id) { return activeRoutes[id]; });
        el.classList.toggle("is-on-active-route", on && hit);
        el.classList.toggle("is-dimmed", on && !hit);
      });

      Object.keys(nodes).forEach(function (nodeId) {
        var node = nodes[nodeId];
        var hit = (node.routeIds || []).some(function (rid) {
          return activeRoutes[rid];
        });
        (node.labelEls || []).forEach(function (el) {
          el.classList.toggle("is-active-route-label", on && hit);
          el.classList.toggle("is-dimmed-route-label", on && !hit);
        });
      });
    }

    function restoreVisual() {
      if (hoverRouteId && routes[hoverRouteId]) {
        highlightPathIds(routes[hoverRouteId].pathIds);
        return;
      }
      highlightPathIds([]);
    }

    function hideTooltip() {
      if (panel) return;
      tooltip.classList.remove("is-visible");
    }

    function positionTooltip(anchorEl) {
      var stageRect = stage.getBoundingClientRect();
      var pad = 8;

      if (isNarrow()) {
        tooltip.style.left = pad + "px";
        tooltip.style.right = pad + "px";
        tooltip.style.width = "auto";
        tooltip.style.top = "auto";
        tooltip.style.bottom = pad + "px";
        return;
      }

      var nodeRect = anchorEl.getBoundingClientRect();
      var tw = tooltip.offsetWidth || 280;
      var th = tooltip.offsetHeight || 80;

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

      function candidateRect(left, top) {
        return {
          left: left,
          top: top,
          right: left + tw,
          bottom: top + th,
        };
      }

      function scoreCandidate(left, top) {
        var rect = candidateRect(left, top);
        var score = 0;
        var stageBox = {
          left: 0,
          top: 0,
          right: stageRect.width,
          bottom: stageRect.height,
        };
        var outside = 0;
        if (rect.left < stageBox.left) outside += (stageBox.left - rect.left) * th;
        if (rect.top < stageBox.top) outside += (stageBox.top - rect.top) * tw;
        if (rect.right > stageBox.right) outside += (rect.right - stageBox.right) * th;
        if (rect.bottom > stageBox.bottom) outside += (rect.bottom - stageBox.bottom) * tw;
        score += outside * 10;

        var blockers = svg.querySelectorAll("g.nodes .node, g.labels text");
        blockers.forEach(function (el) {
          if (anchorEl === el || (anchorEl.closest && anchorEl.closest(".node") === el)) return;
          var r = el.getBoundingClientRect();
          var local = {
            left: r.left - stageRect.left,
            top: r.top - stageRect.top,
            right: r.right - stageRect.left,
            bottom: r.bottom - stageRect.top,
          };
          score += intersectArea(rect, local);
        });

        var cx = nodeRect.left - stageRect.left + nodeRect.width / 2;
        var cy = nodeRect.top - stageRect.top + nodeRect.height / 2;
        var rx = left + tw / 2;
        var ry = top + th / 2;
        var dx = rx - cx;
        var dy = ry - cy;
        score += Math.sqrt(dx * dx + dy * dy) * 0.25;
        return {
          left: clamp(left, pad, Math.max(pad, stageRect.width - tw - pad)),
          top: clamp(top, pad, Math.max(pad, stageRect.height - th - pad)),
          score: score,
        };
      }

      var candidates = [
        scoreCandidate(nodeRect.right - stageRect.left + 12, nodeRect.top - stageRect.top - 8),
        scoreCandidate(nodeRect.left - stageRect.left - tw - 12, nodeRect.top - stageRect.top - 8),
        scoreCandidate(nodeRect.left - stageRect.left + nodeRect.width / 2 - tw / 2, nodeRect.top - stageRect.top - th - 12),
        scoreCandidate(nodeRect.left - stageRect.left + nodeRect.width / 2 - tw / 2, nodeRect.bottom - stageRect.top + 12),
      ];
      candidates.sort(function (a, b) {
        return a.score - b.score;
      });
      var best = candidates[0];

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

      if (!useClick) {
        hitEl.addEventListener("mouseenter", function () {
          var nodeId = nodeEl.getAttribute("data-node-id");
          var hasNode = !!nodes[nodeId];
          if (!hasNode && !(roadmapId === "calibration" && showCalibrationFallback(nodeEl, nodeEl))) return;
          var routeIds = hasNode ? (nodes[nodeId].routeIds || []) : [];
          hoverNodeId = nodeId;
          clearNodeHover();
          nodeEl.classList.add("is-hover");
          if (hasNode) {
            highlightPathIds(pathIdsForRoutes(routeIds));
            showNodeTooltip(nodeId, nodeEl);
          }
        });
        hitEl.addEventListener("mouseleave", function () {
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
        });
        return;
      }

      hitEl.addEventListener("click", function (event) {
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
          highlightPathIds(pathIdsForRoutes(routeIds));
          showNodeTooltip(nodeId, nodeEl);
        }
      });
    }

    var nodeSelector = roadmapId === "calibration"
      ? "g.nodes .node"
      : "g.nodes .node:not(.node--empty)";
    svg.querySelectorAll(nodeSelector).forEach(bindNodeHover);

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
            highlightPathIds(pathIdsForRoutes(routeIds));
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
