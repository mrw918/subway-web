/**
 * 知识路线图 SPA：首页选择 + 路线图展示
 */
(function () {
  var loading = false;

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
        "：本地服务未响应。请确认终端里 python -m http.server 5173 正在运行，然后刷新页面重试。"
      );
    }
    return msg;
  }

  function showHome() {
    document.getElementById("home-view").hidden = false;
    document.getElementById("roadmap-view").hidden = true;
    document.getElementById("roadmap-error").hidden = true;
    document.title = "知识路线图";
  }

  function showError(message) {
    var el = document.getElementById("roadmap-error");
    el.textContent = message;
    el.hidden = false;
  }

  async function showRoadmap(id) {
    var item = findRoadmap(id);
    if (!item) {
      showHome();
      return;
    }

    if (location.protocol === "file:") {
      showHome();
      alert("请通过本地服务器打开页面（例如：python -m http.server 5173），直接双击 html 无法加载 SVG。");
      return;
    }

    document.getElementById("home-view").hidden = true;
    document.getElementById("roadmap-view").hidden = false;
    document.getElementById("roadmap-title").textContent = item.title;
    document.getElementById("roadmap-error").hidden = true;
    document.title = item.title + " · 知识路线图";

    var stage = document.getElementById("roadmap-stage");
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

      SvgNodeHoverCard.mount({
        stage: stage,
        svg: svg,
        data: data,
      });
    } catch (err) {
      console.error(err);
      document.getElementById("home-view").hidden = true;
      document.getElementById("roadmap-view").hidden = false;
      showError(formatLoadError(err, item.svgFile));
      stage.innerHTML = "";
    } finally {
      loading = false;
    }
  }

  function navigateTo(id, pushHash) {
    if (pushHash !== false) {
      if (id) location.hash = "#/" + id;
      else location.hash = "";
    }
    if (id) showRoadmap(id);
    else showHome();
  }

  function initHome() {
    var list = document.getElementById("role-list");
    list.innerHTML = "";
    (window.ROADMAP_CATALOG || []).forEach(function (item) {
      var li = document.createElement("li");
      var link = document.createElement("a");
      link.className = "role-link";
      link.href = "#/" + item.id;
      link.textContent = item.title;
      link.addEventListener("click", function (event) {
        event.preventDefault();
        navigateTo(item.id);
      });
      li.appendChild(link);
      list.appendChild(li);
    });
  }

  function onRouteChange() {
    if (loading) return;
    var id = getRouteId();
    navigateTo(id, false);
  }

  function boot() {
    if (!window.ROADMAP_CATALOG || !window.ROADMAP_CATALOG.length) {
      document.getElementById("role-list").innerHTML =
        '<li class="roadmap-error">路线图配置未加载，请检查 js/roadmaps.js</li>';
      return;
    }

    initHome();
    document.getElementById("back-btn").addEventListener("click", function () {
      navigateTo(null);
    });
    window.addEventListener("hashchange", onRouteChange);
    onRouteChange();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
