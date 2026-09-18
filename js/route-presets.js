/**
 * 各路线图路线介绍（可选；未配置时使用图例文字作为简介）
 */
window.ROUTE_PRESETS = {
  soa: {
    S1: {
      description:
        "从 AUTOSAR CP/AP、SOME/IP、DDS 及 E/E 服务化出发，掌握 PREEvision SOA 建模与设计方法。",
    },
    S2: {
      description:
        "从 SDV 概念出发，理解软件平台与软件工厂的发展方向。",
    },
    S3: {
      description:
        "从 SOA 建模到 Adaptive 通信组件实现，掌握 Proxy/Skeleton 开发模式。",
    },
    S4: {
      description:
        "围绕 S2S 建模与 CP/AP 通信组件实现开展学习。",
    },
    S5: {
      description:
        "从 PREEvision SOA 设计到以太网与 SomeIP 实现，完成 CP 平台 SOA 开发。",
    },
  },
  mbse: {
    M1: {
      color: "#d82a36",
      description:
        "从系统工程理论出发，逐步学习 V 模型、ASPICE、RFLP 方法论、SysML 建模语言以及 PREEvision 需求、功能、逻辑设计能力，建立完整的 MBSE 开发基础。",
    },
    M2: {
      color: "#89b33d",
      colors: ["#89b43b"],
      description:
        "围绕软件需求分解、AUTOSAR CP/AP 架构设计以及 SOA 建模展开学习。",
    },
    M3: {
      color: "#eb5e42",
      description: "从硬件需求分析出发，完成硬件架构与设计建模。",
    },
    M4: {
      color: "#50b5ca",
      description: "围绕版本、基线、生命周期、变型以及追溯性管理展开学习。",
    },
    M5: {
      color: "#e5a025",
      description: "从需求管理到测试管理，建立面向 V 模型的验证体系。",
    },
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
  embedded: {
    E1: {
      title: "理论基础与工具链",
      description:
        "从 ECU 软件概论出发，逐步理解 AUTOSAR CP、工具链、CANoe、MICROSAR SIP 以及 DaVinci 基础配置，建立完整的软件工程视角。",
    },
    E2: {
      title: "ECU最小系统开发",
      description:
        "从 ECU 最小系统出发，学习 OS、EcuM、BswM、调度及多核机制。",
    },
    E3: {
      title: "应用软件集成",
      description:
        "围绕 Task Mapping、Data Mapping、Service Mapping 以及 DaVinci 高级配置开展学习。",
    },
    E4: {
      title: "通信功能开发",
      description:
        "从 AUTOSAR 通信链路切入，学习 COM、ComM 及 CAN/LIN/FlexRay/J1939。",
    },
    E5: {
      title: "诊断功能开发",
      description:
        "从 UDS 协议、诊断数据库开始，扩展到 AUTOSAR 诊断栈与 DoIP。",
    },
    E6: {
      title: "以太网功能开发",
      description:
        "学习以太网协议栈、AUTOSAR Ethernet 架构与 SOME/IP 服务通信。",
    },
    E7: {
      title: "标定功能开发",
      description: "从 XCP 协议到 CANape 等测量标定工具。",
    },
    E8: {
      title: "存储功能开发",
      description: "从 Flash/EEPROM 技术到 NvM、Fee、Ea 高级应用。",
    },
    E9: {
      title: "I/O与CDD功能开发",
      description: "围绕 CDD 模式与 MCAL 进行学习。",
    },
    E10: {
      title: "信息安全开发",
      description: "从过程合规、密码学到 HSM 与 AUTOSAR 安全组件。",
    },
    E11: {
      title: "功能安全开发",
      description: "从过程体系到功能安全设计与实现。",
    },
  },
};
