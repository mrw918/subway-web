/**
 * D1：本地点击/行为数据（localStorage）+ JSON 导出
 * 不上报服务器；仅本机浏览器，供管理员导出后自行分析。
 */
(function (global) {
  var STORAGE_KEY = "vbahn_analytics_events_v1";
  var MAX_EVENTS = 3000;

  function safeParse(raw) {
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function load() {
    try {
      return safeParse(global.localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return [];
    }
  }

  function save(list) {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      /* 存储满或隐私模式时忽略 */
    }
  }

  function sessionId() {
    try {
      var key = "vbahn_analytics_sid";
      var sid = global.sessionStorage.getItem(key);
      if (sid) return sid;
      sid =
        "s-" +
        Date.now().toString(36) +
        "-" +
        Math.random().toString(36).slice(2, 10);
      global.sessionStorage.setItem(key, sid);
      return sid;
    } catch (e) {
      return "s-anon";
    }
  }

  function normType(type) {
    return String(type || "unknown")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_:-]/g, "_")
      .slice(0, 64);
  }

  function track(type, data) {
    var list = load();
    list.push({
      type: normType(type),
      ts: Date.now(),
      sessionId: sessionId(),
      data: data && typeof data === "object" ? data : {},
    });
    while (list.length > MAX_EVENTS) list.shift();
    save(list);
  }

  function pad2(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function exportFileName() {
    var d = new Date();
    return (
      "v-bahn-events-" +
      d.getFullYear() +
      pad2(d.getMonth() + 1) +
      pad2(d.getDate()) +
      "-" +
      pad2(d.getHours()) +
      pad2(d.getMinutes()) +
      ".json"
    );
  }

  function downloadBlob(filename, text, mime) {
    var blob = new Blob([text], { type: mime || "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 800);
  }

  function buildExportPayload() {
    var events = load();
    var byType = {};
    events.forEach(function (ev) {
      var t = ev.type || "unknown";
      if (!byType[t]) byType[t] = [];
      byType[t].push(ev);
    });
    return {
      exportedAt: new Date().toISOString(),
      userAgent: global.navigator ? global.navigator.userAgent : "",
      totalEvents: events.length,
      byType: byType,
      events: events,
    };
  }

  function exportJson() {
    downloadBlob(exportFileName(), JSON.stringify(buildExportPayload(), null, 2));
  }

  function maybeAutoExportFromQuery() {
    try {
      var qs = new URLSearchParams(global.location.search || "");
      if (qs.get("export") === "1") {
        qs.delete("export");
        var q = qs.toString();
        var url =
          global.location.pathname +
          (q ? "?" + q : "") +
          (global.location.hash || "");
        global.history.replaceState(null, "", url);
        exportJson();
      }
    } catch (e) {
      /* ignore */
    }
  }

  function bindExportHotkey() {
    document.addEventListener("keydown", function (event) {
      if (event.altKey && event.shiftKey && (event.code === "KeyE" || event.key === "E")) {
        event.preventDefault();
        exportJson();
      }
    });
  }

  global.VBahnAnalytics = {
    track: track,
    exportJson: exportJson,
    getEvents: load,
    clear: function () {
      save([]);
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      maybeAutoExportFromQuery();
      bindExportHotkey();
    });
  } else {
    maybeAutoExportFromQuery();
    bindExportHotkey();
  }
})(window);
