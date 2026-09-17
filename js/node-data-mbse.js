/**
 * 知识路线图节点 Hover 数据（MBSE系统设计工程师）
 * 来源：MBSE系统设计工程师.docx
 */
window.NODE_HOVER_DATA_MBSE = {
  "系统工程理论": {
    nodeName: "系统工程概论",
    type: ["公开课", "内训课"],
    match: ["系统工程概论", "系统工程理论"],
    description:
      "系统工程是一种跨学科且强调集成的方法，其核心目标是在系统整个生命周期内完成复杂系统的设计、集成与管理。",
  },
  "V模型": {
    nodeName: "V模型",
    type: ["内训课"],
    match: ["V模型"],
    description:
      "V模型是一种广泛应用于汽车和软件开发领域的系统开发流程模型，通过建立需求、设计、实现、测试之间的对应关系，实现开发活动与验证活动的有效衔接。",
  },
  "ASPICE过程管理": {
    nodeName: "ASPICE",
    type: ["公开课", "内训课"],
    match: ["ASPICE", "ASPICE过程管理"],
    description:
      "ASPICE（Automotive SPICE）是一套面向汽车软件与系统开发的过程评估模型，用于规范研发流程、提升项目质量并满足汽车行业的过程合规要求。",
  },
  "RFLP方法": {
    nodeName: "RFLP方法",
    type: ["内训课"],
    match: ["RFLP方法", "RFLP"],
    description:
      "RFLP（Requirements、Functions、Logical、Physical）是一种基于模型的系统工程方法，通过建立需求、功能、逻辑架构和物理架构之间的关联，实现复杂系统的分层设计与追踪。",
  },
  "PREEvision基础": {
    nodeName: "PREEvision",
    type: ["自学课", "公开课", "内训课"],
    match: ["PREEvision", "PREEvision基础"],
    description:
      "PREEvision是面向汽车电子与系统工程的模型化开发平台，可支持需求管理、系统设计、架构建模和追踪分析等活动，帮助实现完整的数字化开发流程。",
  },
  "UML/SysML设计": {
    nodeName: "UML/SysML",
    type: ["内训课"],
    match: ["UML/SysML", "UML/SysML设计", "AUML/SysML", "SysML"],
    description:
      "UML和SysML是用于系统与软件建模的标准化建模语言，可用于描述系统结构、行为及其关系，并支持基于模型的系统设计与开发。",
  },
  "RFLP.需求管理": {
    nodeName: "RFLP.需求管理",
    type: ["自学课", "公开课", "内训课"],
    match: ["RFLP.需求管理", "RFLP需求管理"],
    description:
      "掌握PREEvision的需求管理功能。本站点包含以下内容：\n\nRequirement text editor\nCustomer feature modeling\n自定义属性\nRegIF/Excel导入与导出\nUseCase图",
  },
  "RFLP.功能设计": {
    nodeName: "RFLP.功能设计",
    type: ["自学课", "公开课", "内训课"],
    match: ["RFLP.功能设计", "RFLP功能设计"],
    description:
      "掌握PREEvision的功能设计功能。本站点包含以下内容：\n\n从需求到功能设计\n功能活动图",
  },
  "RFLP.逻辑设计": {
    nodeName: "RFLP.逻辑设计",
    type: ["内训课"],
    match: ["RFLP.逻辑设计", "RFLP逻辑设计"],
    description:
      "掌握PREEvision的逻辑设计功能。本站点包含以下内容：\n\n逻辑架构图\n创建逻辑架构组件\n创建Interfaces\n创建并连接Ports\nActivity Chains",
  },
  "RFLP.软件需求": {
    nodeName: "RFLP.软件需求",
    type: [],
    match: ["RFLP.软件需求", "RFLP软件需求"],
    description: "使用PREEvision对系统需求进行软件需求方向的拆解。",
  },
  "RFLP.软件设计": {
    nodeName: "RFLP.软件设计",
    type: ["自学课"],
    match: ["RFLP.软件设计", "RFLP软件设计"],
    description:
      "使用PREEvision基于AUTOSAR CP方法论进行软件设计。本站点包含以下内容：\n\nSWC设计及Port设计\nData Type设计\n软件库管理\n一致性校验\nARXML导入与导出",
  },
  "E/E服务化": {
    nodeName: "E/E服务化",
    type: ["自学课"],
    match: ["E/E服务化", "E/E", "S2S与E/E服务化"],
    description:
      "理解传统的信号通信与服务通信之间的转化与共存方式。本站点包含以下内容：\n\n哪些功能适合服务化\n传统系统与服务架构的衔接\n分层服务模型\n架构落地与部署\n工具链与协同开发",
  },
  "SOME/IP协议": {
    nodeName: "SOME/IP协议",
    type: ["内训课"],
    match: ["SOME/IP协议", "SOME/IP"],
    description:
      "掌握SOME/IP协议相关知识，理解面向服务通信的过程。本站点包含以下内容：\n\nSOME/IP服务发现与服务通信\nSOME/IP报文格式及SD报文格式\n与传输层协议的对应关系\n单播、组播的使用",
  },
  "AUTOSAR CP": {
    nodeName: "AUTOSAR CP",
    type: ["自学课", "公开课", "内训课"],
    match: ["ASRCP", "ASR CP", "ASR  CP", "AUTOSAR CP"],
    description:
      "理解AUTOSAR CP的技术概念与方法论，掌握AUTOSAR CP对服务通信的兼容方式。本站点包含以下内容：\n\nAUTOSAR架构\nAUTOSAR Applications\nAUTOSAR RTE\nAUTOSAR BSW\nAUTOSAR方法论\nPDU与Socket的对接\nAUTOSAR CP下的以太网使用模式",
  },
  "SOA CP设计": {
    nodeName: "SOA CP设计",
    type: ["自学课"],
    match: ["SOACP设计", "SOA CP设计", "SOACP", "SOA CP"],
    description:
      "使用PREEvision基于AUTOSAR CP方法论进行SOA设计。本站点包含以下内容：\n\nSOA Diagram\n服务及服务接口设计\n服务在CP架构中的部署\n使用PREEvision EXPRESS快捷创建SOA模型",
  },
  "AUTOSAR AP": {
    nodeName: "AUTOSAR AP",
    type: ["公开课", "内训课"],
    match: ["ASRAP", "ASR AP", "AUTOSAR AP"],
    description:
      "理解AUTOSAR AP的技术概念与方法论。本站点包含以下内容：\n\nAUTOSAR架构\nAUTOSAR Adaptive SWC\nAUTOSAR AP中间件",
  },
  "SOA AP设计": {
    nodeName: "SOA AP设计",
    type: ["自学课"],
    match: ["SOAAP设计", "SOA AP设计", "SOAAP", "SOA AP"],
    description:
      "使用PREEvision基于AUTOSAR AP方法论进行SOA设计。本站点包含以下内容：\n\nSOA Diagram\n服务及服务接口设计\n服务在AP架构中的部署\n使用PREEvision EXPRESS快捷创建SOA模型",
  },
  "RFLP.硬件需求": {
    nodeName: "RFLP.硬件需求",
    type: [],
    match: ["RFLP.硬件需求", "RFLP硬件需求"],
    description: "使用PREEvision对系统需求进行硬件需求方向的拆解。",
  },
  "RFLP.硬件设计": {
    nodeName: "RFLP.硬件设计",
    type: ["自学课"],
    match: ["RFLP.硬件设计", "RFLP硬件设计"],
    description:
      "使用PREEvision进行硬件设计。本站点包含以下内容：\n\n硬件组件设计\n硬件连接与拓扑设计",
  },
  "追溯性": {
    nodeName: "追溯性",
    type: ["自学课"],
    match: ["追溯性", "追塑性"],
    description: "理解追溯性的概念，使用PREEvision进行产品的追溯性管理",
  },
  "版本管理": {
    nodeName: "版本管理",
    type: ["自学课"],
    match: ["版本管理"],
    description: "理解版本管理的概念，使用PREEvision进行产品的版本管理",
  },
  "变型管理": {
    nodeName: "变型管理",
    type: ["自学课"],
    match: ["变型管理"],
    description: "理解变型管理的概念，使用PREEvision进行产品的变型管理",
  },
  "生命周期管理": {
    nodeName: "生命周期管理",
    type: ["自学课"],
    match: ["生命周期管理"],
    description: "理解生命周期的概念，使用PREEvision进行产品的生命周期管理",
  },
  "基线管理": {
    nodeName: "基线管理",
    type: ["自学课"],
    match: ["基线管理"],
    description: "理解基线的概念，使用PREEvision进行产品的基线管理",
  },
  "测试管理": {
    nodeName: "测试管理",
    type: [],
    match: ["测试管理"],
    matchIndex: 1,
    description: "掌握PREEvision的测试管理功能",
  },
};
