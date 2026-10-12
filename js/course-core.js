/**
 * 课程 normalize 与站点「是否有课」（地铁图圆点）
 */
(function (global) {
  function isSpreadsheetNoLinkPlaceholder(rawLink) {
    var s = String(rawLink || "").trim();
    if (!s) return false;
    if (s === "暂无" || s === "暂无。" || s === "暂无链接") return true;
    if (s.indexOf("暂无，") === 0) return true;
    if (s.indexOf("不展示") !== -1) return true;
    return false;
  }

  function isPlaceholderCourseName(name) {
    var n = String(name || "").trim();
    if (!n) return true;
    if (n === "暂无" || n.indexOf("暂无") === 0) return true;
    return false;
  }

  function parseCourseUrl(raw) {
    if (raw == null) return null;
    var s = String(raw).trim();
    if (!s) return null;
    if (/^https?:\/\//i.test(s)) return s.replace(/[)\]}>,.;]+$/, "");
    var match = s.match(/https?:\/\/[^\s\u4e00-\u9fff）)]+/i);
    return match ? match[0].replace(/[)\]}>,.;]+$/, "") : null;
  }

  function normalizeCourses(raw) {
    if (!Array.isArray(raw) || !raw.length) return [];
    return raw
      .map(function (course) {
        if (!course) return null;
        if (isSpreadsheetNoLinkPlaceholder(course.link)) return null;
        var url =
          course.url != null && course.url !== ""
            ? String(course.url).trim()
            : parseCourseUrl(course.link);
        var detail = course.detail != null ? String(course.detail).trim() : "";
        var name = String((course && course.name) || "").trim();
        if (isPlaceholderCourseName(name)) return null;
        return {
          name: name,
          type: String((course && course.type) || "").trim(),
          url: url || null,
          detail: detail || null,
          linkKind: course.linkKind || null,
        };
      })
      .filter(function (course) {
        return course && !!course.name;
      });
  }

  function nodeHasAnyCourse(courses) {
    return normalizeCourses(courses).length > 0;
  }

  global.CourseCore = {
    normalizeCourses: normalizeCourses,
    nodeHasAnyCourse: nodeHasAnyCourse,
    parseCourseUrl: parseCourseUrl,
    isSpreadsheetNoLinkPlaceholder: isSpreadsheetNoLinkPlaceholder,
    isPlaceholderCourseName: isPlaceholderCourseName,
  };
})(window);
