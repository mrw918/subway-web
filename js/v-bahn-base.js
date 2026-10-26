/**
 * 应用根路径：本地 / 与线上 /v-bahn/ 统一解析，避免相对资源与 pathname 截断错位。
 */
(function (global) {
  function normalizeAppBasePath(pathname) {
    var path = String(pathname || "/");
    path = path.replace(/\/index\.html$/i, "/");
    if (/^\/v-bahn$/i.test(path)) {
      return "/v-bahn/";
    }
    if (path === "/" || path.endsWith("/")) {
      return path;
    }
    var last = path.split("/").pop() || "";
    if (last && !/\.[a-zA-Z0-9]{1,8}$/.test(last)) {
      return path + "/";
    }
    return path.replace(/[^/]+$/, "");
  }

  function getAppBasePath() {
    return normalizeAppBasePath(global.location.pathname);
  }

  function resolveAssetUrl(relativePath, version) {
    var base = getAppBasePath();
    var rel = String(relativePath || "")
      .replace(/^\.?\//, "")
      .split("/")
      .filter(function (part) {
        return part.length > 0;
      })
      .map(function (part) {
        return encodeURIComponent(part);
      })
      .join("/");
    var url = global.location.origin + base + rel;
    if (version != null && version !== "") {
      url += (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + encodeURIComponent(String(version));
    }
    return url;
  }

  function installDocumentBase() {
    if (!global.document || !global.document.head) return;
    var href = getAppBasePath();
    var existing = global.document.querySelector("base[data-vbahn-base]");
    if (existing) {
      existing.setAttribute("href", href);
      return;
    }
    var base = global.document.createElement("base");
    base.setAttribute("href", href);
    base.setAttribute("data-vbahn-base", "1");
    global.document.head.insertBefore(base, global.document.head.firstChild);
  }

  global.VBahnBase = {
    normalizeAppBasePath: normalizeAppBasePath,
    getAppBasePath: getAppBasePath,
    resolveAssetUrl: resolveAssetUrl,
    installDocumentBase: installDocumentBase,
  };
})(typeof window !== "undefined" ? window : globalThis);
