/**
 * SVG 图层重构
 * 顺序：g.lines → g.flow-lines → g.nodes → g.labels
 */
(function (global) {
  var SVG_NS = "http://www.w3.org/2000/svg";

  function isInDefs(el) {
    var node = el.parentNode;
    while (node && node !== el.ownerSVGElement) {
      var tag = node.tagName;
      if (tag === "defs" || tag === "clipPath" || tag === "mask") return true;
      node = node.parentNode;
    }
    return false;
  }

  function isCanvasBackground(path, svg) {
    var fill = (path.getAttribute("fill") || "").toLowerCase();
    if (fill !== "#ffffff" && fill !== "#fff") return false;
    if (path.getAttribute("stroke")) return false;
    var d = path.getAttribute("d") || "";
    if (d.indexOf("C") !== -1 || d.indexOf("c") !== -1) return false;
    try {
      var bb = path.getBBox();
      var vb = String(svg.getAttribute("viewBox") || "0 0 0 0")
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      var vw = vb[2] || 0;
      var vh = vb[3] || 0;
      return vw > 0 && vh > 0 && bb.width > vw * 0.85 && bb.height > vh * 0.85;
    } catch (e) {
      return false;
    }
  }

  function createLayer(svg, className) {
    var g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", className);
    svg.appendChild(g);
    return g;
  }

  function isTrackPath(path) {
    var sw = parseFloat(path.getAttribute("stroke-width") || "0");
    var stroke = path.getAttribute("stroke");
    var fill = path.getAttribute("fill");
    return sw >= 5 && !!stroke && (!fill || fill === "none");
  }

  function isStationMarkerD(d) {
    d = d || "";
    if (!/^M0 0/.test(d)) return false;
    return /Z$/i.test(d) || /\s0\s0(\s0)?$/i.test(d);
  }

  function isStationStrokePath(path) {
    if ((path.getAttribute("stroke") || "").toLowerCase() !== "#6f7173") return false;
    var sw = parseFloat(path.getAttribute("stroke-width") || "0");
    if (Math.abs(sw - 1.417) > 0.25) return false;
    if (path.getAttribute("fill") && path.getAttribute("fill") !== "none") return false;
    return isStationMarkerD(path.getAttribute("d"));
  }

  function isStationFillPath(path) {
    var fill = (path.getAttribute("fill") || "").toLowerCase();
    if (fill !== "#ffffff") return false;
    if (path.getAttribute("stroke")) return false;
    return isStationMarkerD(path.getAttribute("d"));
  }

  function looksLikeJunction(strokeD, bb) {
    if (/V-?[0-9]{2,}/.test(strokeD || "")) return true;
    var maxSide = Math.max(bb.width, bb.height);
    var minSide = Math.min(bb.width, bb.height) || 1;
    return maxSide > 20 && maxSide > minSide * 1.45;
  }

  function bboxCenter(el) {
    var bb = el.getBBox();
    return {
      x: bb.x + bb.width / 2,
      y: bb.y + bb.height / 2,
      r: Math.max(bb.width, bb.height) / 2,
    };
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

  function wrapStation(fillPath, strokePath, nodesLayer, index) {
    var wrap = document.createElementNS(SVG_NS, "g");
    wrap.setAttribute("class", "node");
    wrap.setAttribute("data-station-index", String(index));
    nodesLayer.appendChild(wrap);
    if (fillPath) wrap.appendChild(fillPath);
    if (strokePath) wrap.appendChild(strokePath);

    var bb = wrap.getBBox();
    var strokeD = strokePath ? strokePath.getAttribute("d") || "" : "";
    var geo = {
      x: bb.x + bb.width / 2,
      y: bb.y + bb.height / 2,
      r: Math.max(bb.width, bb.height) / 2,
    };
    var isJunction = looksLikeJunction(strokeD, bb);

    if (isJunction) wrap.classList.add("node--junction");

    addRipple(wrap, geo, "");
    addRipple(wrap, geo, "node-ripple--delay");

    var pad = isJunction ? 10 : 9;
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

  function restructure(svg) {
    if (!svg) return null;
    if (svg.getAttribute("data-layers-ready") === "1") {
      var cachedStations = Array.prototype.map.call(svg.querySelectorAll("g.nodes > .node"), function (wrap) {
        var bb = wrap.getBBox();
        return {
          el: wrap,
          center: { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 },
          radius: Math.max(bb.width, bb.height) / 2,
          bbox: { x: bb.x, y: bb.y, width: bb.width, height: bb.height },
          isJunction: wrap.classList.contains("node--junction"),
          stationIndex: parseInt(wrap.getAttribute("data-station-index") || "0", 10),
        };
      }).sort(function (a, b) {
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

    var lines = createLayer(svg, "lines");
    var flowLines = createLayer(svg, "flow-lines");
    flowLines.setAttribute("pointer-events", "none");
    var nodes = createLayer(svg, "nodes");
    var labels = createLayer(svg, "labels");

    var tracks = [];
    var stationStrokes = [];
    var leftovers = [];

    Array.prototype.forEach.call(svg.querySelectorAll("path"), function (path) {
      if (isInDefs(path)) return;
      if (lines.contains(path) || nodes.contains(path) || labels.contains(path)) return;
      if (isCanvasBackground(path, svg)) return;
      if (isTrackPath(path)) tracks.push(path);
      else if (isStationStrokePath(path)) stationStrokes.push(path);
      else leftovers.push(path);
    });

    tracks.forEach(function (path) {
      path.classList.add("line-segment");
      lines.appendChild(path);
    });

    var stations = [];
    stationStrokes.forEach(function (strokePath, index) {
      var fillPath = strokePath.previousElementSibling;
      if (!(fillPath && fillPath.tagName === "path" && isStationFillPath(fillPath))) {
        fillPath = null;
      }
      stations.push(wrapStation(fillPath, strokePath, nodes, index));
    });

    stations.filter(function (station) {
      return station.isJunction;
    }).forEach(function (station) {
      nodes.appendChild(station.el);
    });

    leftovers.forEach(function (path) {
      if (path.parentNode && nodes.contains(path)) return;
      labels.appendChild(path);
    });

    Array.prototype.forEach.call(svg.querySelectorAll("text"), function (textEl) {
      if (isInDefs(textEl) || labels.contains(textEl)) return;
      labels.appendChild(textEl);
    });

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

  global.SvgRoadmapLayers = { restructure: restructure };
})(window);
