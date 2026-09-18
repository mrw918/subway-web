/**
 * 知识路线图节点 Hover 数据（SOA工程师）
 * 来源：SOA工程师.docx
 */
window.NODE_HOVER_DATA_SOA = {
  "ETH底层协议": {
    nodeName: "ETH底层协议",
    type: ["视频课", "自学课", "公开课", "内训课", "直播课"],
    match: ["ETH底层协议", "ETH", "底层协议"],
    description:
      "了解以太网底层协议相关知识。本站点包含以下内容：\n\n物理层：\n传输介质\nMII 与 MDI\n数据链路层：\n交换机与寻址\n单播、组播、广播\nVLAN\n网络层：\nIP 协议\n路由器与子网\nIP 寻址\nIP 组播\n传输层：\nTCP 协议\nUDP 协议\nMAC、IP、Port 对应关系",
  },
  "SOME/IP协议": {
    nodeName: "SOME/IP协议",
    type: ["内训课"],
    match: ["SOME/IP协议", "SOME/IP"],
    description:
      "掌握 SOME/IP 协议相关知识，理解面向服务通信的过程。本站点包含以下内容：\n\nSOME/IP 服务发现与服务通信\nSOME/IP 报文格式及 SD 报文格式\n与传输层协议的对应关系\n单播、组播的使用",
  },
  "DDS协议": {
    nodeName: "DDS协议",
    type: [],
    match: ["DDS协议", "DDS"],
    description: "掌握 DDS 协议相关知识，理解 DDS 与 SOME/IP 的异同",
  },
  "ASR": {
    nodeName: "AUTOSAR",
    type: ["公开课", "内训课", "直播课"],
    match: ["ASR", "AUTOSAR"],
    description:
      "理解 AUTOSAR CP/AP 的技术概念与方法论。本站点包含以下内容：\n\nAUTOSAR 架构\nAUTOSAR Applications\nAUTOSAR RTE\nAUTOSAR BSW\nAUTOSAR 方法论\nAUTOSAR Adaptive SWC\nAUTOSAR AP 中间件\nPDU 与 Socket 的对接\nAUTOSAR CP 下的以太网使用模式",
  },
  "E/E服务化": {
    nodeName: "E/E服务化",
    type: ["自学课"],
    match: ["E/E服务化", "E/E", "S2S与E/E服务化", "S2S 与 E/E 服务化"],
    description:
      "理解传统的信号通信与服务通信之间的转化与共存方式。本站点包含以下内容：\n\n哪些功能适合服务化\n传统系统与服务架构的衔接\n分层服务模型\n架构落地与部署\n工具链与协同开发",
  },
  "PREEvision.SOA": {
    nodeName: "PREEvision.SOA",
    type: [],
    match: ["PREEvision.SOA", "PREEvision.SOA概论", "PREEvision . SOA概论"],
    description:
      "理解 PREEvision 的 SOA 模型组成和原理。本站点包含以下内容：\n\nSOA Diagram\n服务及服务接口设计",
  },
  "SOA AP": {
    nodeName: "SOA AP",
    type: ["自学课"],
    match: ["SOAAP", "SOA AP", "PREEvision.SOA AP", "PREEvision . SOA AP", "PREEvision.SOAAP", "PREEvision . SOAAP"],
    description:
      "使用 PREEvision 基于 AUTOSAR AP 方法论进行 SOA 设计。本站点包含以下内容：\n\n服务在 AP 架构中的部署\n使用 PREEvision EXPRESS 快捷创建 SOA 模型",
  },
  "SOA CP": {
    nodeName: "SOA CP",
    type: ["自学课"],
    match: ["SOACP", "SOA CP", "PREEvision.SOA CP", "PREEvision . SOA CP", "PREEvision.SOACP", "PREEvision . SOACP"],
    description:
      "使用 PREEvision 基于 AUTOSAR CP 方法论进行 SOA 设计。本站点包含以下内容：\n\n服务在 CP 架构中的部署\n使用 PREEvision EXPRESS 快捷创建 SOA 模型",
  },
  "S2S": {
    nodeName: "S2S",
    type: [],
    match: ["S2S"],
    description:
      "使用 PREEvision 进行信号-服务的转化设计。本站点包含以下内容：\n\nPDU-based ETH 设计\nS2S 设计",
  },
  "SDV概论": {
    nodeName: "SDV概论",
    type: [],
    match: ["SDV概论", "SDV"],
    description: "了解软件定义汽车的概念，理解软件定义汽车语境下开发模式的转变",
  },
  "软件平台": {
    nodeName: "软件平台",
    type: [],
    match: ["软件平台"],
    description: "了解软件平台的概念，了解 AUTOSAR 平台（CP/AP）在软件平台语境下的应用",
  },
  "软件工厂": {
    nodeName: "软件工厂",
    type: [],
    match: ["软件工厂"],
    description: "了解软件工厂的概念",
  },
  "MSRA.COM": {
    nodeName: "MSRA.COM",
    type: ["内训课"],
    match: ["MSRA.COM", "MSRC.COM"],
    description:
      "理解 AUTOSAR AP 通信组件功能及原理，掌握 MICROSAR Adaptive 通信功能的建模与实现。本站点包含以下内容：\n\nMethod、Event、Field 的实现机制",
  },
  "Proxy & Skeleton": {
    nodeName: "Proxy & Skeleton",
    type: ["内训课"],
    match: ["Proxy & Skeleton", "Proxy&Skeleton", "Proxy & Skeleton ", "Proxy", "Skeleton"],
    description:
      "理解 Proxy & Skeleton 架构，掌握相关接口并实现调用。本站点包含以下内容：\n\nProxy 相关接口与使用方法\nProxy 回调机制\nSkeleton 相关接口与使用方法\nSkeleton 处理模式",
  },
  "SOA测试概论": {
    nodeName: "SOA测试概论",
    type: [],
    match: ["SOA测试概论", "SOA 测试概论", "测试概论"],
    description: "了解 SOA 相关测试项目",
  },
  "PDU & Socket": {
    nodeName: "PDU & Socket",
    type: ["内训课"],
    match: ["PDU & Socket", "PDU&Socket", "ASR.PDU & Socket", "ASR.PDU&Socket"],
    description:
      "掌握 AUTOSAR CP 对以太网的兼容方式。本站点包含以下内容：\n\n理解 Socket\nPDU 与 Socket 的对接\nAUTOSAR CP 下的以太网使用模式",
  },
  "MSRA.S2S": {
    nodeName: "MSRA.S2S",
    type: [],
    match: ["MSRA.S2S", "MSRA. S2S"],
    description:
      "掌握 S2S 解决方案中 MICROSAR Adaptive 通信组件的实现部分。本站点包含以下内容：\n\nEvent 的实现机制\nSignal-Event 的转化",
  },
  "MSRC.S2S": {
    nodeName: "MSRC.S2S",
    type: [],
    match: ["MSRC.S2S", "MSRC. S2S"],
    description:
      "掌握 S2S 解决方案中 MICROSAR Classic 通信组件的实现部分。本站点包含以下内容：\n\nTcpIp 组件配置\nPDU-based ETH 配置",
  },
  "MSRC.ETH": {
    nodeName: "MSRC.ETH",
    type: ["内训课"],
    match: ["MSRC.ETH", "MSRC. ETH", "SRC.ETH"],
    description:
      "掌握以太网相关 AUTOSAR 组件（SoAd、TcpIp、Eth 等）的功能及配置方法。本站点包含以下内容：\n\nTcpIp 组件配置\nPduRoute、SocketRoute 配置\nSocketConnectionGroup 配置\nRoutingGroup 配置\n报文接收匹配机制\nTrigger Transmit 功能",
  },
  "MSRC.SomeIP": {
    nodeName: "MSRC.SomeIP",
    type: ["内训课"],
    match: ["MSRC.SomeIP", "MSRC. SomeIP", "SomeIP"],
    description:
      "掌握 SomeIP 相关 AUTOSAR 组件（Sd、SomeIpXf）的功能实现及配置方法。本站点包含以下内容：\n\nSOME/IP SD 报文与服务报文配置示例\nSd 模块配置\nSWC-BswM-Sd 服务发现控制路径\nSWC 使用/提供服务",
  },
};
