/**
 * 知识路线图节点 Hover 数据（标定工程师）
 * 来源：标定工程师.docx；站名对齐「知识路线图 新ci 1-2.svg」
 * 课程格式：ELN→自学课 B站→视频课 OET→公开课 CIT→内训课 线上课程→直播课
 */
window.NODE_HOVER_DATA_CALIBRATION = {
  "通信协议": {
    nodeName: "通信协议",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: ["通信协议", "通信协议CAN/LIN/ETH", "CAN/LIN/ETH", "CAN/LIN/Ethernet"],
    description: "基础通信协议学习",
  },
  "标定协议XCP": {
    nodeName: "标定协议XCP",
    type: ["OET"],
    match: ["标定协议XCP", "标定协议", "XCP"],
    description: "掌握标定的基础协议",
  },
  "标定数据库": {
    nodeName: "标定数据库",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: ["标定数据库", "Database Handling", "DatabaseHandling"],
    description: "掌握数据库的基础处理和使用方式",
  },
  "CANape基础": {
    nodeName: "CANape基础",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: ["CANape基础", "CANape Basic", "CANapeBasic"],
    description: "掌握CANape的基础功能",
  },
  "标定数据管理": {
    nodeName: "标定数据管理",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: ["标定数据管理", "Calibration Data Management", "CalibrationDataManagement"],
    description: "掌握标定数据的基本管理方式",
  },
  "数据记录": {
    nodeName: "数据记录",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: ["数据记录", "Logging"],
    description: "学习使用CANape进行数据记录的方式",
  },
  "GLLogger": {
    nodeName: "GL Logger",
    type: [],
    match: ["GLLogger", "GL Logger"],
    description: "学习如何使用GL Logger",
  },
  "SmartLogger": {
    nodeName: "Smart Logger",
    type: ["OET", "CIT"],
    match: ["SmartLogger", "Smart Logger"],
    description: "学习如何使用Smart Logger",
  },
  "vMeassure": {
    nodeName: "vMeasure",
    type: [],
    match: ["vMeassure", "vMeasure"],
    description: "学习如何使用vMeasure",
  },
  "数据分析": {
    nodeName: "数据分析",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: ["数据分析", "Data Analysis", "DataAnalysis"],
    description: "在记录数据后的数据分析能力学习",
  },
  "CASL": {
    nodeName: "CASL",
    type: [],
    match: ["CASL"],
    description: "掌握CANape中用于数据分析的CASL语言",
  },
  "数据挖掘": {
    nodeName: "数据挖掘",
    type: ["OET", "CIT"],
    match: ["数据挖掘", "Data Mining", "DataMining"],
    description: "掌握从大量数据中，自动搜索满足特定条件的目标工况、事件或数据特征，并对搜索结果进行汇总和分析的能力",
  },
  "A2L文件": {
    nodeName: "A2L文件",
    type: [],
    match: ["A2L文件", "A2L", "Open or Create an A2L file", "Update A2L", "A2L Reporting"],
    description: "A2L文件的打开、创建、更新及差异报告相关能力",
  },
  "vCDMStudio": {
    nodeName: "vCDM Studio",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: ["vCDMStudio", "vCDM Studio"],
    description: "学习使用vCDM Studio管理和维护标定数据",
  },
  "vCDM": {
    nodeName: "vCDM",
    type: [],
    match: ["vCDM"],
    description: "学习 vCDM 标定数据管理平台的基本概念与使用方法",
  },
  "vCDMToolSet": {
    nodeName: "vCDM Tool Set",
    type: [],
    match: ["vCDMToolSet", "vCDM Tool Set", "VCDMToolSet", "vCDMTool Set"],
    description: "学习使用vCDM Tool Set完成标定数据处理及工程任务",
  },
  "标定数据质量及流程": {
    nodeName: "标定数据质量及流程",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: [
      "标定数据质量及流程",
      "标定质量管理",
      "Calibration Data Quality and Calibration Process",
      "CalibrationDataQualityandCalibrationProcess",
    ],
    description: "学习标定数据采集与标定流程管理，理解从数据获取、整理到标定数据形成和维护的完整过程",
  },
  "标定参数处理": {
    nodeName: "标定参数处理",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: [
      "标定参数处理",
      "标定参数编辑",
      "Display/Compare/Edit Parameters",
      "Display,compareandEditparameters",
    ],
    description: "掌握标定参数的显示、比较和编辑方法，能够对不同版本、不同标定数据集之间的参数差异进行分析和调整",
  },
  "刷写文件": {
    nodeName: "刷写文件",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: ["刷写文件", "Generate HEX", "GeneroteHEX", "HEX"],
    description: "学习根据标定数据生成 HEX 文件，理解标定数据与 ECU 软件镜像之间的关系，为后续 ECU 刷写提供可用的数据文件",
  },
  "数据刷写": {
    nodeName: "数据刷写",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: ["数据刷写", "Flash"],
    description: "学习将生成的 HEX 文件刷写至 ECU，掌握从标定数据管理到 ECU 数据更新的完整闭环流程",
  },
};
