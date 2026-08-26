/**
 * 选角页：中央人物固定 + 7 头像圆弧传送带（无克隆节点）
 */
(function (global) {
  var SLIDE_MS = 420;

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
      '        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">' +
      '          <path d="M3 5h12M3 9h12M3 13h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      "        </svg>" +
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
      '      <h3 class="role-select__training-title"></h3>' +
      '      <button type="button" class="role-select__training-close" aria-label="关闭培训资讯" data-training-close>' +
      '        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">' +
      '          <path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
      "        </svg>" +
      "      </button>" +
      "    </div>" +
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
    var heroStage = root.querySelector(".role-select__hero-stage");
    var avatarViewport = root.querySelector(".role-select__avatar-viewport");
    var avatarList = root.querySelector(".role-select__avatars");
    var prevBtn = root.querySelector(".role-select__nav--prev");
    var nextBtn = root.querySelector(".role-select__nav--next");
    var entreBtn = root.querySelector(".role-select__entre");
    var sheetOpen = false;
    var trainingOpen = false;
    var trainingBackdrop = root.querySelector("[data-training-backdrop]");
    var trainingModal = root.querySelector("[data-training-modal]");
    var trainingBody = root.querySelector("[data-training-body]");
    var trainingTitleEl = root.querySelector(".role-select__training-title");
    var trainingCloseBtn = root.querySelector("[data-training-close]");
    var trainingOpenBtns = root.querySelectorAll("[data-open-training]");

    function renderTrainingSection(section) {
      if (!section) return "";
      var items = section.items || [];
      var list = items
        .map(function (item) {
          var meta = [item.date, item.place].filter(Boolean).join(" ");
          var paid = item.paid
            ? '<span class="role-select__training-paid">付费</span>'
            : "";
          var titleText = escapeHtml(item.title || "");
          var titleHtml = item.url
            ? '<a class="role-select__training-course" href="' +
              escapeHtml(item.url) +
              '" target="_blank" rel="noopener noreferrer">' +
              titleText +
              '<span class="role-select__training-arrow" aria-hidden="true">→</span></a>'
            : '<span class="role-select__training-course is-plain">' + titleText + "</span>";
          return (
            '<li class="role-select__training-item">' +
            '<div class="role-select__training-meta">' +
            escapeHtml(meta) +
            paid +
            "</div>" +
            titleHtml +
            "</li>"
          );
        })
        .join("");
      return (
        '<section class="role-select__training-section">' +
        '<h4 class="role-select__training-label">' +
        escapeHtml(section.label || "") +
        "</h4>" +
        '<ul class="role-select__training-list">' +
        list +
        "</ul>" +
        "</section>"
      );
    }

    function fillTrainingModal() {
      var data = global.TRAINING_EVENTS || {};
      if (trainingTitleEl) {
        trainingTitleEl.textContent = data.title || "了解最新培训资讯";
      }
      if (trainingBody) {
        trainingBody.innerHTML =
          renderTrainingSection(data.live) + renderTrainingSection(data.open);
      }
    }

    function setTrainingOpen(open) {
      trainingOpen = !!open;
      if (!trainingModal || !trainingBackdrop) return;
      if (trainingOpen) {
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
      heroStage.style.setProperty("--hero-scale", String(adj.scale != null ? adj.scale : 1));
      heroStage.style.setProperty("--hero-shift-x", adj.x != null ? String(adj.x) : "0px");
      heroStage.style.setProperty("--hero-shift-y", adj.y != null ? String(adj.y) : "0px");
      heroStage.style.setProperty(
        "--hero-object-position",
        (role && role.heroObjectPosition) || "bottom center"
      );
    }

    function applyRoleTitle(role) {
      var zh = (role && role.title) || "";
      var en = (role && role.titleEn) || "";
      titleZhEl.textContent = zh;
      titleEnEl.textContent = en;
      if (sheetTitleZhEl) sheetTitleZhEl.textContent = zh;
      if (sheetTitleEnEl) sheetTitleEnEl.textContent = en;
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

    function applyRoleMeta(role) {
      applyRoleTitle(role);
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
      activeHero.src = assetUrl(role.heroImage, role.heroVersion);
      activeHero.alt = role.title;
      activeHero.className = "role-select__hero is-active";
      idleHero.className = "role-select__hero";
      idleHero.removeAttribute("src");
      applyHeroLayout(role);
      watermarkEl.textContent = role.watermark || role.title || "";
      applyRoleMeta(role);
    }

    function crossfadeHero(role) {
      idleHero.src = assetUrl(role.heroImage, role.heroVersion);
      idleHero.alt = role.title;
      idleHero.className = "role-select__hero is-enter";
      applyHeroLayout(role);
      watermarkEl.textContent = role.watermark || role.title || "";
      applyRoleMeta(role);

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
      var baseSize = Math.min(68, Math.max(42, vw * 0.1));
      var radiusX = Math.min(vw * 0.48, 320);
      var radiusY = Math.min(22, vw * 0.038);
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
        var scale = dist === 0 ? 1.18 : Math.max(0.56, 1 - dist * 0.14);
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
      layoutAvatars(false);
      if (sheetOpen && window.matchMedia("(min-width: 769px)").matches) {
        setSheetOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    setHeroImmediate(roles[selectedIndex]);
    requestAnimationFrame(function () {
      layoutAvatars(false);
    });

    return {
      getSelectedId: function () {
        return roles[selectedIndex] && roles[selectedIndex].id;
      },
      destroy: function () {
        setTrainingOpen(false);
        setSheetOpen(false);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", onResize);
      },
    };
  }

  global.RoleSelect = { mount: mount, sortedCatalog: sortedCatalog };
})(window);
