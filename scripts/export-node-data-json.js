#!/usr/bin/env node
/**
 * 从 node-data-*.js 导出站点与课程 JSON（供维护 Excel 生成脚本使用）
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const JS = path.join(ROOT, "js");

const ROUTES = [
  { title: "诊断工程师", file: "node-data-diagnostic.js", dataKey: "NODE_HOVER_DATA_DIAGNOSTIC" },
  { title: "MBSE系统设计工程师", file: "node-data-mbse.js", dataKey: "NODE_HOVER_DATA_MBSE" },
  { title: "SOA工程师", file: "node-data-soa.js", dataKey: "NODE_HOVER_DATA_SOA" },
  { title: "标定工程师", file: "node-data-calibration.js", dataKey: "NODE_HOVER_DATA_CALIBRATION" },
  { title: "网络开发工程师", file: "node-data.js", dataKey: "NODE_HOVER_DATA" },
  { title: "网络测试工程师", file: "node-data-network-test.js", dataKey: "NODE_HOVER_DATA_NETWORK_TEST" },
  { title: "嵌入式软件开发工程师", file: "node-data-embedded.js", dataKey: "NODE_HOVER_DATA_EMBEDDED" },
];

function loadData(fileName, dataKey) {
  const filePath = path.join(JS, fileName);
  const code = fs.readFileSync(filePath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: filePath });
  const data = sandbox.window[dataKey];
  if (!data || typeof data !== "object") {
    throw new Error("Missing " + dataKey + " in " + fileName);
  }
  return data;
}

function serializeNode(key, node) {
  const types = Array.isArray(node.type) ? node.type : [];
  const courses = Array.isArray(node.courses) ? node.courses : [];
  return {
    key,
    siteName: node.nodeName || key,
    description: node.description || "",
    resourceTypes: types.join("、"),
    courses: courses.map(function (c) {
      return {
        name: c.name || "",
        type: c.type || "",
        url: c.url || "",
        detail: c.detail || "",
      };
    }),
  };
}

const out = ROUTES.map(function (route) {
  const raw = loadData(route.file, route.dataKey);
  const nodes = Object.keys(raw).map(function (key) {
    return serializeNode(key, raw[key]);
  });
  return { title: route.title, file: route.file, nodes };
});

process.stdout.write(JSON.stringify(out, null, 2));
