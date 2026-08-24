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
        .join("/")
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

      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.display = "block";

      var data = item.dataKey ? window[item.dataKey] || {} : {};
      if (typeof SvgNodeHoverCard === "undefined") {
        throw new Error("悬浮组件未加载，请刷新页面");
      }

      if (typeof SvgRoadmapLayers !== "undefined") {
        SvgRoadmapLayers.restructure(svg);
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
          searchInput: searchInput,
          searchResultsEl: searchResultsEl,
        });
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
