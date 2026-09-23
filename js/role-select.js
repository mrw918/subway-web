/**
 * 选角页：中央人物固定 + 7 头像圆弧传送带（无克隆节点）
 */
(function (global) {
  var SLIDE_MS = 420;
  var HERO_REF_HEIGHT = 880;
  var HERO_SIZE_BOOST = 1;
  var LAYOUT_RESIZE_MS = 80;

  function sortedCatalog() {
    return (global.ROADMAP_CATALOG || [])
      .slice()
      .sort(function (a, b) {
        return (a.homeOrder != null ? a.homeOrder : 99) - (b.homeOrder != null ? b.homeOrder : 99);
      });
  }

  function assetUrl(path, version) {
    var basePath = location.pathname.replace(/[^/]*$/, "");
    var url =
      location.origin +
      basePath +
      String(path || "")
        .split("/")
        .map(function (part) {
          return encodeURIComponent(part);
        })
        .join("/");
    if (version) url += (url.indexOf("?") >= 0 ? "&" : "?") + "v=" + version;
    return url;
  }

  function wrapIndex(index, length) {
    return ((index % length) + length) % length;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function parsePx(value) {
    var n = parseFloat(value);
    return isNaN(n) ? 0 : n;
  }

  function parseShiftPx(value) {
    if (value == null) return 0;
    if (typeof value === "number") return value;
    return parsePx(String(value));
  }

  function mount(options) {
    options = options || {};
    var root = options.root;
    var onEnter = options.onEnter;
    if (!root) return null;

    var roles = sortedCatalog();
    if (!roles.length) return null;

    var count = roles.length;
    var selectedIndex = 0;
    var animating = false;
    var detailChevron =
      '<svg class="role-select__detail-chevron" width="10" height="14" viewBox="0 0 10 14" aria-hidden="true">' +
      '<path d="M2 1.5 L8 7 L2 12.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="butt" stroke-linejoin="miter"/>' +
      "</svg>";

    root.innerHTML =
      '<div class="role-select__scene">' +
      '  <div class="role-select__logo" aria-label="VECTOR">' +
      '    <img class="role-select__logo-mark" src="./assets/vector-logo-red.png" alt="VECTOR" width="160" height="36" decoding="async" />' +
      "  </div>" +
      '  <div class="role-select__aside">' +
      '    <div class="role-select__title" aria-live="polite">' +
      '      <h1 class="role-select__title-zh"></h1>' +
      '      <p class="role-select__title-en"></p>' +
      '      <button type="button" class="role-select__details-toggle" aria-label="查看角色详情" aria-expanded="false">' +
      "        查看详情" +
      "      </button>" +
      "    </div>" +
      "  </div>" +
      '  <dl class="role-select__details role-select__details--desktop" aria-live="polite">' +
      '    <div class="role-select__detail-item">' +
      '      <dt class="role-select__detail-label">' +
      detailChevron +
      "核心方向</dt>" +
      '      <dd class="role-select__detail-value" data-detail="focus"></dd>' +
      "    </div>" +
      '    <div class="role-select__detail-item">' +
      '      <dt class="role-select__detail-label">' +
      detailChevron +
      "关键技能</dt>" +
      '      <dd class="role-select__detail-value" data-detail="skills"></dd>' +
      "    </div>" +
      '    <div class="role-select__detail-item">' +
      '      <dt class="role-select__detail-label">' +
      detailChevron +
      "角色使命</dt>" +
      '      <dd class="role-select__detail-value" data-detail="mission"></dd>' +
      "    </div>" +
      '    <button type="button" class="role-select__detail-item role-select__detail-item--link" data-open-training>' +
      '      <span class="role-select__detail-label">' +
      detailChevron +
      "更多资讯</span>" +
      '      <span class="role-select__detail-value">直播课 / 公开课</span>' +
      "    </button>" +
      "  </dl>" +
      '  <div class="role-select__main">' +
      '    <div class="role-select__watermark" aria-hidden="true"></div>' +
      '    <div class="role-select__hero-stage"></div>' +
      "  </div>" +
      '  <footer class="role-select__footer">' +
      '    <div class="role-select__avatar-track">' +
      '      <svg class="role-select__orbit" viewBox="0 0 820 80" aria-hidden="true">' +
      '        <ellipse cx="410" cy="62" rx="390" ry="28" fill="none" stroke="rgba(210, 214, 222, 0.42)" stroke-width="1.2"/>' +
      '        <ellipse cx="410" cy="62" rx="340" ry="22" fill="none" stroke="rgba(220, 224, 232, 0.58)" stroke-width="1"/>' +
      '        <ellipse cx="410" cy="62" rx="290" ry="16" fill="none" stroke="rgba(230, 234, 240, 0.74)" stroke-width="0.9"/>' +
      '        <ellipse cx="410" cy="62" rx="240" ry="10" fill="none" stroke="rgba(240, 242, 246, 0.9)" stroke-width="0.8"/>' +
      "      </svg>" +
      '      <button type="button" class="role-select__nav role-select__nav--prev" aria-label="上一个角色">' +
      '        <svg class="role-select__nav-icon" width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">' +
      '          <path d="M8 1L2 8l6 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      "        </svg>" +
      "      </button>" +
      '      <div class="role-select__avatar-viewport">' +
      '        <div class="role-select__focus-slot" aria-hidden="true"></div>' +
      '        <ul class="role-select__avatars" role="tablist"></ul>' +
      "      </div>" +
      '      <button type="button" class="role-select__nav role-select__nav--next" aria-label="下一个角色">' +
      '        <svg class="role-select__nav-icon" width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">' +
      '          <path d="M2 1l6 7-6 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      "        </svg>" +
      "      </button>" +
      "    </div>" +
      '    <button type="button" class="role-select__entre">ENTER</button>' +
      "  </footer>" +
      '  <div class="role-select__sheet-backdrop" hidden></div>' +
      '  <aside class="role-select__sheet" role="dialog" aria-modal="true" aria-label="角色详情" hidden>' +
      '    <div class="role-select__sheet-handle" aria-hidden="true"></div>' +
      '    <div class="role-select__sheet-header">' +
      '      <div class="role-select__sheet-title">' +
      '        <h2 class="role-select__sheet-title-zh"></h2>' +
      '        <p class="role-select__sheet-title-en"></p>' +
      "      </div>" +
      '      <button type="button" class="role-select__sheet-close" aria-label="关闭详情">' +
      '        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">' +
      '          <path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      "        </svg>" +
      "      </button>" +
      "    </div>" +
      '    <dl class="role-select__details role-select__details--sheet" aria-live="polite">' +
      '      <div class="role-select__detail-item">' +
      '        <dt class="role-select__detail-label">' +
      detailChevron +
      "核心方向</dt>" +
      '        <dd class="role-select__detail-value" data-detail="focus"></dd>' +
      "      </div>" +
      '      <div class="role-select__detail-item">' +
      '        <dt class="role-select__detail-label">' +
      detailChevron +
      "关键技能</dt>" +
      '        <dd class="role-select__detail-value" data-detail="skills"></dd>' +
      "      </div>" +
      '      <div class="role-select__detail-item">' +
      '        <dt class="role-select__detail-label">' +
      detailChevron +
      "角色使命</dt>" +
      '        <dd class="role-select__detail-value" data-detail="mission"></dd>' +
      "      </div>" +
      '      <button type="button" class="role-select__detail-item role-select__detail-item--link" data-open-training>' +
      '        <span class="role-select__detail-label">' +
      detailChevron +
      "更多资讯</span>" +
      '        <span class="role-select__detail-value">直播课 / 公开课</span>' +
      "      </button>" +
      "    </dl>" +
      "  </aside>" +
      '  <div class="role-select__training-backdrop" data-training-backdrop hidden></div>' +
      '  <div class="role-select__training-modal" role="dialog" aria-modal="true" aria-label="培训资讯" data-training-modal hidden>' +
      '    <div class="role-select__training-head">' +
      '      <div class="role-select__training-head-text">' +
      '        <h3 class="role-select__training-title"></h3>' +
      "      </div>" +
      '      <button type="button" class="role-select__training-close" aria-label="关闭培训资讯" data-training-close>' +
      '        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">' +
      '          <path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      "        </svg>" +
      "      </button>" +
      "    </div>" +
      '    <div class="role-select__training-tabs" role="tablist" data-training-tabs></div>' +
      '    <div class="role-select__training-body" data-training-body></div>' +
      "  </div>" +
      "</div>";

    var watermarkEl = root.querySelector(".role-select__watermark");
    var titleZhEl = root.querySelector(".role-select__title-zh");
    var titleEnEl = root.querySelector(".role-select__title-en");
    var sheetTitleZhEl = root.querySelector(".role-select__sheet-title-zh");
    var sheetTitleEnEl = root.querySelector(".role-select__sheet-title-en");
    var detailsToggleBtn = root.querySelector(".role-select__details-toggle");
    var sheetEl = root.querySelector(".role-select__sheet");
    var sheetBackdrop = root.querySelector(".role-select__sheet-backdrop");
    var sheetCloseBtn = root.querySelector(".role-select__sheet-close");
    var detailEls = {
      focus: root.querySelectorAll('[data-detail="focus"]'),
      skills: root.querySelectorAll('[data-detail="skills"]'),
      mission: root.querySelectorAll('[data-detail="mission"]'),
    };
    var mainEl = root.querySelector(".role-select__main");
    var heroStage = root.querySelector(".role-select__hero-stage");
    var avatarViewport = root.querySelector(".role-select__avatar-viewport");
    var avatarList = root.querySelector(".role-select__avatars");
    var prevBtn = root.querySelector(".role-select__nav--prev");
    var nextBtn = root.querySelector(".role-select__nav--next");
    var entreBtn = root.querySelector(".role-select__entre");
    var footerEl = root.querySelector(".role-select__footer");
    var sheetOpen = false;
    var trainingOpen = false;
    var trainingBackdrop = root.querySelector("[data-training-backdrop]");
    var trainingModal = root.querySelector("[data-training-modal]");
    var trainingTabsEl = root.querySelector("[data-training-tabs]");
    var trainingBody = root.querySelector("[data-training-body]");
    var trainingTitleEl = root.querySelector(".role-select__training-title");
    var trainingCloseBtn = root.querySelector("[data-training-close]");
    var trainingOpenBtns = root.querySelectorAll("[data-open-training]");
    var trainingActiveTab = "live";
    var layoutHeroLift = 0;
    var layoutResizeTimer = null;
    var layoutObserver = null;
    var layoutAvatarMetrics = null;
    var heroDimCache = {};

    function isMobileLayout() {
      return window.matchMedia("(max-width: 768px)").matches;
    }

    function computeAvatarMetrics(viewportW, mobile, isTv) {
      var vw = viewportW || window.innerWidth;
      var baseSize = mobile
        ? clamp(vw * 0.092, 40, 54)
        : isTv
          ? clamp(vw * 0.108, 76, 100)
          : clamp(vw * 0.108, 46, 74);
      var radiusX = Math.min(vw * 0.48, isTv ? 460 : mobile ? vw * 0.5 : 320);
      var radiusY = Math.min(isTv ? 32 : mobile ? 20 : 22, vw * 0.038);
      return { baseSize: baseSize, radiusX: radiusX, radiusY: radiusY };
    }

    function isTvViewport(w) {
      return (w || window.innerWidth) >= 1920;
    }

    function computeHeroNormScale(naturalH) {
      if (!naturalH) return 1;
      return clamp((HERO_REF_HEIGHT / naturalH) * HERO_SIZE_BOOST, 0.96, 1.08);
    }

    function cacheHeroDimensions(role, w, h) {
      if (!role || !h) return;
      heroDimCache[role.id] = {
        w: w,
        h: h,
        scale: computeHeroNormScale(h),
      };
    }

    function preloadHeroDimensions(catalog) {
      catalog.forEach(function (role) {
        if (heroDimCache[role.id]) return;
        var img = new Image();
        img.onload = function () {
          cacheHeroDimensions(role, img.naturalWidth, img.naturalHeight);
          if (roles[selectedIndex] && roles[selectedIndex].id === role.id) {
            applyHeroScale(role);
          }
        };
        img.src = assetUrl(role.heroImage, role.heroVersion);
      });
    }

    function computeHeroFeetOverlap(bottom, mobile) {
      var feetClear = mobile ? 6 : 10;
      var railY = bottom.footerPad + bottom.trackBlock * 0.52;
      return clamp(railY - feetClear, mobile ? 28 : 36, mobile ? 68 : 96);
    }

    function computeBottomCluster(w, h, safeBottom, mobile, avatarMetrics, tv) {
      var wideT = mobile ? 0 : clamp((w - 769) / (1920 - 769), 0, 1);
      var trackBlock = clamp(
        avatarMetrics.baseSize + (mobile ? 40 : 44 + wideT * 12),
        mobile ? 96 : 124,
        mobile ? 132 : 184
      );
      var entreBlock = mobile
        ? clamp(44 + w * 0.008, 44, 50)
        : clamp(50 + wideT * 18, 50, 68);
      var footerGap = clamp(h * 0.012, 10, 16);
      var footerPad = clamp(h * 0.005, 3, 8);
      var footerEdge = safeBottom + clamp(h * 0.006, 4, 8);
      var footerLift = clamp(h * 0.032, mobile ? 22 : 16, mobile ? 36 : 28);
      if (!mobile) footerLift = Math.max(8, footerLift - 12);
      var orbitW = Math.min(w * 0.92, tv ? 1060 : mobile ? 520 : 760);
      var orbitH = clamp(trackBlock * 0.46, 44, mobile ? 56 : 90);
      var avatarViewportH = clamp(avatarMetrics.baseSize + 28, 80, mobile ? 104 : 152);
      var footerClusterH = trackBlock + footerGap + entreBlock + footerPad;
      return {
        trackBlock: trackBlock,
        entreBlock: entreBlock,
        footerGap: footerGap,
        footerPad: footerPad,
        footerEdge: footerEdge,
        footerLift: footerLift,
        orbitW: orbitW,
        orbitH: orbitH,
        avatarViewportH: avatarViewportH,
        footerClusterH: footerClusterH,
      };
    }

    function applyBottomClusterVars(metrics) {
      root.style.setProperty("--track-block", metrics.trackBlock + "px");
      root.style.setProperty("--entre-block", metrics.entreBlock + "px");
      root.style.setProperty("--layout-footer-gap", metrics.footerGap + "px");
      root.style.setProperty("--layout-footer-pad-bottom", metrics.footerPad + "px");
      root.style.setProperty("--layout-footer-bottom", metrics.footerEdge + "px");
      root.style.setProperty("--layout-footer-lift", metrics.footerLift + "px");
      root.style.setProperty("--layout-orbit-w", metrics.orbitW + "px");
      root.style.setProperty("--layout-orbit-h", metrics.orbitH + "px");
      root.style.setProperty("--layout-avatar-viewport-h", metrics.avatarViewportH + "px");
    }

    function applyTitleBandCenter(w, safeLeft, safeRight, mobile, heroHalf, heroClearHalf) {
      var bandLeft = mobile ? Math.max(24, 16 + safeLeft) : Math.max(28, 12 + safeLeft);
      var clearHalf = heroClearHalf != null ? heroClearHalf : heroHalf;
      var bandRight = mobile
        ? w - Math.max(168, 152 + safeRight)
        : w * 0.5 - clearHalf - 8;
      if (bandRight <= bandLeft) bandRight = bandLeft + 120;
      var bandWidth = bandRight - bandLeft;
      var centerBias = mobile ? 0.5 : 0.62;
      var centerX = bandLeft + bandWidth * centerBias;
      root.style.setProperty("--layout-title-center-x", centerX + "px");
    }

    function clearLayoutVars() {
      root.classList.remove("role-select--layout-auto");
      layoutHeroLift = 0;
      layoutAvatarMetrics = null;
      [
        "--layout-hero-w",
        "--layout-hero-max-h",
        "--layout-hero-h",
        "--layout-aside-top",
        "--layout-title-center-x",
        "--layout-hero-half",
        "--layout-details-top",
        "--layout-details-offset",
        "--layout-edge-inset",
        "--layout-logo-top",
        "--layout-logo-w",
        "--layout-detail-label",
        "--layout-detail-value",
        "--layout-footer-gap",
        "--layout-footer-pad-bottom",
        "--layout-footer-bottom",
        "--layout-footer-lift",
        "--layout-orbit-w",
        "--layout-orbit-h",
        "--layout-avatar-viewport-h",
      ].forEach(function (name) {
        root.style.removeProperty(name);
      });
    }

    function applyViewportLayout() {
      var mobile = isMobileLayout();
      var w = window.innerWidth;
      var h = window.innerHeight;
      var styles = getComputedStyle(root);
      var safeTop = parsePx(styles.getPropertyValue("--safe-top"));
      var safeBottom = parsePx(styles.getPropertyValue("--safe-bottom"));
      var safeLeft = parsePx(styles.getPropertyValue("--safe-left"));
      var safeRight = parsePx(styles.getPropertyValue("--safe-right"));
      var avatarVw = avatarViewport ? avatarViewport.clientWidth || w : w;
      var tv = isTvViewport(w);

      layoutAvatarMetrics = computeAvatarMetrics(avatarVw, mobile, tv);
      var bottom = computeBottomCluster(w, h, safeBottom, mobile, layoutAvatarMetrics, tv);
      applyBottomClusterVars(bottom);

      var footerReserve =
        bottom.footerClusterH + bottom.footerLift + bottom.footerEdge;
      var usableH = Math.max(280, h - footerReserve - safeTop);

      root.classList.add("role-select--layout-auto");

      if (mobile) {
        var heroW = clamp(w * 0.94, 320, 440);
        var heroH = clamp(usableH * 0.76, 340, 600);
        var heroOverlap = computeHeroFeetOverlap(bottom, true);
        layoutHeroLift = 0;

        root.style.setProperty("--hero-overlap", heroOverlap + "px");
        root.style.setProperty("--layout-hero-w", heroW + "px");
        root.style.setProperty("--layout-hero-half", heroW * 0.5 + "px");
        root.style.setProperty("--layout-hero-h", heroH + "px");
        root.style.setProperty("--layout-hero-max-h", heroH + "px");
      } else {
        var wideT = clamp((w - 769) / (1920 - 769), 0, 1);
        var heroW = clamp(w * 0.36 + 96, 480, 720);
        var heroMaxH = clamp(usableH * 0.92, 540, 920);
        var heroOverlap = computeHeroFeetOverlap(bottom, false);
        layoutHeroLift = 0;
        var heroClearHalf = clamp(heroW * 0.43, 190, 300);
        var anchorY = safeTop + usableH * 0.44;
        var edgeInset = clamp(w * 0.026, 32, 56);
        var detailsOffset = clamp(heroW * 0.5 + 36, 240, 360);
        var logoW = clamp(148 + w * 0.038, 168, 220);
        var logoTop = clamp(18 + w * 0.006, 22, 34);
        var detailLabel = clamp(15 + wideT * 9, 16, 24);
        var detailValue = clamp(14 + wideT * 6, 14, 20);

        root.style.setProperty("--hero-overlap", heroOverlap + "px");
        root.style.setProperty("--hero-clear-half", heroClearHalf + "px");
        root.style.setProperty("--layout-hero-w", heroW + "px");
        root.style.setProperty("--layout-hero-half", heroW * 0.5 + "px");
        root.style.setProperty("--layout-hero-max-h", heroMaxH + "px");
        root.style.removeProperty("--layout-hero-h");
        root.style.setProperty("--layout-aside-top", anchorY + "px");
        root.style.setProperty("--layout-details-top", anchorY - 10 + "px");
        root.style.setProperty("--layout-details-offset", detailsOffset + "px");
        root.style.setProperty("--layout-edge-inset", edgeInset + "px");
        root.style.setProperty("--layout-logo-top", logoTop + "px");
        root.style.setProperty("--layout-logo-w", logoW + "px");
        root.style.setProperty("--layout-detail-label", detailLabel + "px");
        root.style.setProperty("--layout-detail-value", detailValue + "px");
      }

      var heroHalfPx =
        parsePx(root.style.getPropertyValue("--layout-hero-half")) ||
        (mobile ? w * 0.42 : w * 0.25);
      var heroClearHalfPx =
        parsePx(root.style.getPropertyValue("--hero-clear-half")) || heroHalfPx * 0.86;
      applyTitleBandCenter(w, safeLeft, safeRight, mobile, heroHalfPx, heroClearHalfPx);

      var role = roles[selectedIndex];
      if (role) applyHeroLayout(role);
      layoutAvatars(false);
    }

    function applyHeroScale(role) {
      if (!role) return;
      var adj = (role && role.heroAdjust) || {};
      var manual = adj.scale != null ? adj.scale : 1;
      var cached = heroDimCache[role.id];
      var scale = cached ? cached.scale : 1;
      heroStage.style.setProperty("--hero-scale", String(scale * manual));
    }

    function renderTrainingPlaceBadge(place) {
      if (!place) return "";
      return (
        '<span class="role-select__training-badge">' + escapeHtml(place) + "</span>"
      );
    }

    function renderTrainingList(section, tabKey) {
      if (!section) {
        return '<p class="role-select__training-empty">暂无课程</p>';
      }
      var items = section.items || [];
      if (!items.length) {
        return '<p class="role-select__training-empty">暂无课程</p>';
      }
      var list = items
        .map(function (item) {
          var paid = item.paid
            ? '<span class="role-select__training-badge role-select__training-badge--paid">付费</span>'
            : "";
          var titleText = escapeHtml(item.title || "");
          var inner =
            '<div class="role-select__training-card-top">' +
            '<span class="role-select__training-date">' +
            escapeHtml(item.date || "") +
            "</span>" +
            renderTrainingPlaceBadge(item.place) +
            paid +
            "</div>" +
            '<div class="role-select__training-card-bottom">' +
            '<span class="role-select__training-course">' +
            titleText +
            "</span>" +
            '<span class="role-select__training-arrow" aria-hidden="true">' +
            (item.url ? "→" : "") +
            "</span>" +
            "</div>";
          if (item.url) {
            return (
              '<li class="role-select__training-item">' +
              '<a class="role-select__training-card" href="' +
              escapeHtml(item.url) +
              '" target="_blank" rel="noopener noreferrer">' +
              inner +
              "</a></li>"
            );
          }
          return (
            '<li class="role-select__training-item">' +
            '<div class="role-select__training-card is-plain">' +
            inner +
            "</div></li>"
          );
        })
        .join("");
      return '<ul class="role-select__training-list">' + list + "</ul>";
    }

    function getTrainingSection(tabKey) {
      var data = global.TRAINING_EVENTS || {};
      if (tabKey === "open") return data.open;
      return data.live;
    }

    function renderTrainingTabs() {
      if (!trainingTabsEl) return;
      var data = global.TRAINING_EVENTS || {};
      var tabs = [
        { key: "live", label: (data.live && data.live.label) || "直播课" },
        { key: "open", label: (data.open && data.open.label) || "公开课" },
      ];
      trainingTabsEl.innerHTML = tabs
        .map(function (tab) {
          var isActive = tab.key === trainingActiveTab;
          return (
            '<button type="button" class="role-select__training-tab' +
            (isActive ? " is-active" : "") +
            '" role="tab" aria-selected="' +
            (isActive ? "true" : "false") +
            '" data-training-tab="' +
            escapeHtml(tab.key) +
            '">' +
            escapeHtml(tab.label) +
            "</button>"
          );
        })
        .join("");
    }

    function renderTrainingBody() {
      if (!trainingBody) return;
      trainingBody.innerHTML = renderTrainingList(
        getTrainingSection(trainingActiveTab),
        trainingActiveTab
      );
    }

    function setTrainingTab(tabKey) {
      if (tabKey !== "live" && tabKey !== "open") return;
      trainingActiveTab = tabKey;
      renderTrainingTabs();
      renderTrainingBody();
    }

    function fillTrainingModal() {
      var data = global.TRAINING_EVENTS || {};
      if (trainingTitleEl) {
        trainingTitleEl.textContent = data.title || "了解最新培训资讯";
      }
      renderTrainingTabs();
      renderTrainingBody();
    }

    function setTrainingOpen(open) {
      trainingOpen = !!open;
      if (!trainingModal || !trainingBackdrop) return;
      if (trainingOpen) {
        trainingActiveTab = "live";
        fillTrainingModal();
        trainingModal.hidden = false;
        trainingBackdrop.hidden = false;
        requestAnimationFrame(function () {
          trainingModal.classList.add("is-open");
          trainingBackdrop.classList.add("is-open");
        });
      } else {
        trainingModal.classList.remove("is-open");
        trainingBackdrop.classList.remove("is-open");
        trainingModal.hidden = true;
        trainingBackdrop.hidden = true;
      }
    }

    var heroA = document.createElement("img");
    var heroB = document.createElement("img");
    heroA.className = "role-select__hero is-active";
    heroB.className = "role-select__hero";
    heroA.alt = "";
    heroB.alt = "";
    heroA.draggable = false;
    heroB.draggable = false;
    heroStage.appendChild(heroA);
    heroStage.appendChild(heroB);
    var activeHero = heroA;
    var idleHero = heroB;

    function onHeroImgLoad(event) {
      var img = event.currentTarget;
      var roleId = img.dataset.roleId;
      var role =
        roles.find(function (r) {
          return r.id === roleId;
        }) || roles[selectedIndex];
      if (!role) return;
      cacheHeroDimensions(role, img.naturalWidth, img.naturalHeight);
      if (role.id === (roles[selectedIndex] && roles[selectedIndex].id)) {
        applyHeroScale(role);
      }
    }
    heroA.addEventListener("load", onHeroImgLoad);
    heroB.addEventListener("load", onHeroImgLoad);

    var avatarButtons = [];

    roles.forEach(function (role, logicalIndex) {
      var li = document.createElement("li");
      li.className = "role-select__avatar-item";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "role-select__avatar-btn";
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", role.title);
      btn.dataset.index = String(logicalIndex);

      var img = document.createElement("img");
      img.src = assetUrl(role.avatarImage, role.avatarVersion);
      img.alt = role.title;
      img.draggable = false;
      btn.appendChild(img);
      btn.addEventListener("click", function () {
        goToIndex(logicalIndex);
      });
      li.appendChild(btn);
      avatarList.appendChild(li);
      avatarButtons.push({ li: li, btn: btn, index: logicalIndex });
    });

    function applyHeroLayout(role) {
      var adj = (role && role.heroAdjust) || {};
      heroStage.dataset.role = (role && role.id) || "";
      applyHeroScale(role);
      heroStage.style.setProperty("--hero-shift-x", adj.x != null ? String(adj.x) : "0px");
      heroStage.style.setProperty(
        "--hero-shift-y",
        -layoutHeroLift + parseShiftPx(adj.y) + "px"
      );
      heroStage.style.setProperty(
        "--hero-object-position",
        (role && role.heroObjectPosition) || "bottom center"
      );
    }

    function applyRoleTitle(role, animate) {
      var zh = (role && role.title) || "";
      var en = (role && role.titleEn) || "";
      var titleBlock = titleZhEl && titleZhEl.closest(".role-select__title");

      function writeTitle() {
        titleZhEl.textContent = zh;
        titleEnEl.textContent = en;
        if (sheetTitleZhEl) sheetTitleZhEl.textContent = zh;
        if (sheetTitleEnEl) sheetTitleEnEl.textContent = en;
      }

      if (animate && titleBlock) {
        titleBlock.classList.add("is-fading");
        window.setTimeout(function () {
          writeTitle();
          titleBlock.classList.remove("is-fading");
        }, 180);
        return;
      }
      writeTitle();
    }

    function countStations(role) {
      if (!role || !role.dataKey) return "—";
      var data = global[role.dataKey];
      if (!data) return "—";
      var n = Object.keys(data).length;
      return n ? String(n) : "—";
    }

    function countPaths(role) {
      if (!role) return "—";
      if (role.pathCount != null) return String(role.pathCount);
      if (role.details && role.details.paths != null) {
        return String(role.details.paths);
      }
      var presets = (global.ROUTE_PRESETS || {})[role.id];
      if (presets && Object.keys(presets).length) {
        return String(Object.keys(presets).length);
      }
      return "—";
    }

    function applyRoleDetails(role) {
      var details = (role && role.details) || {};
      var values = {
        focus: details.focus || "",
        skills: details.skills || "",
        mission: details.mission || "",
      };
      Object.keys(detailEls).forEach(function (key) {
        var nodes = detailEls[key];
        if (!nodes) return;
        for (var i = 0; i < nodes.length; i++) {
          nodes[i].textContent = values[key] || "";
        }
      });
    }

    function applyRoleMeta(role, animateTitle) {
      applyRoleTitle(role, animateTitle);
      applyRoleDetails(role);
    }

    function setSheetOpen(open) {
      sheetOpen = !!open;
      if (!sheetEl || !sheetBackdrop || !detailsToggleBtn) return;
      detailsToggleBtn.setAttribute("aria-expanded", sheetOpen ? "true" : "false");
      root.classList.toggle("role-select--sheet-open", sheetOpen);
      if (sheetOpen) {
        sheetEl.hidden = false;
        sheetBackdrop.hidden = false;
        requestAnimationFrame(function () {
          sheetEl.classList.add("is-open");
          sheetBackdrop.classList.add("is-open");
        });
      } else {
        sheetEl.classList.remove("is-open");
        sheetBackdrop.classList.remove("is-open");
        window.setTimeout(function () {
          if (!sheetOpen) {
            sheetEl.hidden = true;
            sheetBackdrop.hidden = true;
          }
        }, 320);
      }
    }

    function setHeroImmediate(role) {
      activeHero.dataset.roleId = role.id;
      activeHero.src = assetUrl(role.heroImage, role.heroVersion);
      activeHero.alt = role.title;
      activeHero.className = "role-select__hero is-active";
      idleHero.className = "role-select__hero";
      idleHero.removeAttribute("src");
      applyHeroLayout(role);
      watermarkEl.textContent = role.watermark || role.title || "";
      applyRoleMeta(role, false);
    }

    function crossfadeHero(role) {
      idleHero.dataset.roleId = role.id;
      idleHero.src = assetUrl(role.heroImage, role.heroVersion);
      idleHero.alt = role.title;
      idleHero.className = "role-select__hero is-enter";
      applyHeroLayout(role);
      watermarkEl.textContent = role.watermark || role.title || "";
      applyRoleMeta(role, true);

      activeHero.classList.remove("is-active");
      activeHero.classList.add("is-leave");

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          idleHero.classList.add("is-active");
          idleHero.classList.remove("is-enter");
        });
      });

      window.setTimeout(function () {
        activeHero.className = "role-select__hero";
        activeHero.removeAttribute("src");
        var tmp = activeHero;
        activeHero = idleHero;
        idleHero = tmp;
      }, SLIDE_MS);
    }

    /**
     * slotOffset: -3..+3 relative to center.
     * For 7 items, center slot is 0; left are negative, right positive.
     */
    function layoutAvatars(animate) {
      var vw = avatarViewport.clientWidth || 720;
      var mobile = isMobileLayout();
      var tv = isTvViewport();
      var metrics =
        layoutAvatarMetrics || computeAvatarMetrics(vw, mobile, tv);
      var baseSize = metrics.baseSize;
      var radiusX = metrics.radiusX;
      var radiusY = metrics.radiusY;
      var half = Math.floor(count / 2);
      var stepX = half === 0 ? 0 : radiusX / half;

      avatarButtons.forEach(function (item) {
        var slot = wrapIndex(item.index - selectedIndex + half, count) - half;
        if (slot > half) slot -= count;
        if (slot < -half) slot += count;

        var prevSlot = item.slot;
        var wraps =
          prevSlot != null &&
          Math.abs(slot - prevSlot) > half;
        item.slot = slot;

        var t = half === 0 ? 0 : slot / half;
        var x = slot * stepX;
        // U 形：中间低、两侧高（CSS y 向下为正）
        var y = (Math.cos(Math.abs(t) * Math.PI * 0.5) - 1) * radiusY;
        var dist = Math.abs(slot);
        var scale = dist === 0
          ? mobile ? 1.08 : 1.18
          : Math.max(mobile ? 0.52 : 0.56, 1 - dist * (mobile ? 0.16 : 0.14));
        var opacity = dist === 0 ? 1 : Math.max(0.28, 0.72 - dist * 0.12);
        var gray = dist === 0 ? 0 : Math.min(100, 45 + dist * 18);
        var z = 20 - dist;

        item.li.style.transition =
          animate && !wraps
            ? "transform " +
              SLIDE_MS +
              "ms cubic-bezier(0.4, 0, 0.2, 1), opacity " +
              SLIDE_MS +
              "ms ease, filter " +
              SLIDE_MS +
              "ms ease"
            : "none";
        item.li.style.width = baseSize + "px";
        item.li.style.height = baseSize + "px";
        item.li.style.transform =
          "translate(-50%, -50%) translate(" + x + "px, " + y + "px) scale(" + scale + ")";
        item.li.style.opacity = String(opacity);
        item.li.style.zIndex = String(z);
        item.li.style.filter = "grayscale(" + gray + "%)";
        item.btn.classList.toggle("is-selected", slot === 0);
        item.btn.setAttribute("aria-selected", slot === 0 ? "true" : "false");
      });
    }

    function goToIndex(nextIndex) {
      nextIndex = wrapIndex(nextIndex, count);
      if (animating || nextIndex === selectedIndex) return;
      animating = true;
      selectedIndex = nextIndex;
      layoutAvatars(true);
      crossfadeHero(roles[selectedIndex]);
      window.setTimeout(function () {
        animating = false;
      }, SLIDE_MS + 20);
    }

    function step(delta) {
      goToIndex(selectedIndex + delta);
    }

    prevBtn.addEventListener("click", function () {
      step(-1);
    });
    nextBtn.addEventListener("click", function () {
      step(1);
    });

    // 手机端人物主区左右滑动切换（桌面 main 仍为 pointer-events: none）
    var swipeStartX = 0;
    var swipeStartY = 0;
    var swipeTracking = false;
    var swipePointerId = null;
    var SWIPE_MIN_DX = 36;

    function isMobileSwipeViewport() {
      return isMobileLayout();
    }

    function resetSwipeTracking() {
      swipeTracking = false;
      swipePointerId = null;
    }

    function onSwipePointerDown(event) {
      if (!isMobileSwipeViewport()) return;
      if (sheetOpen || trainingOpen || animating) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      swipeTracking = true;
      swipePointerId = event.pointerId;
      swipeStartX = event.clientX;
      swipeStartY = event.clientY;
      if (mainEl && mainEl.setPointerCapture) {
        try {
          mainEl.setPointerCapture(event.pointerId);
        } catch (err) {
          /* ignore */
        }
      }
    }

    function onSwipePointerUp(event) {
      if (!swipeTracking) return;
      if (swipePointerId != null && event.pointerId !== swipePointerId) return;
      resetSwipeTracking();
      if (sheetOpen || trainingOpen || animating) return;
      var dx = event.clientX - swipeStartX;
      var dy = event.clientY - swipeStartY;
      if (Math.abs(dx) < SWIPE_MIN_DX || Math.abs(dx) < Math.abs(dy) * 0.75) return;
      step(dx < 0 ? 1 : -1);
    }

    function onSwipePointerCancel(event) {
      if (swipePointerId != null && event.pointerId !== swipePointerId) return;
      resetSwipeTracking();
    }

    if (mainEl) {
      mainEl.addEventListener("pointerdown", onSwipePointerDown);
      mainEl.addEventListener("pointerup", onSwipePointerUp);
      mainEl.addEventListener("pointercancel", onSwipePointerCancel);
    }

    entreBtn.addEventListener("click", function () {
      if (animating) return;
      var role = roles[selectedIndex];
      if (role && onEnter) onEnter(role.id);
    });
    if (detailsToggleBtn) {
      detailsToggleBtn.addEventListener("click", function () {
        setSheetOpen(true);
      });
    }
    if (sheetCloseBtn) {
      sheetCloseBtn.addEventListener("click", function () {
        setSheetOpen(false);
      });
    }
    if (sheetBackdrop) {
      sheetBackdrop.addEventListener("click", function () {
        setSheetOpen(false);
      });
    }

    Array.prototype.forEach.call(trainingOpenBtns, function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        setTrainingOpen(true);
      });
    });
    if (trainingCloseBtn) {
      trainingCloseBtn.addEventListener("click", function () {
        setTrainingOpen(false);
      });
    }
    if (trainingBackdrop) {
      trainingBackdrop.addEventListener("click", function () {
        setTrainingOpen(false);
      });
    }
    if (trainingTabsEl) {
      trainingTabsEl.addEventListener("click", function (event) {
        var tabBtn = event.target.closest("[data-training-tab]");
        if (!tabBtn || !trainingTabsEl.contains(tabBtn)) return;
        event.preventDefault();
        setTrainingTab(tabBtn.getAttribute("data-training-tab"));
      });
    }

    function onKeyDown(event) {
      if (root.hidden) return;
      if (event.key === "Escape" && trainingOpen) {
        event.preventDefault();
        setTrainingOpen(false);
        return;
      }
      if (event.key === "Escape" && sheetOpen) {
        event.preventDefault();
        setSheetOpen(false);
        return;
      }
      if (sheetOpen || trainingOpen) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "Enter") {
        event.preventDefault();
        entreBtn.click();
      }
    }

    function onResize() {
      if (layoutResizeTimer) window.clearTimeout(layoutResizeTimer);
      layoutResizeTimer = window.setTimeout(function () {
        applyViewportLayout();
        layoutAvatars(false);
        if (sheetOpen && !isMobileLayout()) {
          setSheetOpen(false);
        }
      }, LAYOUT_RESIZE_MS);
    }

    if (footerEl && typeof ResizeObserver !== "undefined") {
      layoutObserver = new ResizeObserver(function () {
        onResize();
      });
      layoutObserver.observe(footerEl);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    preloadHeroDimensions(roles);
    setHeroImmediate(roles[selectedIndex]);
    applyViewportLayout();
    requestAnimationFrame(function () {
      applyViewportLayout();
      layoutAvatars(false);
    });

    return {
      getSelectedId: function () {
        return roles[selectedIndex] && roles[selectedIndex].id;
      },
      destroy: function () {
        setTrainingOpen(false);
        setSheetOpen(false);
        if (mainEl) {
          mainEl.removeEventListener("pointerdown", onSwipePointerDown);
          mainEl.removeEventListener("pointerup", onSwipePointerUp);
          mainEl.removeEventListener("pointercancel", onSwipePointerCancel);
        }
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", onResize);
        if (layoutResizeTimer) window.clearTimeout(layoutResizeTimer);
        if (layoutObserver) layoutObserver.disconnect();
        heroA.removeEventListener("load", onHeroImgLoad);
        heroB.removeEventListener("load", onHeroImgLoad);
      },
    };
  }

  global.RoleSelect = { mount: mount, sortedCatalog: sortedCatalog };
})(window);
