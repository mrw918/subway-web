/**
 * 2026 Cycle3 直播（Intro）/ 公开课（OET）排课表
 * 本季有排课：直播/公开课课名命中 Cycle3（与站点 routeId 无关，含 DG/T/D/E 等路线图）
 */
(function (global) {
  var LIVE_TITLES = [
    "汽车通信概论",
    "AUTOSAR通信培训",
    "CAN&CAN FD",
    "ETH基础协议",
    "AUTOSAR CP培训",
    "CANoe.CAN培训（上）",
    "AUTOSAR工具链培训",
    "CANoe.Ethernet培训",
    "CANoe.CAN培训（中）",
    "以太网CAPL编程培训",
    "CANoe.CAN培训（下）",
    "CANoe SOME/IP仿真培训",
    "DaVinci基础配置(CFG6)培训",
    "CAPL培训",
    "Python在CANoe中的应用",
    "CAN TP",
    "CANoe DoIP专题培训",
    "DaVinci基础配置(DEVC)培训",
    "应用软件集成培训",
    "DaVinci进阶培训",
    "CAN诊断培训",
  ];

  var OPEN_TITLES = [
    "诊断工具链培训",
    "AUTOSAR CP培训",
    "TÜV认证汽车网络安全ISO/SAE 21434及安全工程培训：二级",
    "CANoe.Ethernet培训",
    "CAPL培训",
    "CANoe.CAN培训",
  ];

  /** schedule 表标题 ↔ 节点数据课名 */
  var NAME_ALIASES = [
    { schedule: "CAN TP", names: ["CANoe诊断测试培训"] },
    { schedule: "CAN诊断培训", names: ["CANoe诊断测试培训"] },
    {
      schedule: "CANoe.CAN培训（上）",
      names: [
        "CANoe.CAN 培训",
        "CANoe/CANalyzer.CAN/CAN FD仿真培训",
        "CANoe/CANalyzer.CAN/CAN FD测量培训",
      ],
    },
    { schedule: "CANoe.CAN培训（中）", names: ["CANoe.CAN 培训"] },
    { schedule: "CANoe.CAN培训（下）", names: ["CANoe.CAN 培训"] },
    { schedule: "CANoe.CAN培训", names: ["CANoe.CAN 培训", "CANoe.CAN培训"] },
    { schedule: "ETH基础协议", names: ["以太网基础协议", "ETH 基础协议", "Ethernet基础协议培训"] },
    { schedule: "CAPL培训", names: ["CAPL 测试培训", "CAPL测试培训"] },
    {
      schedule: "DaVinci基础配置(CFG6)培训",
      names: ["DaVinci基础配置(CFG6)"],
    },
    {
      schedule: "DaVinci基础配置(DEVC)培训",
      names: ["DaVinci基础配置(DEVC)"],
    },
    {
      schedule: "诊断工具链培训",
      names: ["诊断工具链培训"],
    },
  ];

  function formatTypeLabel(value) {
    var raw = String(value || "").trim();
    var key = raw.replace(/\s+/g, " ");
    if (key === "OET 课程" || key === "OET") return "公开课";
    if (key === "CIT 课程" || key === "CIT") return "内训课";
    if (key === "ELN") return "自学课";
    if (key === "B站") return "视频课";
    if (key === "线上课程") return "直播课";
    return raw;
  }

  function normalizeKey(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .replace(/[（]/g, "(")
      .replace(/[）]/g, ")")
      .replace(/&/g, "")
      .toLowerCase();
  }

  function buildTitleIndex(titles) {
    var map = Object.create(null);
    titles.forEach(function (title) {
      map[normalizeKey(title)] = title;
    });
    return map;
  }

  var liveIndex = buildTitleIndex(LIVE_TITLES);
  var openIndex = buildTitleIndex(OPEN_TITLES);

  function courseKeysForLookup(courseName) {
    var keys = [normalizeKey(courseName)];
    NAME_ALIASES.forEach(function (entry) {
      var hitSchedule = entry.schedule && normalizeKey(entry.schedule) === normalizeKey(courseName);
      var hitName = (entry.names || []).some(function (n) {
        return normalizeKey(n) === normalizeKey(courseName);
      });
      if (hitSchedule || hitName) {
        keys.push(normalizeKey(entry.schedule));
        (entry.names || []).forEach(function (n) {
          keys.push(normalizeKey(n));
        });
      }
    });
    return keys;
  }

  function matchesTitleIndex(index, courseName) {
    var keys = courseKeysForLookup(courseName);
    for (var i = 0; i < keys.length; i++) {
      if (index[keys[i]]) return true;
    }
    return false;
  }

  function splitDisplayTypes(typeField) {
    return String(typeField || "")
      .split(/\s*\/\s*/)
      .map(function (part) {
        return formatTypeLabel(part.trim());
      })
      .filter(Boolean);
  }

  function isLiveOrOpenCourse(course) {
    return splitDisplayTypes(course && course.type).some(function (label) {
      return label === "直播课" || label === "公开课";
    });
  }

  function courseHasNavLink(course) {
    return !!(course && (course.url || course.detail));
  }

  function isInCycle3Schedule(course) {
    if (!isLiveOrOpenCourse(course)) return false;
    var types = splitDisplayTypes(course.type).filter(function (label) {
      return label === "直播课" || label === "公开课";
    });
    return types.some(function (label) {
      var index = label === "公开课" ? openIndex : liveIndex;
      return matchesTitleIndex(index, course.name);
    });
  }

  /** 本季有排课：课名命中 Cycle3（仅直播/公开；routeIds 保留参数供列表调用） */
  function isScheduledThisQuarter(course, routeIds) {
    if (!course || !course.name || !isLiveOrOpenCourse(course)) return false;
    return isInCycle3Schedule(course);
  }

  /**
   * 灰行 +「暂无排课」：任意类型，无 url/detail；直播/公开若本季已排课则走 scheduled-pending，不显示此项
   */
  function shouldShowUnscheduledCourse(course, routeIds) {
    if (!course || !course.name) return false;
    if (courseHasNavLink(course)) return false;
    if (isLiveOrOpenCourse(course) && isScheduledThisQuarter(course, routeIds)) {
      return false;
    }
    return true;
  }

  /** 本季已排课但节点尚未配置链接（非灰「无排课」样式） */
  function isScheduledWithoutNavLink(course, routeIds) {
    if (!isLiveOrOpenCourse(course)) return false;
    if (courseHasNavLink(course)) return false;
    return isScheduledThisQuarter(course, routeIds);
  }

  global.TrainingSchedule = {
    formatTypeLabel: formatTypeLabel,
    isLiveOrOpenCourse: isLiveOrOpenCourse,
    courseHasNavLink: courseHasNavLink,
    isInCycle3Schedule: isInCycle3Schedule,
    isScheduledThisQuarter: isScheduledThisQuarter,
    shouldShowUnscheduledCourse: shouldShowUnscheduledCourse,
    isScheduledWithoutNavLink: isScheduledWithoutNavLink,
  };
})(window);
