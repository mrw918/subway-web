/**
 * 各路线图路线介绍（可选；未配置时使用图例文字作为简介）
 */
window.ROUTE_PRESETS = {
  soa: {
    S1: {
      description:
        "涵盖以太网底层协议、SOME/IP、DDS、AUTOSAR 及 S2S 与 E/E 服务化等 SOA 系统设计基础能力。",
    },
    S2: {
      description:
        "了解软件定义汽车（SDV）概念，理解软件平台、软件工厂在 SDV 语境下的应用。",
    },
    S3: {
      description:
        "掌握 AUTOSAR AP 通信组件（MSRA.COM）、Proxy & Skeleton 架构及 SOA AP 开发与测试。",
    },
    S4: {
      description:
        "掌握信号-服务转化（S2S）设计，以及 MSRA.S2S、MSRC.ETH、MSRC.SomeIP 等 CP 侧实现。",
    },
    S5: {
      description:
        "使用 PREEvision 基于 AUTOSAR CP/AP 方法论进行 SOA 系统设计（SOA 概论、AP、CP）。",
    },
  },
  mbse: {
    M1: { color: "#d82a36", description: "MBSE 方法论与系统工程基础，建立模型驱动设计思维。" },
    M2: { color: "#89b33d", colors: ["#89b43b"], description: "需求与功能建模，掌握用例、活动与状态等核心模型元素。" },
    M3: { color: "#eb5e42", description: "架构与接口设计，完成系统分层与模块划分。" },
    M4: { color: "#50b5ca", description: "仿真、验证与 V 模型闭环，保障设计可追溯。" },
    M5: { color: "#e5a025", description: "工具链与协同开发，支撑 MBSE 落地与团队协作。" },
  },
  calibration: {
    C1: { color: "#ee373b" },
    C2: { color: "#f2684d" },
    C3: { color: "#8499ce" },
    C4: { color: "#4b67af" },
  },
  "network-test": {
    T1: { title: "测试开发", desc: "网络测试开发基础能力与工程方法。" },
    T2: { title: "代码测试", desc: "代码级测试方法与质量保障。" },
    T3: { title: "DevOps工作流", desc: "测试在持续集成/持续交付中的工作流。" },
    T4: { title: "vTESTstudio", desc: "使用 vTESTstudio 进行测试设计和自动化。" },
    T5: { title: "HIL测试", desc: "硬件在环测试相关方法与实践。" },
    T6: { title: "SIL测试", desc: "软件在环测试相关方法与实践。" },
    T7: { title: "CAN一致性测试", desc: "CAN 总线一致性测试。" },
    T8: { title: "LIN一致性测试", desc: "LIN 总线一致性测试。" },
    T9: { title: "以太网测试", desc: "车载以太网测试方法与实践。" },
    T10: { title: "J1939一致性测试", desc: "J1939 一致性测试。" },
    T11: { title: "诊断测试", desc: "诊断协议与诊断测试相关能力。" },
    T12: { title: "网络安全测试", desc: "网络安全测试路线，覆盖渗透、模糊测试及安全协议验证。" },
  },
  "network-dev": {
    D1: { title: "CAN网络开发", description: "车载 CAN / CAN FD 网络开发基础能力。" },
    D2: { title: "以太网网络开发", description: "车载以太网协议栈与网络开发。" },
    D3: { title: "LIN网络开发", description: "LIN 网络开发相关能力与工程方法。" },
    D4: { title: "J1939网络开发", description: "J1939 网络开发相关能力与工程方法。" },
    D5: { title: "网络安全开发", description: "车载网络安全开发相关能力。" },
    D6: { title: "CAN NM开发", description: "CAN 网络管理（NM）开发。" },
    D7: { title: "基于CAN的诊断", description: "基于 CAN 的诊断开发。" },
    D8: { title: "基于以太网的诊断", description: "基于以太网的诊断开发。" },
    D9: { title: "以太网中基于信号的通信", description: "以太网中基于信号的通信开发。" },
    D10: { title: "时间敏感网络", description: "时间敏感网络（TSN）相关开发。" },
    T1: { description: "车载以太网协议栈与底层通信基础。" },
    T2: { description: "网络协议实现与 AUTOSAR 通信栈配置。" },
    T3: { description: "网络安全（SecOC、TLS 等）与防护机制。" },
    T4: { description: "时间敏感网络（TSN）与确定性通信。" },
    T5: { description: "服务发现、SomeIP/DoIP 等应用层协议。" },
    T6: { description: "网络开发与集成测试方法论。" },
    T7: { description: "诊断与 OTA 相关网络能力。" },
    T8: { description: "性能优化与问题定位。" },
    T9: { description: "前沿技术拓展与综合实践。" },
  },
  diagnostic: {
    DG1: { title: "车辆诊断", description: "车辆诊断相关基础知识与能力。" },
    DG2: { title: "诊断规范与数据", description: "诊断规范与数据相关学习路线。" },
    DG3: { title: "刷写", description: "ECU 刷写相关学习路线。" },
    DG4: { title: "测试和验证", description: "诊断测试与验证相关学习路线。" },
    DG5: { title: "面向服务的车辆诊断", description: "面向服务的车辆诊断学习路线。" },
    DG6: { title: "诊断安全", description: "诊断安全相关学习路线。" },
  },
};
