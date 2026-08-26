/**
 * 知识路线图 SPA：选角页 + 地铁图展示
 */
(function () {
  var loading = false;
  var activeInteractions = null;
  var roleSelect = null;
  var transitioning = false;

  function findRoadmap(id) {
    var list = window.ROADMAP_CATALOG || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function getRouteId() {
    var hash = (location.hash || "").replace(/^#\/?/, "").trim();
    return hash || null;
  }

  var SVG_ASSET_VERSION = "30";

  function hideSvgCornerLogo(svg) {
    if (!svg) return;
    Array.prototype.forEach.call(svg.querySelectorAll("path"), function (path) {
      var fill = (path.getAttribute("fill") || "").toLowerCase();
      if (fill !== "#ee373b") return;
      var d = path.getAttribute("d") || "";
      var transform = path.getAttribute("transform") || "";
      var isArrow = d.indexOf("12.115") !== -1;
      var isWordmark = d.indexOf("-64.547") !== -1 || d.indexOf("-71.988") !== -1;
      if (!isArrow && !isWordmark) return;
      if (!/8[4-7]\d/.test(transform)) return;
      path.setAttribute("display", "none");
      var parent = path.parentNode;
      if (
        parent &&
        String(parent.tagName || "").toLowerCase() === "g" &&
        parent.getAttribute("clip-path")
      ) {
        parent.setAttribute("display", "none");
      }
    });
  }

  /** 计算有效内容包围盒（排除大背景），用于铺满舞台且不裁切 */
  function contentViewBox(svg) {
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    var found = false;

    function includeBox(b) {
      if (!b || !isFinite(b.x) || !(b.width > 0 || b.height > 0)) return;
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
      found = true;
    }

    function boxOf(el) {
      if (!el || el.getAttribute("display") === "none") return null;
      try {
        return el.getBBox();
      } catch (e) {
        return null;
      }
    }

    function parseMatrix(transform) {
      if (!transform) return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
      var m = String(transform).match(/matrix\(([^)]+)\)/);
      if (!m) return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
      var p = m[1].trim().split(/[\s,]+/).map(Number);
      if (p.length < 6) return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
      return { a: p[0], b: p[1], c: p[2], d: p[3], e: p[4], f: p[5] };
    }

    // 图层组 getBBox 已含子元素变换（不含 #标题，避免拉高留白）
    [
      svg.querySelector("g.lines"),
      svg.querySelector("g.nodes"),
      svg.querySelector("g.flow-lines"),
      svg.querySelector("#路线名"),
    ].forEach(function (el) {
      includeBox(boxOf(el));
    });

    // 斜向站名：本地 bbox 四角经 matrix 变换（勿直接用未变换 getBBox）
    Array.prototype.forEach.call(svg.querySelectorAll("#站点文字 text"), function (textEl) {
      if (textEl.getAttribute("display") === "none") return;
      var local = boxOf(textEl);
      if (!local) return;
      var tf = parseMatrix(textEl.getAttribute("transform"));
      [
        [local.x, local.y],
        [local.x + local.width, local.y],
        [local.x, local.y + local.height],
        [local.x + local.width, local.y + local.height],
      ].forEach(function (pt) {
        var x = tf.a * pt[0] + tf.c * pt[1] + tf.e;
        var y = tf.b * pt[0] + tf.d * pt[1] + tf.f;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        found = true;
      });
    });

    if (!found) includeBox(boxOf(svg));
    if (!found) return null;
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  /** 收紧 viewBox 并在舞台内等比完整显示（meet，不裁切图例/下方信息） */
  function fitSvgToStage(svg) {
    if (!svg) return;
    // 边距尽量小：标题已是 HTML 叠字，少留白即可让地图更大
    var pad = 8;
    var padTop = 14;
    var bb = contentViewBox(svg);
    if (bb && bb.width > 0 && bb.height > 0) {
      var x = bb.x - pad;
      var y = bb.y - padTop;
      var w = bb.width + pad * 2;
      var h = bb.height + pad + padTop;
      svg.setAttribute(
        "viewBox",
        [x, y, w, h]
          .map(function (n) {
            return Number(n.toFixed(2));
          })
          .join(" ")
      );
    }
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.position = "";
    svg.style.left = "";
    svg.style.top = "";
    svg.style.right = "";
    svg.style.bottom = "";
    svg.style.margin = "";
    svg.style.transform = "";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.maxWidth = "100%";
    svg.style.maxHeight = "100%";
    svg.style.display = "block";
    svg.style.background = "transparent";
  }

  /** 水印叠在地铁图之上但不可点击，避免被 SVG 白底/线面完全挡住 */
  function mountMapWatermark(stage) {
    if (!stage) return;
    var old = stage.querySelector(".roadmap-watermark");
    if (old) old.remove();
    var el = document.createElement("div");
    el.className = "roadmap-watermark";
    el.setAttribute("aria-hidden", "true");
    stage.appendChild(el);
  }

  /** 左上角角色名改 HTML 叠字：不参与 viewBox，地图可铺满；名字仍保留 */
  function mountMapTitleOverlay(stage, svg, fallbackTitle) {
    if (!stage || !svg) return;
    var titleGroup = svg.querySelector("#标题");
    var name = String(fallbackTitle || "").trim();
    if (titleGroup) {
      if (!name) {
        var parts = [];
        Array.prototype.forEach.call(titleGroup.querySelectorAll("text"), function (t) {
          var s = String(t.textContent || "")
            .replace(/\s+/g, "")
            .trim();
          if (s) parts.push(s);
        });
        if (parts.length) name = parts.join("");
      }
      titleGroup.setAttribute("display", "none");
    }
    var old = stage.querySelector(".roadmap-map-title");
    if (old) old.remove();
    if (!name) return;
    var el = document.createElement("div");
    el.className = "roadmap-map-title";
    el.textContent = name;
    stage.appendChild(el);
  }

  function svgUrl(fileName) {
    var basePath = location.pathname.replace(/[^/]*$/, "");
    return (
      location.origin +
      basePath +
      String(fileName || "")
        .split("/")
        .map(function (part) {
          return encodeURIComponent(part);
        })
        .join("/") +
      "?v=" +
      SVG_ASSET_VERSION
    );
  }

  function formatLoadError(err, fileName) {
    var msg = err && err.message ? err.message : String(err || "加载失败");
    if (/failed to fetch|networkerror|load failed/i.test(msg)) {
      return (
        "无法加载 " +
        fileName +
        "：本地服务未响应。请确认终端里 python -m http.server 正在运行，然后刷新页面重试。"
      );
    }
    return msg;
  }

  function homeEl() {
    return document.getElementById("home-view");
  }

  function roadmapEl() {
    return document.getElementById("roadmap-view");
  }

  function resetRoadmapEnterClasses() {
    roadmapEl().classList.remove("roadmap-view--enter", "roadmap-view--enter-active");
  }

  function resetHomeExitClass() {
    homeEl().classList.remove("role-select--exit");
  }

  function showHome(animate) {
    var home = homeEl();
    var roadmap = roadmapEl();
    document.getElementById("roadmap-error").hidden = true;
    document.title = "知识路线图";

    if (animate && !roadmap.hidden) {
      transitioning = true;
      roadmap.classList.add("roadmap-view--enter", "roadmap-view--enter-active");
      requestAnimationFrame(function () {
        roadmap.classList.remove("roadmap-view--enter-active");
      });
      window.setTimeout(function () {
        roadmap.hidden = true;
        resetRoadmapEnterClasses();
        home.hidden = false;
        resetHomeExitClass();
        transitioning = false;
      }, 430);
      return;
    }

    home.hidden = false;
    roadmap.hidden = true;
    resetRoadmapEnterClasses();
    resetHomeExitClass();
  }

  function showError(message) {
    var el = document.getElementById("roadmap-error");
    el.textContent = message;
    el.hidden = false;
  }

  async function showRoadmap(id) {
    var item = findRoadmap(id);
    if (!item) {
      showHome(false);
      return;
    }

    if (location.protocol === "file:") {
      showHome(false);
      alert("请通过本地服务器打开页面（例如：python -m http.server 8080），直接双击 html 无法加载 SVG。");
      return;
    }

    var home = homeEl();
    var roadmap = roadmapEl();
    home.hidden = true;
    roadmap.hidden = false;
    resetHomeExitClass();
    document.getElementById("roadmap-title").textContent = item.title;
    document.getElementById("roadmap-error").hidden = true;
    document.title = item.title + " · 知识路线图";

    var stage = document.getElementById("roadmap-stage");
    var searchInput = document.getElementById("roadmap-search");
    var searchResultsEl = document.getElementById("roadmap-search-results");
    var infoPanel = document.getElementById("info-panel");

    if (activeInteractions && activeInteractions.destroy) {
      activeInteractions.destroy();
      activeInteractions = null;
    }
    if (searchInput) searchInput.value = "";
    if (searchResultsEl) {
      searchResultsEl.hidden = true;
      searchResultsEl.innerHTML = "";
    }
    if (infoPanel) {
      infoPanel.hidden = true;
    }

    stage.innerHTML = '<p class="roadmap-loading">加载中…</p>';
    stage.className = "svg-hover-stage";

    loading = true;
    try {
      var res = await fetch(svgUrl(item.svgFile));
      if (!res.ok) throw new Error("无法加载 " + item.svgFile + "（HTTP " + res.status + "）");

      stage.innerHTML = await res.text();
      var svg = stage.querySelector("svg");
      if (!svg) throw new Error("SVG 文件无效：" + item.svgFile);

      hideSvgCornerLogo(svg);

      if (typeof SvgRoadmapLayers !== "undefined") {
        SvgRoadmapLayers.restructure(svg);
      }

      // 图层重组后再量内容包围盒；meet 完整显示图例，水印叠在图上但不挡点击
      fitSvgToStage(svg);
      mountMapWatermark(stage);
      mountMapTitleOverlay(stage, svg, item.title);

      var data = item.dataKey ? window[item.dataKey] || {} : {};
      if (typeof SvgNodeHoverCard === "undefined") {
        throw new Error("悬浮组件未加载，请刷新页面");
      }

      SvgNodeHoverCard.mount({
        stage: stage,
        svg: svg,
        data: data,
        bindOnly: true,
      });

      if (typeof SvgRoadmapInteractions !== "undefined") {
        activeInteractions = SvgRoadmapInteractions.mount({
          stage: stage,
          svg: svg,
          roadmapId: item.id,
          nodeData: data,
          panel: infoPanel,
          searchInput: searchInput,
          searchResultsEl: searchResultsEl,
        });
      }

      if (infoPanel) {
        infoPanel.hidden = true;
      }
    } catch (err) {
      console.error(err);
      home.hidden = true;
      roadmap.hidden = false;
      showError(formatLoadError(err, item.svgFile));
      stage.innerHTML = "";
    } finally {
      loading = false;
    }
  }

  function enterRoadmap(id) {
    if (transitioning || loading) return;
    transitioning = true;

    homeEl().classList.add("role-select--exit");

    window.setTimeout(function () {
      showRoadmap(id).then(function () {
        var roadmap = roadmapEl();
        roadmap.classList.add("roadmap-view--enter");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            roadmap.classList.add("roadmap-view--enter-active");
          });
        });
        window.setTimeout(function () {
          resetRoadmapEnterClasses();
          transitioning = false;
        }, 430);
      });
    }, 420);
  }

  function onRouteChange() {
    if (loading || transitioning) return;
    var id = getRouteId();
    if (id) {
      if (homeEl().hidden) {
        showRoadmap(id);
      } else {
        enterRoadmap(id);
      }
    } else if (!homeEl().hidden) {
      showHome(false);
    } else {
      showHome(true);
    }
  }

  function initRoleSelect() {
    if (typeof RoleSelect === "undefined") return;
    if (roleSelect && roleSelect.destroy) roleSelect.destroy();
    roleSelect = RoleSelect.mount({
      root: homeEl(),
      onEnter: function (id) {
        if (location.hash !== "#/" + id) {
          location.hash = "#/" + id;
        } else {
          enterRoadmap(id);
        }
      },
    });
  }

  function boot() {
    if (!window.ROADMAP_CATALOG || !window.ROADMAP_CATALOG.length) {
      homeEl().innerHTML =
        '<p class="roadmap-error" style="margin:24px">路线图配置未加载，请检查 js/roadmaps.js</p>';
      return;
    }

    initRoleSelect();
    document.getElementById("back-btn").addEventListener("click", function () {
      location.hash = "";
    });
    window.addEventListener("hashchange", onRouteChange);

    var id = getRouteId();
    if (id) {
      homeEl().hidden = true;
      roadmapEl().hidden = false;
      showRoadmap(id);
    } else {
      showHome(false);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
