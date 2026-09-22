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
  
    courses: [
      {
        name: "XCP协议",
        type: "自学课",
        url: "https://vector.atalent.com/Saba/Web_spf/A501PRD0117/common/ledetail/cours000000000003560/latestversion",
        detail: "本课程为免费在线自学课。XCP用于测量和标定ECU（从内存中读数据，向内存中写数据）。XCP旨在以最小的资源消耗来实现测量数据采集，而不仅限于特定的传输层。它可以应用在CAN、Ethernet和FlexRay网络上。\n报名方式：请您点击此处打开该在线课程进行学习。如果您未注册Vector学习中心账号，请点击此处注册。"
      },
    ],
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
  
    courses: [
      {
        name: "CANape基础教程合集（免费）",
        type: "视频课",
        url: "https://www.bilibili.com/video/BV11N411X7vm/"
      },
      {
        name: "CANape培训_基础版",
        type: "公开课",
        url: "https://academy.vector.com/cn/zh/courses/detail/5804/"
      },
      {
        name: "CANape培训_进阶版",
        type: "公开课",
        url: "https://academy.vector.com/cn/zh/courses/detail/3217/"
      },
      {
        name: "CANape",
        type: "自学课",
        detail: "本课程为付费自学课，课程内容：\n1. CANape功能简介\nCANape是什么\nCANape应用领域\nCANape支持的硬件接口和协议\n2. XCP协议简介\nCCP/XCP协议\n3. 工程创建及通道配置\n硬件连接方式\n创建CANape工程\n添加Device\n通道配置\n4. 测量ECU内部信号\n测量信号配置\n配置文件保存\n实用技巧\n5. 数据记录\n测量数据记录文件简介\n数据记录——使用Recorder\n数据另存\nDHPR\nVTSS\n6. 离线数据分析\n离线数据分析概述\n加载测量文件\nGraphic Window手动分析\n虚拟信号\nColor Function\nCompare and Replace Measurement File Channels\nDisplay signal as Reference\n7. 报告打印\n报告打印概述\n案例展示\n报告制作\n快捷导出\n8. 函数&脚本&面板\n概述\n函数（Function）\n脚本（Scripts）\n面板（Panel）\n9. 数据挖掘\n概述\n案例展示\nData Mining配置\n10. 标定及标定数据管理\n标定基本概念\n标定流程\n及时查看标定表现\n标定历史管理\n标定数据管理\n11. 刷写\n刷写基本概念\n标定参数合并\n刷写\n单人价格（一价包含Vector学习中心所有自学课程）：\n4,000元+VAT 6%/月\n40,000元+VAT 6%/年\n如您有意向购买该类课程，请您联系您的对接销售，或发送邮件至Vector学习中心进行咨询：training@cn.vector.com"
      },
      {
        name: "CANape培训_完整版",
        type: "内训课",
        url: "https://academy.vector.com/cn/zh/courses/detail/5804/"
      },
    ],
  },
  "标定数据管理": {
    nodeName: "标定数据管理",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: ["标定数据管理", "Calibration Data Management", "CalibrationDataManagement"],
    description: "掌握标定数据的基本管理方式",
  
    courses: [
      {
        name: "CANape中文件转换的方法",
        type: "自学课",
        detail: "本课程为付费自学课，将向您介绍如何在CANape中文件转换的方法。\n单人价格（一价包含Vector学习中心所有自学课程）：\n4,000元+VAT 6%/月\n40,000元+VAT 6%/年\n如您有意向购买该类课程，请您联系您的对接销售，或发送邮件至Vector学习中心进行咨询：training@cn.vector.com"
      },
    ],
  },
  "数据记录": {
    nodeName: "数据记录",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: ["数据记录", "Logging"],
    description: "学习使用CANape进行数据记录的方式",
  
    courses: [
      {
        name: "CANape_一分钟教你在CANape记录“重要”事件",
        type: "视频课",
        url: "https://www.bilibili.com/video/BV1oGArzKESM/"
      },
      {
        name: "CANape_一分钟教你记录总线报文",
        type: "视频课",
        url: "https://www.bilibili.com/video/BV1Rr7h64E78/"
      },
      {
        name: "如何保存标定历史记录到MF4文件",
        type: "自学课",
        detail: "本课程为付费自学课，介绍进行在线标定时，将保存标定历史记录到MF4文件的方法。\n单人价格（一价包含Vector学习中心所有自学课程）：\n4,000元+VAT 6%/月\n40,000元+VAT 6%/年\n如您有意向购买该类课程，请您联系您的对接销售，或发送邮件至Vector学习中心进行咨询：training@cn.vector.com"
      },
    ],
  },
  "GLLogger": {
    nodeName: "GL Logger",
    type: [],
    match: ["GLLogger", "GL Logger"],
    description: "学习如何使用GL Logger",
  
    courses: [
      {
        name: "GL Logger培训",
        type: "内训课",
        detail: "本课程为付费内训课，学习如何使用GL Logger进行数据记录，以及其实际应用和操作方法。\n1.GL Logger简介\n2.Vector Logger Suite（VLSuite）简介\n3.记录功能\n4.文件管理\n5.离线数据分析\n6.Logger配件在内训课中，Vector中国将与您商定培训日期，也可以基于您的培训需求进行单独的沟通。\n本课程价格为每场15,000元+6%税。\n如您有意向购买该类课程，请您联系您的对接销售，或发送邮件至Vector中国培训团队进行咨询：training@cn.vector.com"
      },
    ],
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
  
    courses: [
      {
        name: "CANape_一分钟教你在CANape复用函数",
        type: "视频课",
        url: "https://www.bilibili.com/video/BV1fG9QBCE5p/"
      },
      {
        name: "CANape_一分钟教你在CANape给信号做计算",
        type: "视频课",
        url: "https://www.bilibili.com/video/BV1Ko6FB1Eha/"
      },
      {
        name: "CANape_一分钟教你用离线信号当参照对象",
        type: "视频课",
        url: "https://www.bilibili.com/video/BV1bTEv6cELK/"
      },
      {
        name: "CANape_一分钟教你给信号关联共轴",
        type: "视频课",
        url: "https://www.bilibili.com/video/BV1s3ju6yEBQ/"
      },
      {
        name: "CANape_一分钟教你给信号换“新衣”",
        type: "视频课",
        url: "https://www.bilibili.com/video/BV1XRgNzjEzD/"
      },
      {
        name: "CANape中Label List和Measurement File List的应用",
        type: "自学课",
        detail: "本课程为付费自学课，将向您介绍在CANape中如何配置Label List和Measurement File List。\n单人价格（一价包含Vector学习中心所有自学课程）：\n4,000元+VAT 6%/月\n40,000元+VAT 7%/年\n如您有意向购买该类课程，请您联系您的对接销售，或发送邮件至Vector学习中心进行咨询：training@cn.vector.com"
      },
      {
        name: "CANape中报告打印及快捷导出",
        type: "自学课",
        detail: "本课程为付费自学课，将向您介绍如何在CANape中生成报告，以及快捷导出的方法。\n单人价格（一价包含Vector学习中心所有自学课程）：\n4,000元+VAT 6%/月\n40,000元+VAT 6%/年\n如您有意向购买该类课程，请您联系您的对接销售，或发送邮件至Vector学习中心进行咨询：training@cn.vector.com"
      },
    ],
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
    nodeName: "vCDMstudio",
    type: ["ELN", "B站", "OET", "CIT", "线上课程"],
    match: ["vCDMStudio", "vCDMstudio", "vCDM Studio"],
    description: "学习使用 vCDMstudio 管理和维护标定数据",
  },
  "vCDM": {
    nodeName: "vCDM",
    type: [],
    match: ["vCDM"],
    description: "学习 vCDM 标定数据管理平台的基本概念与使用方法",
  },
  "vCDMToolSet": {
    nodeName: "vCDM Tool-Set",
    type: [],
    match: ["vCDMToolSet", "vCDM Tool-Set", "vCDM Tool Set", "VCDMToolSet", "vCDMTool Set"],
    description: "学习使用 vCDM Tool-Set 完成标定数据处理及工程任务",
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
