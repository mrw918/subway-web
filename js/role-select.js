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

    root.innerHTML =
      '<div class="role-select__scene">' +
      '  <div class="role-select__logo" aria-label="VECTOR">' +
      '    <span class="role-select__logo-text">VECTOR</span>' +
      '    <svg class="role-select__logo-arrow" viewBox="0 0 12 18" role="img" aria-hidden="true">' +
      '      <path d="M1 1l10 8-10 8" fill="none" stroke="#ef4444" stroke-width="3.2" stroke-linecap="square" stroke-linejoin="miter"/>' +
      "    </svg>" +
      "  </div>" +
      '  <div class="role-select__aside">' +
      '    <div class="role-select__title-row">' +
      '      <div class="role-select__title" aria-live="polite">' +
      '        <h1 class="role-select__title-zh"></h1>' +
      '        <p class="role-select__title-en"></p>' +
      "      </div>" +
      '      <button type="button" class="role-select__details-toggle" aria-label="查看角色详情" aria-expanded="false">' +
      '        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">' +
      '          <path d="M3 5h12M3 9h12M3 13h12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
      "        </svg>" +
      "      </button>" +
      "    </div>" +
      '    <dl class="role-select__details role-select__details--desktop" aria-live="polite">' +
      '      <div class="role-select__detail-item">' +
      '        <dt class="role-select__detail-label">&gt; ROLE</dt>' +
      '        <dd class="role-select__detail-value" data-detail="role"></dd>' +
      "      </div>" +
      '      <div class="role-select__detail-item">' +
      '        <dt class="role-select__detail-label">&gt; FOCUS</dt>' +
      '        <dd class="role-select__detail-value" data-detail="focus"></dd>' +
      "      </div>" +
      '      <div class="role-select__detail-item">' +
      '        <dt class="role-select__detail-label">&gt; SKILLS</dt>' +
      '        <dd class="role-select__detail-value" data-detail="skills"></dd>' +
      "      </div>" +
      '      <div class="role-select__detail-item">' +
      '        <dt class="role-select__detail-label">&gt; MISSION</dt>' +
      '        <dd class="role-select__detail-value" data-detail="mission"></dd>' +
      "      </div>" +
      "    </dl>" +
      "  </div>" +
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
      '    <button type="button" class="role-select__entre">ENTRE</button>' +
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
      '        <dt class="role-select__detail-label">&gt; ROLE</dt>' +
      '        <dd class="role-select__detail-value" data-detail="role"></dd>' +
      "      </div>" +
      '      <div class="role-select__detail-item">' +
      '        <dt class="role-select__detail-label">&gt; FOCUS</dt>' +
      '        <dd class="role-select__detail-value" data-detail="focus"></dd>' +
      "      </div>" +
      '      <div class="role-select__detail-item">' +
      '        <dt class="role-select__detail-label">&gt; SKILLS</dt>' +
      '        <dd class="role-select__detail-value" data-detail="skills"></dd>' +
      "      </div>" +
      '      <div class="role-select__detail-item">' +
      '        <dt class="role-select__detail-label">&gt; MISSION</dt>' +
      '        <dd class="role-select__detail-value" data-detail="mission"></dd>' +
      "      </div>" +
      "    </dl>" +
      "  </aside>" +
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
      role: root.querySelectorAll('[data-detail="role"]'),
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

    function applyRoleDetails(role) {
      var details = (role && role.details) || {};
      Object.keys(detailEls).forEach(function (key) {
        var nodes = detailEls[key];
        if (!nodes) return;
        for (var i = 0; i < nodes.length; i++) {
          nodes[i].textContent = details[key] || "";
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
      var vw = avatarViewport.clientWidth || 760;
      var baseSize = Math.min(72, Math.max(42, vw * 0.105));
      var radiusX = Math.min(vw * 0.5, 380);
      var radiusY = Math.min(26, vw * 0.04);
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
        var y = (1 - Math.cos(Math.abs(t) * Math.PI * 0.5)) * radiusY;
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

    function onKeyDown(event) {
      if (root.hidden) return;
      if (event.key === "Escape" && sheetOpen) {
        event.preventDefault();
        setSheetOpen(false);
        return;
      }
      if (sheetOpen) return;
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
        setSheetOpen(false);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("resize", onResize);
      },
    };
  }

  global.RoleSelect = { mount: mount, sortedCatalog: sortedCatalog };
})(window);
