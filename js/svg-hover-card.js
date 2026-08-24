/**
 * SVG 节点 Hover 悬浮卡片
 * - 按 tspan/字符位置生成独立命中区（解决 Security 等挤在一起无法悬浮）
 * - 用法：SvgNodeHoverCard.mount({ stage, svg, data })
 */
(function (global) {
  var SVG_NS = "http://www.w3.org/2000/svg";

  function createCard() {
    var card = document.createElement("div");
    card.className = "node-hover-card";
    card.setAttribute("role", "tooltip");
    card.innerHTML = [
      '<div class="node-hover-card__header">',
      '  <h3 class="node-hover-card__title"></h3>',
      '  <div class="node-hover-card__badges"></div>',
      "</div>",
      '<p class="node-hover-card__desc"></p>',
    ].join("");
    return card;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function overlaps(a, b, pad) {
    var p = pad || 0;
    return !(
      a.right + p <= b.left ||
      a.left - p >= b.right ||
      a.bottom + p <= b.top ||
      a.top - p >= b.bottom
    );
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .replace(/：/g, ":")
      .replace(/＆/g, "&")
      .replace(/Securitv/gi, "Security");
  }

  function aliasVariants(alias) {
    var base = String(alias || "");
    var list = [base, normalizeText(base)];
    if (/security/i.test(base)) {
      list.push(base.replace(/Security/gi, "Securitv"));
      list.push(normalizeText(base).replace(/Security/gi, "Securitv"));
    }
    return Array.from(
      new Set(
        list
          .map(function (s) {
            return s.trim();
          })
          .filter(Boolean)
      )
    );
  }

  function findInString(haystack, alias) {
    var variants = aliasVariants(alias);
    for (var i = 0; i < variants.length; i += 1) {
      var v = variants[i];
      var idx = haystack.indexOf(v);
      if (idx === -1) idx = haystack.toLowerCase().indexOf(v.toLowerCase());
      if (idx !== -1) return { start: idx, end: idx + v.length, value: haystack.slice(idx, idx + v.length) };
    }
    // 去空白后再找，并映回原串下标
    var map = [];
    var compact = "";
    for (var c = 0; c < haystack.length; c += 1) {
      if (/\s/.test(haystack[c])) continue;
      map[compact.length] = c;
      compact += haystack[c];
    }
    var compactNorm = normalizeText(compact);
    // compactNorm may change Securitv->Security; build parallel on compact
    for (i = 0; i < variants.length; i += 1) {
      v = normalizeText(variants[i]);
      idx = compactNorm.indexOf(v);
      if (idx === -1) continue;
      var rawStart = map[idx];
      var rawEnd = map[idx + v.length - 1] + 1;
      if (rawStart == null || rawEnd == null) continue;
      return { start: rawStart, end: rawEnd, value: haystack.slice(rawStart, rawEnd) };
    }
    return null;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function parseMatrix(transform) {
    if (!transform) {
      return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, raw: null };
    }
    var m = transform.match(/matrix\(([^)]+)\)/);
    if (!m) {
      return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, raw: null };
    }
    var parts = m[1].trim().split(/[\s,]+/).map(Number);
    if (parts.length < 6) {
      return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, raw: null };
    }
    return {
      a: parts[0],
      b: parts[1],
      c: parts[2],
      d: parts[3],
      e: parts[4],
      f: parts[5],
      raw: transform,
    };
  }

  function transformPoint(matrix, x, y) {
    return {
      x: matrix.a * x + matrix.c * y + matrix.e,
      y: matrix.b * x + matrix.d * y + matrix.f,
    };
  }

  function isAxisAligned(matrix) {
    return Math.abs(matrix.b) < 0.001 && Math.abs(matrix.c) < 0.001;
  }

  function parseTranslateY(transform) {
    return parseMatrix(transform).f;
  }

  function fragmentRowKey(frag) {
    var tf = frag.transformRaw || "identity";
    if (isAxisAligned(frag.matrix)) {
      // 同一 transform + localY：跨 <text> 的英文/中文标签（DevOps+工作流）
      return "y:" + tf + ":" + String(Math.round(frag.localY * 10));
    }
    // 斜体/旋转：英文与中文常在相邻 <text>，按 transform+localY 聚类（CAN+协议）
    return "m:" + tf + ":" + String(Math.round(frag.localY * 10));
  }

  function positionCard(card, stage, anchorEl) {
    var svg = stage.querySelector("svg");
    if (global.SvgRoadmapLayers && global.SvgRoadmapLayers.positionTooltip) {
      global.SvgRoadmapLayers.positionTooltip(card, stage, anchorEl, svg);
      return;
    }

    var stageRect = stage.getBoundingClientRect();
    var nodeRect = anchorEl.getBoundingClientRect();
    var cardWidth = card.offsetWidth;
    var cardHeight = card.offsetHeight;
    var gap = 16;
    var pad = 8;

    var nodeBox = {
      left: nodeRect.left - stageRect.left,
      top: nodeRect.top - stageRect.top,
      right: nodeRect.right - stageRect.left,
      bottom: nodeRect.bottom - stageRect.top,
    };

    var candidates = [
      {
        left: nodeBox.left + (nodeBox.right - nodeBox.left) / 2 - cardWidth / 2,
        top: nodeBox.bottom + gap,
      },
      {
        left: nodeBox.left + (nodeBox.right - nodeBox.left) / 2 - cardWidth / 2,
        top: nodeBox.top - cardHeight - gap,
      },
      {
        left: nodeBox.right + gap,
        top: nodeBox.top + (nodeBox.bottom - nodeBox.top) / 2 - cardHeight / 2,
      },
      {
        left: nodeBox.left - cardWidth - gap,
        top: nodeBox.top + (nodeBox.bottom - nodeBox.top) / 2 - cardHeight / 2,
      },
    ];

    var chosen = null;
    for (var i = 0; i < candidates.length; i += 1) {
      var c = candidates[i];
      var left = clamp(c.left, pad, Math.max(pad, stageRect.width - cardWidth - pad));
      var top = clamp(c.top, pad, Math.max(pad, stageRect.height - cardHeight - pad));
      var box = {
        left: left,
        top: top,
        right: left + cardWidth,
        bottom: top + cardHeight,
      };
      if (!overlaps(box, nodeBox, 10)) {
        chosen = { left: left, top: top };
        break;
      }
    }

    if (!chosen) {
      chosen = {
        left: clamp(
          nodeBox.left + (nodeBox.right - nodeBox.left) / 2 - cardWidth / 2,
          pad,
          Math.max(pad, stageRect.width - cardWidth - pad)
        ),
        top: clamp(
          nodeBox.bottom + gap,
          pad,
          Math.max(pad, stageRect.height - cardHeight - pad)
        ),
      };
    }

    card.style.left = chosen.left + "px";
    card.style.top = chosen.top + "px";
  }

  function fillCard(card, info) {
    card.querySelector(".node-hover-card__title").textContent = info.nodeName || "";
    card.querySelector(".node-hover-card__desc").textContent = info.description || "";

    var badges = card.querySelector(".node-hover-card__badges");
    var types = [];
    if (Array.isArray(info.type)) types = info.type;
    else if (info.type) {
      types = String(info.type)
        .split(/[·,，/|]/)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
    }
    badges.innerHTML = types
      .map(function (t) {
        return '<span class="node-hover-card__badge">' + escapeHtml(t) + "</span>";
      })
      .join("");
  }

  function hasHoverContent(info) {
    return !!(info && String(info.description || "").trim());
  }

  function collectFragments(svg) {
    var fragments = [];
    var textElId = 0;

    Array.from(svg.querySelectorAll("text")).forEach(function (textEl) {
      var matrix = parseMatrix(textEl.getAttribute("transform"));
      var elId = (textElId += 1);
      var tspans = textEl.querySelectorAll("tspan");
      var targets = tspans.length ? Array.from(tspans) : [textEl];

      targets.forEach(function (node) {
        var raw = node.textContent || "";
        if (!raw.trim()) return;
        var yAttr = parseFloat(node.getAttribute("y") || "0");
        var xAttr = node.getAttribute("x") || "0";
        var xs = xAttr
          .trim()
          .split(/[\s,]+/)
          .map(Number)
          .filter(function (n) {
            return !isNaN(n);
          });
        if (!xs.length) xs = [0];

        var content = raw;
        var x0 = xs[0];
        var xLast = xs.length > 1 ? xs[xs.length - 1] : x0;
        var approxEnd = xLast + Math.max(8, content.length > xs.length ? 10 : 8);
        var globalPt = transformPoint(matrix, x0, yAttr);

        fragments.push({
          textEl: textEl,
          textElId: elId,
          node: node,
          content: content,
          text: content,
          xs: xs,
          x: x0,
          localY: yAttr,
          y: globalPt.y,
          xGlobal: globalPt.x,
          width: Math.max(approxEnd - x0, content.length * 5.5),
          height: 16,
          matrix: matrix,
          transformRaw: matrix.raw,
          usedRanges: [],
        });
      });
    });
    return fragments;
  }

  function isRangeUsed(frag, start, end) {
    return frag.usedRanges.some(function (r) {
      return !(end <= r[0] || start >= r[1]);
    });
  }

  function markRangeUsed(frag, start, end) {
    frag.usedRanges.push([start, end]);
  }

  function typicalCharWidth(xs, start, end) {
    var gaps = [];
    var i;
    // 优先用匹配范围内相邻字符间距
    for (i = Math.max(start + 1, 1); i < end && i < xs.length; i += 1) {
      var g = xs[i] - xs[i - 1];
      if (g > 0 && g < 22) gaps.push(g);
    }
    // 回退：整段里的“正常字距”（忽略标签之间的大空隙）
    if (!gaps.length) {
      for (i = 1; i < xs.length; i += 1) {
        var g2 = xs[i] - xs[i - 1];
        if (g2 > 0 && g2 < 22) gaps.push(g2);
      }
    }
    if (!gaps.length) return 9;
    return gaps.reduce(function (a, b) {
      return a + b;
    }, 0) / gaps.length;
  }

  function rangeToBox(frag, start, end) {
    var xs = frag.xs;
    var x0;
    var x1;
    var len = Math.max(frag.content.length, 1);
    var charW;

    if (xs.length >= end && end > start) {
      // 用字距估算末字宽度，绝不能用“下一标签”的超大空隙
      charW = typicalCharWidth(xs, start, end);
      x0 = xs[start];
      x1 = xs[end - 1] + charW;
    } else if (xs.length > 1 && xs.length === len) {
      charW = typicalCharWidth(xs, start, Math.min(end, xs.length));
      x0 = xs[Math.min(start, xs.length - 1)];
      x1 = xs[Math.min(end - 1, xs.length - 1)] + charW;
    } else {
      x0 = frag.x + (frag.width * start) / len;
      x1 = frag.x + (frag.width * end) / len;
    }

    return {
      x: x0 - 6,
      y: frag.localY - 14,
      width: Math.max(x1 - x0 + 12, 28),
      height: 22,
      transform: frag.transformRaw || null,
    };
  }

  function mergeHitBoxes(boxes) {
    if (!boxes.length) return null;
    if (boxes.length === 1) return boxes[0];

    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;

    boxes.forEach(function (b) {
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    });

    var padX = 4;
    var padY = 3;
    return {
      x: minX - padX,
      y: minY - padY,
      width: maxX - minX + padX * 2,
      height: maxY - minY + padY * 2,
      transform: boxes[0].transform || null,
    };
  }

  function createHitGroup(svg, layer, nodeId, boxes) {
    if (!boxes.length) return null;

    var g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("data-node-id", nodeId);
    g.setAttribute("class", "svg-node");

    var byTransform = {};
    boxes.forEach(function (b) {
      var key = b.transform || "";
      if (!byTransform[key]) byTransform[key] = [];
      byTransform[key].push(b);
    });

    Object.keys(byTransform).forEach(function (key) {
      var wrap = g;
      if (key) {
        wrap = document.createElementNS(SVG_NS, "g");
        wrap.setAttribute("transform", key);
        g.appendChild(wrap);
      }

      var merged = mergeHitBoxes(byTransform[key]);
      if (!merged) return;

      var hit = document.createElementNS(SVG_NS, "rect");
      hit.setAttribute("class", "svg-node-hit");
      hit.setAttribute("x", String(merged.x));
      hit.setAttribute("y", String(merged.y));
      hit.setAttribute("width", String(Math.max(merged.width, 28)));
      hit.setAttribute("height", String(Math.max(merged.height, 20)));
      var radius = Math.min(10, Math.max(merged.height, 20) / 2);
      hit.setAttribute("rx", String(radius));
      hit.setAttribute("ry", String(radius));
      hit.setAttribute("fill", "transparent");
      wrap.appendChild(hit);
    });

    layer.appendChild(g);
    return g;
  }

  function fragEndX(frag) {
    var xs = frag.xs || [];
    var len = Math.max((frag.content || "").length, 1);
    if (xs.length) {
      var lastIdx = Math.min(len, xs.length) - 1;
      return xs[lastIdx] + typicalCharWidth(xs, 0, lastIdx + 1);
    }
    return frag.x + (frag.width || 8);
  }

  function fragLocalBounds(frag) {
    return {
      x0: frag.x,
      x1: fragEndX(frag),
      y0: frag.localY,
      y1: frag.localY,
    };
  }

  function mergeLocalBounds(a, b) {
    return {
      x0: Math.min(a.x0, b.x0),
      x1: Math.max(a.x1, b.x1),
      y0: Math.min(a.y0, b.y0),
      y1: Math.max(a.y1, b.y1),
    };
  }

  function boundsOverlapX(a, b, pad) {
    var p = pad || 0;
    return !(a.x1 + p < b.x0 - p || a.x0 - p > b.x1 + p);
  }

  function fragClusterEnd(frag) {
    return frag.x + Math.min(Math.max((frag.content || "").length * 6, 8), 40);
  }

  // 水平路线图多行标签：先行内 band 合并，再按列向下生长（Task+Mapping、MSRC.MEM+进阶）
  function buildBandRowUnits(fragments, bandWidth) {
    var band = bandWidth == null ? 30 : bandWidth;
    var byKey = {};
    fragments.forEach(function (frag) {
      var tf = frag.transformRaw || "identity";
      var rowKey = String(Math.round(frag.localY * 10));
      var bandKey = String(Math.round(frag.x / band));
      var key = tf + "|" + rowKey + "|" + bandKey;
      if (!byKey[key]) byKey[key] = [];
      byKey[key].push(frag);
    });

    var units = [];
    Object.keys(byKey).forEach(function (key) {
      var parts = key.split("|");
      var cluster = byKey[key].slice().sort(function (a, b) {
        return a.x - b.x;
      });
      var x0 = cluster[0].x;
      var x1 = fragClusterEnd(cluster[cluster.length - 1]);
      units.push({
        fragments: cluster,
        transformRaw: parts[0] === "identity" ? null : parts[0],
        localY: cluster[0].localY,
        bounds: {
          x0: x0,
          x1: x1,
          y0: cluster[0].localY,
          y1: cluster[0].localY,
        },
      });
    });
    return units;
  }

  function growBandVerticalStacks(units, maxYGap, xPad, minYGap) {
    var yGap = maxYGap == null ? 16 : maxYGap;
    var pad = xPad == null ? 12 : xPad;
    var minGap = minYGap == null ? 1 : minYGap;
    if (units.length < 2) return [];

    var byTransform = {};
    units.forEach(function (unit, idx) {
      unit._idx = idx;
      var key = unit.transformRaw || "identity";
      if (!byTransform[key]) byTransform[key] = [];
      byTransform[key].push(unit);
    });

    var stacks = [];
    Object.keys(byTransform).forEach(function (key) {
      var sorted = byTransform[key].slice().sort(function (a, b) {
        return a.localY - b.localY || a.bounds.x0 - b.bounds.x0;
      });
      var used = {};

      sorted.forEach(function (unit, i) {
        if (used[i]) return;
        var stack = [unit];
        used[i] = true;
        var bounds = {
          x0: unit.bounds.x0,
          x1: unit.bounds.x1,
          y0: unit.bounds.y0,
          y1: unit.bounds.y1,
        };

        for (var j = i + 1; j < sorted.length; j += 1) {
          if (used[j]) continue;
          var next = sorted[j];
          var dy = next.localY - bounds.y1;
          if (dy < minGap || dy > yGap) continue;
          if (!boundsOverlapX(bounds, next.bounds, pad)) continue;
          stack.push(next);
          used[j] = true;
          bounds = mergeLocalBounds(bounds, next.bounds);
        }

        if (stack.length >= 2) {
          var frags = [];
          stack.forEach(function (u) {
            frags = frags.concat(u.fragments);
          });
          stacks.push(frags);
        }
      });
    });

    return stacks;
  }

  // 斜体多行标签（汽车电子+嵌入式基础、CANoe+桌面版）
  function clusterVerticalStacks(fragments, maxYGap, xPad) {
    var yGap = maxYGap == null ? 16 : maxYGap;
    var pad = xPad == null ? 28 : xPad;
    var rotated = fragments.filter(function (f) {
      return !isAxisAligned(f.matrix);
    });
    if (rotated.length < 2) return [];

    var byTransform = {};
    rotated.forEach(function (frag) {
      var key = frag.transformRaw || "identity";
      if (!byTransform[key]) byTransform[key] = [];
      byTransform[key].push(frag);
    });

    var stacks = [];
    Object.keys(byTransform).forEach(function (key) {
      var sorted = byTransform[key].slice().sort(function (a, b) {
        return a.localY - b.localY || a.x - b.x;
      });
      var current = [];
      var bounds = null;

      sorted.forEach(function (frag) {
        var fb = fragLocalBounds(frag);
        if (!current.length) {
          current = [frag];
          bounds = fb;
          return;
        }
        var yGapOk = frag.localY - bounds.y1 <= yGap;
        var xOk = boundsOverlapX(bounds, fb, pad);
        if (yGapOk && xOk) {
          current.push(frag);
          bounds = mergeLocalBounds(bounds, fb);
        } else {
          if (current.length >= 2) stacks.push(current);
          current = [frag];
          bounds = fb;
        }
      });
      if (current.length >= 2) stacks.push(current);
    });

    return stacks;
  }

  function orderStackFragments(stack) {
    var byRow = {};
    stack.forEach(function (frag) {
      var rowKey = String(Math.round(frag.localY * 10));
      if (!byRow[rowKey]) byRow[rowKey] = [];
      byRow[rowKey].push(frag);
    });
    var ordered = [];
    Object.keys(byRow)
      .sort(function (a, b) {
        return Number(a) - Number(b);
      })
      .forEach(function (rowKey) {
        byRow[rowKey].sort(function (a, b) {
          return a.x - b.x;
        });
        ordered = ordered.concat(byRow[rowKey]);
      });
    return ordered;
  }

  // 只把紧挨着的文字拼成一组（同一站点的 英文+中文），避免整行误拼
  function clusterFragments(row, maxGap) {
    var gap = maxGap == null ? 12 : maxGap;
    var sorted = row.slice().sort(function (a, b) {
      return a.x - b.x;
    });
    var clusters = [];
    var current = [];
    var lastEnd = -Infinity;

    sorted.forEach(function (frag) {
      if (current.length && frag.x > lastEnd + gap) {
        clusters.push(current);
        current = [];
      }
      current.push(frag);
      lastEnd = Math.max(lastEnd, fragEndX(frag));
    });
    if (current.length) clusters.push(current);
    return clusters;
  }

  function matchInCluster(cluster, alias) {
    var concat = "";
    var map = [];
    cluster.forEach(function (frag) {
      var start = concat.length;
      concat += frag.content;
      map.push({
        frag: frag,
        start: start,
        end: concat.length,
      });
    });

    var from = 0;
    var hits = [];
    while (from < concat.length) {
      var slice = concat.slice(from);
      var found = findInString(slice, alias);
      if (!found) break;
      var absStart = from + found.start;
      var absEnd = from + found.end;
      from = absEnd;

      var claims = [];
      var boxes = [];
      var ok = true;
      map.forEach(function (seg) {
        var s = Math.max(absStart, seg.start);
        var e = Math.min(absEnd, seg.end);
        if (e <= s) return;
        var localStart = s - seg.start;
        var localEnd = e - seg.start;
        if (isRangeUsed(seg.frag, localStart, localEnd)) {
          ok = false;
          return;
        }
        claims.push({ frag: seg.frag, start: localStart, end: localEnd });
        boxes.push(rangeToBox(seg.frag, localStart, localEnd));
      });
      if (ok && boxes.length) {
        hits.push({
          boxes: boxes,
          claims: claims,
          x: boxes[0].x,
          y: claims[0].frag.y,
        });
      }
    }
    return hits;
  }

  function findAliasHits(fragments, alias) {
    var hits = [];
    var normAliasLen = normalizeText(alias).length;

    // 1) 单 fragment 内全部未占用出现
    fragments.forEach(function (frag) {
      var from = 0;
      while (from < frag.content.length) {
        var slice = frag.content.slice(from);
        var found = findInString(slice, alias);
        if (!found) break;
        var start = from + found.start;
        var end = from + found.end;
        from = end;
        if (isRangeUsed(frag, start, end)) continue;
        var box = rangeToBox(frag, start, end);
        hits.push({
          boxes: [box],
          claims: [{ frag: frag, start: start, end: end }],
          x: box.x,
          y: frag.y,
          matchLen: normalizeText(found.value).length,
        });
      }
    });

    // 2) 同一行近邻聚类后再拼（始终执行，避免单 fragment 误命中阻断跨 tspan 匹配）
    var byRow = {};
    fragments.forEach(function (frag) {
      var key = fragmentRowKey(frag);
      if (!byRow[key]) byRow[key] = [];
      byRow[key].push(frag);
    });

    Object.keys(byRow).forEach(function (key) {
      clusterFragments(byRow[key], 12).forEach(function (cluster) {
        if (cluster.length < 2) return;
        matchInCluster(cluster, alias).forEach(function (hit) {
          hit.matchLen = normAliasLen;
          hits.push(hit);
        });
      });
    });

    clusterVerticalStacks(fragments, 16, 28).forEach(function (stack) {
      var ordered = orderStackFragments(stack);
      if (ordered.length < 2) return;
      matchInCluster(ordered, alias).forEach(function (hit) {
        hit.matchLen = normAliasLen;
        hits.push(hit);
      });
    });

    var bandUnits = buildBandRowUnits(fragments, 30);
    bandUnits.forEach(function (unit) {
      if (unit.fragments.length < 2) return;
      var ordered = unit.fragments.slice().sort(function (a, b) {
        return a.x - b.x;
      });
      matchInCluster(ordered, alias).forEach(function (hit) {
        hit.matchLen = normAliasLen;
        hits.push(hit);
      });
    });
    growBandVerticalStacks(bandUnits, 16, 12, 1).forEach(function (stack) {
      var ordered = orderStackFragments(stack);
      if (ordered.length < 2) return;
      matchInCluster(ordered, alias).forEach(function (hit) {
        hit.matchLen = normAliasLen;
        hits.push(hit);
      });
    });

    if (!hits.length) return hits;

    // 完整匹配优先；同长度的多处命中全部保留（路线图重复标签）
    hits.sort(function (a, b) {
      return (b.matchLen || 0) - (a.matchLen || 0) || a.y - b.y || a.x - b.x;
    });

    var fullHits = hits.filter(function (h) {
      return (h.matchLen || 0) >= normAliasLen;
    });
    var chosen = fullHits.length ? fullHits : hits;

    chosen.sort(function (a, b) {
      return a.y - b.y || a.x - b.x;
    });
    return chosen;
  }

  function autoBindNodes(svg, data, options) {
    // 清掉旧的手动包裹，统一走命中层
    svg.querySelectorAll("g.svg-node[data-node-id]").forEach(function (g) {
      var parent = g.parentNode;
      if (!parent) return;
      Array.from(g.childNodes).forEach(function (child) {
        if (child.nodeType === 1 && child.classList && child.classList.contains("svg-node-hit")) {
          return;
        }
        parent.insertBefore(child, g);
      });
      parent.removeChild(g);
    });

    var oldLayer = svg.querySelector("#hover-hit-layer");
    if (oldLayer) oldLayer.remove();

    var layer = document.createElementNS(SVG_NS, "g");
    layer.setAttribute("id", "hover-hit-layer");
    var bindOnly = !!(options && options.bindOnly);
    if (bindOnly) layer.setAttribute("pointer-events", "none");
    var labelsLayer = svg.querySelector("g.labels") || svg.querySelector(".labels-layer");
    (labelsLayer || svg).appendChild(layer);

    var fragments = collectFragments(svg);

    var entries = Object.keys(data)
      .filter(function (nodeId) {
        return hasHoverContent(data[nodeId]);
      })
      .map(function (nodeId) {
        var info = data[nodeId];
        // 保留原始 match，勿先 normalize 掉 Securitv 等区分信息
        var aliases = (info.match && info.match.length ? info.match.slice() : [nodeId])
          .map(function (a) {
            return String(a || "").trim();
          })
          .filter(Boolean);
        aliases.sort(function (a, b) {
          return normalizeText(b).length - normalizeText(a).length;
        });
        var maxLen = aliases.reduce(function (n, a) {
          return Math.max(n, normalizeText(a).length);
        }, 0);
        var matchIndex = info.matchIndex;
        return { nodeId: nodeId, aliases: aliases, maxLen: maxLen, matchIndex: matchIndex };
      });

    entries.sort(function (a, b) {
      if (b.maxLen !== a.maxLen) return b.maxLen - a.maxLen;
      return (a.matchIndex == null ? -1 : a.matchIndex) - (b.matchIndex == null ? -1 : b.matchIndex);
    });

    entries.forEach(function (entry) {
      var hitsToBind = null;
      var aliasIdx;

      for (aliasIdx = 0; aliasIdx < entry.aliases.length; aliasIdx += 1) {
        var alias = entry.aliases[aliasIdx];
        var hits = findAliasHits(fragments, alias);
        if (!hits.length) continue;
        // matchIndex：仅绑定第 N 个；默认绑定全部（重复标签如两处 AUTOSAR概论）
        if (entry.matchIndex != null && entry.matchIndex >= 0) {
          hitsToBind = entry.matchIndex < hits.length ? [hits[entry.matchIndex]] : [];
        } else {
          hitsToBind = hits;
        }
        if (hitsToBind.length) break;
      }

      if (!hitsToBind || !hitsToBind.length) return;
      hitsToBind.forEach(function (best) {
        best.claims.forEach(function (c) {
          markRangeUsed(c.frag, c.start, c.end);
        });
        createHitGroup(svg, layer, entry.nodeId, best.boxes);
      });
    });
  }

  function bindNodeEvents(nodeEl, nodeId, api) {
    nodeEl.classList.add("svg-node");
    nodeEl.addEventListener("mouseenter", function () {
      api.show(nodeId, nodeEl);
    });
    nodeEl.addEventListener("mouseleave", function () {
      api.scheduleHide();
    });
    nodeEl.addEventListener("click", function (event) {
      event.stopPropagation();
      if (api.activeId() === nodeId && api.isVisible()) {
        api.hide();
      } else {
        api.show(nodeId, nodeEl);
      }
    });
  }

  function mount(options) {
    var stage = options.stage;
    var svg = options.svg;
    var data = options.data || global.NODE_HOVER_DATA || {};

    if (!stage || !svg) {
      throw new Error("SvgNodeHoverCard.mount 需要提供 stage 与 svg");
    }

    stage.classList.add("svg-hover-stage");
    if (getComputedStyle(stage).position === "static") {
      stage.style.position = "relative";
    }

    autoBindNodes(svg, data, { bindOnly: !!options.bindOnly });

    if (options.bindOnly) {
      return { bindOnly: true };
    }

    var veil = document.createElement("div");
    veil.className = "svg-hover-veil";
    veil.setAttribute("aria-hidden", "true");

    var card = createCard();
    var tooltipHost =
      global.SvgRoadmapLayers && global.SvgRoadmapLayers.ensureHtmlTooltipLayer
        ? global.SvgRoadmapLayers.ensureHtmlTooltipLayer(stage)
        : stage;

    stage.appendChild(veil);
    tooltipHost.appendChild(card);

    var hideTimer = null;
    var activeId = null;
    var activeAnchor = null;

    function clearActiveNodes() {
      svg.querySelectorAll(".svg-node.is-active").forEach(function (el) {
        el.classList.remove("is-active");
      });
    }

    function layout(anchorEl) {
      positionCard(card, stage, anchorEl);
    }

    function show(nodeId, anchorEl) {
      var info = data[nodeId];
      if (!hasHoverContent(info)) return;

      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }

      activeId = nodeId;
      activeAnchor = anchorEl;
      clearActiveNodes();
      anchorEl.classList.add("is-active");
      stage.classList.add("is-hovering");

      fillCard(card, info);
      card.classList.add("is-visible");

      requestAnimationFrame(function () {
        layout(anchorEl);
      });
    }

    function hide() {
      activeId = null;
      activeAnchor = null;
      clearActiveNodes();
      stage.classList.remove("is-hovering");
      card.classList.remove("is-visible");
    }

    function scheduleHide() {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, 60);
    }

    var api = {
      show: show,
      hide: hide,
      scheduleHide: scheduleHide,
      activeId: function () {
        return activeId;
      },
      isVisible: function () {
        return card.classList.contains("is-visible");
      },
    };

    svg.querySelectorAll("[data-node-id]").forEach(function (nodeEl) {
      var nodeId = nodeEl.getAttribute("data-node-id");
      if (!nodeId || !data[nodeId]) return;
      bindNodeEvents(nodeEl, nodeId, api);
    });

    document.addEventListener("click", function (event) {
      if (!stage.contains(event.target)) hide();
    });

    window.addEventListener("resize", function () {
      if (!activeId || !activeAnchor || !card.classList.contains("is-visible")) return;
      layout(activeAnchor);
    });

    return {
      show: show,
      hide: hide,
      card: card,
      updateData: function (nextData) {
        Object.assign(data, nextData || {});
      },
    };
  }

  global.SvgNodeHoverCard = { mount: mount };
})(window);
