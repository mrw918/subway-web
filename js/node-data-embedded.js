/**
 * 知识路线图节点 Hover 数据（嵌入式软件开发工程师）
 * 来源：嵌入式软件开发工程师.docx
 */
window.NODE_HOVER_DATA_EMBEDDED = {
  "ECU软件概论": {
    nodeName: "ECU软件概论",
    type: ["自学课"],
    match: ["ECU软件概论", "软件概论"],
    description:
      "了解ECU软件发展历史，理解ECU软件运行与实现机制，建立ECU软件工程体系整体认知。本站点包含以下内容：\n\nECU软件发展历史\nECU软件的实现与结构化演进",
    svgIndex: 6,
  },
  "ASR CP": {
    nodeName: "ASR CP",
    type: ["自学课", "公开课", "内训课", "直播课"],
    match: ["ASR CP", "ASRCP", "AUTOSAR CP", "AUTOSAR CPAUTOSAR"],
    description:
      "理解AUTOSAR CP的技术概念与方法论。本站点包含以下内容：\n\nAUTOSAR架构\nAUTOSAR Applications\nAUTOSAR RTE\nAUTOSAR BSW\nAUTOSAR方法论",
    svgIndex: 7,
  },
  "ASR工具链": {
    nodeName: "ASR工具链",
    type: ["自学课", "直播课"],
    match: ["ASR工具链", "AUTOSAR工具链", "ASR 工具链"],
    description:
      "了解AUTOSAR工具链在系统设计、软件开发、通信配置、仿真测试及变更管理等维度的整体协同。本站点包含以下内容：\n\nARXML\nVector工具链\nPREEvision：架构设计\nDaVinci：ECU配置\nCANoe：网络测试与验证\nCANoe+vVIRTUALtarget：SIL测试",
    svgIndex: 8,
  },
  "CANoe分析": {
    nodeName: "CANoe分析",
    type: ["视频课", "自学课", "公开课", "内训课", "直播课"],
    match: ["CANoe分析"],
    description:
      "CANoe工具可以辅助工程师在开发阶段快速验证通信功能。本站点将介绍CANoe总线分析功能，包含以下内容：\n\n总线分析\n报文过滤\n记录与回放",
    svgIndex: 9,
  },
  "CANoe仿真": {
    nodeName: "CANoe仿真",
    type: ["视频课", "自学课", "公开课", "内训课", "直播课"],
    match: ["CANoe仿真"],
    description:
      "CANoe工具可以辅助工程师在开发阶段模拟ECU所在网络的通信行为。本站点将介绍CANoe节点仿真功能，包含以下内容：\n\n节点仿真\nInteractive Generator\nCANoeIL.dll\nvECU.dll",
    svgIndex: 10,
  },
  "MICROSAR SIP": {
    nodeName: "MICROSAR SIP",
    type: ["公开课", "内训课", "直播课"],
    match: ["MICROSAR SIP", "MICROSARSIP"],
    description:
      "MICROSAR SIP即MICROSAR软件集成包，是Vector嵌入式代码产品的主要交付物。本站点包含以下内容：\n\nAUTOSAR与MICROSAR及DaVinci的关系\nSIP交付形式\nSIP目录结构",
    svgIndex: 11,
  },
  "DaVinci基础配置": {
    nodeName: "DaVinci基础配置",
    type: ["公开课", "内训课", "直播课"],
    match: ["DaVinci基础配置", "DaVinci"],
    description:
      "学习并掌握DaVinci工具的基本功能，实现项目配置与SWC设计。本站点包含以下内容：\n\nDaVinci Configurator Classic 6：\n命令行工具及使用技巧\n创建工程、工程目录结构\n导入ECUEX文件/传统文件\nUI工具使用介绍\n\nDaVinci Developer Classic：\n创建工程、工程目录结构\n导入与导出\nSWC设计及Port设计\n手动/自动为SWC添加Port并创建连接关系\nSWC实例化与嵌套Composition管理\n\nDaVinci Configurator Classic 6与DaVinci Developer Classic之间的工程关联",
    svgIndex: 0,
  },
  "ECU最小系统": {
    nodeName: "ECU最小系统",
    type: ["自学课"],
    match: ["ECU最小系统", "最小系统"],
    description:
      "理解Runtime视角下的ECU最小系统必要的模块及其作用。本站点包含以下内容：\n\nECU最小系统（Runtime视角）\n必要的模块及其作用\n配置示例",
  },
  "MSRC.OS": {
    nodeName: "MSRC.OS",
    type: ["公开课", "内训课"],
    match: ["MSRC.OS"],
    description:
      "掌握MICROSAR OS的Task、Interrupt、Counter等基本功能及配置方法。本站点包含以下内容：\n\nAUTOSAR OS概述\nTask\nAlarm\nOs Counter\nInterrupt\nOs Resource\nIOC\nSchdule Table\nTiming Protection\nMemory Protection",
  },
  "ECU状态管理": {
    nodeName: "ECU状态管理",
    type: ["公开课", "内训课"],
    match: ["ECU状态管理", "状态管理"],
    description:
      "掌握ECU运行的各个阶段，掌握EcuM与BswM对ECU状态的管理及分工，以及配置方法。本站点包含以下内容：\n\nEcuM与BswM的分工\nECU启动流程\nECU下电流程\nECU休眠流程\nECU唤醒流程\nECU运行阶段的管理\n模式管理的机制",
  },
  "BSW调度": {
    nodeName: "BSW调度",
    type: ["公开课", "内训课"],
    match: ["BSW调度", "调度"],
    description:
      "掌握RTE（SchM）对BSW组件的调度及配置方法。本站点包含以下内容：\n\nBSW MainFunction\nSchM的调度实现",
  },
  "多核": {
    nodeName: "多核",
    type: ["内训课"],
    match: ["多核", "调度多核"],
    description: "掌握多核系统相关知识及配置方法。",
  },
  "应用软件集成": {
    nodeName: "应用软件集成",
    type: ["自学课"],
    match: ["应用软件集成", "进阶配置应用软件集成"],
    description:
      "理解应用软件集成涉及的内容。本站点包含以下内容：\n\n应用软件集成概述\nRTE的功能与实现：\nRTE对Runnable Trigger的实现\nRTE对Port的实现，RTE接口\n应用软件头文件及模板文件生成",
  },
  "Task Mapping": {
    nodeName: "Task Mapping",
    type: ["自学课", "公开课", "内训课"],
    match: ["Task Mapping", "TaskMapping"],
    description:
      "掌握应用软件集成时的任务映射方法及注意事项。本站点包含以下内容：\n\nTask Mapping方法与批量操作\nRunnable在Task中的调度实现",
  },
  "Data Mapping": {
    nodeName: "Data Mapping",
    type: ["自学课", "公开课", "内训课"],
    match: ["Data Mapping", "DataMapping"],
    description:
      "掌握应用软件集成时的数据映射方法及注意事项。本站点包含以下内容：\n\n信号及信号组的Data Mapping方法\n信号及信号组的Data Mapping自动映射\n从信号/信号组生成Ports并自动映射",
  },
  "Service Mapping": {
    nodeName: "Service Mapping",
    type: ["自学课", "公开课", "内训课"],
    match: ["Service Mapping", "ServiceMapping"],
    description:
      "掌握应用软件集成时的服务映射方法及注意事项。本站点包含以下内容：\n\nService Components与Service Ports\nSWC常用的标准化服务\nService Mapping方法与批量操作\nService Mapping自动映射\nService Needs",
  },
  "DaVinci进阶配置": {
    nodeName: "DaVinci进阶",
    type: ["自学课"],
    match: ["DaVinci进阶", "DaVinci进阶配置", "进阶配置"],
    description:
      "掌握应用软件集成相关的其他DaVinci配置项及其作用。本站点包含以下内容：\n\n通过指针访问接口\n最小触发间隔\n获取触发原因\n临界区功能\nIRV功能\n标定量管理\n使用模式机制：\n请求或收发模式信息\n通过模式禁用触发\n使用模式切换作为触发条件\n使用NvBlockSWC\n生成间接接口\n发送结果确认",
  },
  "AUTOSAR通信": {
    nodeName: "ASR通信",
    type: ["自学课", "公开课", "内训课"],
    match: ["ASR通信", "AUTOSAR通信"],
    description:
      "掌握AUTOSAR应用报文通信的核心链路，理解“数据→信号→PDU→报文”的转换过程。本站点包含以下内容：\n\n通信问题与AUTOSAR定位\n应用层通信模型\nBSW通信栈\nPDU数据结构\nAUTOSAR通信路径解析\n系统协同",
  },
  "MSRC.COM": {
    nodeName: "MSRC.COM",
    type: ["公开课", "内训课"],
    match: ["MSRC.COM", "MSRC.COMMSRC.ComM"],
    description:
      "掌握COM组件对信号及PDU的处理及相关功能，掌握配置方法。本站点包含以下内容：\n\n信号/信号组的发送与接收\n发送信号的过滤与发送模式的选择\n接收信号的过滤\n发送与接收的超时监控\n异常值收发机制\n发送与接收的通知机制",
  },
  "MSRC.ComM": {
    nodeName: "MSRC.ComM",
    type: ["公开课", "内训课"],
    match: ["MSRC.ComM", "ComM"],
    description:
      "掌握ComM组件对通信的控制模式及配置方法。本站点包含以下内容：\n\n通信管理机制\n通信管理状态机\nPNC管理",
  },
  "CAN": {
    nodeName: "CAN",
    type: ["公开课", "内训课"],
    match: ["CAN"],
    description:
      "掌握CAN通信相关AUTOSAR组件功能及配置方法。本站点包含以下内容：\n\nCanIf：\nTx buffer机制\nCAN报文唤醒校验\n\nCanNM：\n运行模式\n网络管理报文\n快发网络管理报文\n降低网络负载机制\nPNC管理\n\nCanSM：\n状态机\n启用/停止唤醒源\nBus Off管理\n波特率调整",
  },
  "LIN": {
    nodeName: "LIN",
    type: [],
    match: ["LIN"],
    description: "掌握LIN通信相关AUTOSAR组件功能及配置方法",
  },
  "FlexRay": {
    nodeName: "FlexRay",
    type: [],
    match: ["FlexRay"],
    description: "掌握FlexRay通信相关AUTOSAR组件功能及配置方法",
  },
  "J1939": {
    nodeName: "J1939",
    type: [],
    match: ["J1939"],
    description: "掌握J1939通信相关AUTOSAR组件功能及配置方法",
  },
  "UDS协议": {
    nodeName: "UDS协议",
    type: ["自学课", "公开课", "内训课"],
    match: ["UDS协议", "UDS"],
    description:
      "了解UDS协议内容，掌握车辆诊断请求与响应及常见诊断服务。本站点包含以下内容：\n\n车辆诊断概论\n诊断服务请求格式\n诊断请求响应格式\n常见诊断服务\nDID、DTC等概念梳理",
  },
  "诊断数据库": {
    nodeName: "诊断数据库",
    type: ["自学课", "公开课", "内训课"],
    match: ["诊断数据库", "协议诊断数据库"],
    description:
      "了解诊断数据库内容。本站点包含以下内容：\n\n诊断数据库格式\n诊断数据库导入",
  },
  "MSRC.Diag": {
    nodeName: "MSRC.Diag",
    type: ["公开课", "内训课"],
    match: ["MSRC.Diag", "MSRC.DiagXCP"],
    description:
      "掌握DCM、DEM、FiM等诊断组件功能及配置方法。本站点包含以下内容：\n\nDCM与CanTp：\n诊断报文收发管理\nDsd、Dsl、Dsp\n诊断服务执行\n诊断模式管理\n\nDEM：\n诊断故障信息管理\n关联故障指示灯\n关联其他触发函数\n冻结帧、扩展数据记录\nPre-Debouncing算法\nDTC的存储\nOperation Cycle\n\nFiM：\nFID与功能抑制管理",
  },
  "ETH底层协议": {
    nodeName: "ETH底层协议",
    type: ["视频课", "自学课", "公开课", "内训课", "直播课"],
    match: ["ETH底层协议", "底层协议"],
    description:
      "了解以太网底层协议相关知识。本站点包含以下内容：\n\n物理层：\n传输介质\nMII与MDI\n\n数据链路层：\n交换机与寻址\n单播、组播、广播\nVLAN\n\n网络层：\nIP协议\n路由器与子网\nIP寻址\nIP组播\n\n传输层：\nTCP协议\nUDP协议\nMAC、IP、Port对应关系",
  },
  "PDU & Socket": {
    nodeName: "PDU & Socket",
    type: ["内训课"],
    match: ["PDU & Socket", "PDU&Socket", "ASR.PDU & Socket"],
    description:
      "掌握AUTOSAR CP对以太网的兼容方式。本站点包含以下内容：\n\n理解Socket\nPDU与Socket的对接\nAUTOSAR CP下的以太网使用模式",
  },
  "MSRC.ETH": {
    nodeName: "MSRC.ETH",
    type: ["内训课"],
    match: ["MSRC.ETH", "MSRC.ETHMSRC.SomeIP"],
    description:
      "掌握SoAd、TcpIp、Eth等组件功能及配置方法。本站点包含以下内容：\n\nTcpIp组件配置\nPduRoute、SocketRoute配置\nSocketConnectionGroup配置\nRoutingGroup配置\n报文接收匹配机制\nTrigger Transmit功能\nPDU-based ETH配置示例",
  },
  "DoIP协议": {
    nodeName: "DoIP协议",
    type: ["自学课", "公开课", "内训课"],
    match: ["DoIP协议", "DoIP"],
    description:
      "掌握DoIP协议相关知识，理解DoIP诊断过程。本站点包含以下内容：\n\nDoIP通信过程\nDoIP报文格式\n与传输层协议的对应关系\nDoIP诊断",
  },
  "MSRC.DoIP": {
    nodeName: "MSRC.DoIP",
    type: ["内训课"],
    match: ["MSRC.DoIP", "MSRC.DoIPETH"],
    description:
      "掌握DoIP组件功能实现及配置方法。本站点包含以下内容：\n\n网关节点的转发场景\nDoIPInt\nDoIP报文收发配置示例\n后续进阶方向",
  },
  "SOME/IP协议": {
    nodeName: "SOME/IP协议",
    type: ["内训课"],
    match: ["SOME/IP协议", "SOME/IP", "SQME/IP"],
    description:
      "掌握SOME/IP协议相关知识，理解面向服务通信过程。本站点包含以下内容：\n\nSOME/IP服务发现与服务通信\nSOME/IP报文格式及SD报文格式\n与传输层协议的对应关系\n单播、组播的使用",
  },
  "MSRC.SomeIP": {
    nodeName: "MSRC.SomeIP",
    type: ["内训课"],
    match: ["MSRC.SomeIP", "SomeIP"],
    description:
      "掌握Sd、SomeIpXf等组件功能实现及配置方法。本站点包含以下内容：\n\nSOME/IP SD报文与服务报文配置示例\nSd模块配置\nSWC-BswM-Sd服务发现控制路径\nSWC使用/提供服务",
  },
  "XCP协议": {
    nodeName: "XCP协议",
    type: ["自学课", "内训课", "直播课"],
    match: ["XCP协议", "XCP"],
    description: "掌握XCP协议内容",
  },
  "测量与标定工具": {
    nodeName: "测量与标定工具",
    type: ["自学课", "公开课", "内训课", "直播课"],
    match: ["测量与标定工具", "协议测量与标定工具"],
    description: "了解CANape等工具功能与使用方法",
  },
  "MSRC.XCP": {
    nodeName: "MSRC.XCP",
    type: [],
    match: ["MSRC.XCP"],
    description:
      "掌握XCP组件功能实现及配置方法。本站点包含以下内容：\n\nXCP组件配置\n标定应用实现模式与参考",
  },
  "存储技术": {
    nodeName: "存储技术",
    type: ["公开课", "内训课"],
    match: ["存储技术"],
    description:
      "掌握车载存储技术的基本原理与工程取舍，理解 EEPROM、Flash 及其管理机制的关系\n\n易失性存储与非易失性存储\nRAM、Flash及EEPROM的特点\nEEPROM与Flash的工程取舍\n从存储技术到存储管理",
  },
  "MSRC.NvM": {
    nodeName: "MSRC.NvM",
    type: ["公开课", "内训课"],
    match: ["MSRC.NvM", "NvM"],
    description:
      "掌握AUTOSAR对数据存储的抽象管理。本站点包含以下内容：\n\nNative、Redundant、Dataset存储方式\n任务队列与优先级\nImmediate任务的特殊机制\nCRC数据校验\nCRC比较机制\n数据的写保护\nRAM Block的关联\n显式同步功能\nRAM Block的CRC管理\nRAM Block Status\n缺省值的关联\n配置更新时的注意事项",
  },
  "MSRC.Ea": {
    nodeName: "MSRC.Ea",
    type: ["公开课", "内训课"],
    match: ["MSRC.Ea", "Ea"],
    description:
      "掌握EEPROM抽象模块对EEPROM的抽象管理。本站点包含以下内容：\n\nWrite Cycle评估\nEEPROM的数据存储布局\nECC功能模拟",
  },
  "MSRC.Fee": {
    nodeName: "MSRC.Fee",
    type: ["公开课", "内训课"],
    match: ["MSRC.Fee", "Fee"],
    description:
      "掌握Flash抽象模块对Flash的抽象管理。本站点包含以下内容：\n\nProgram Flash与Data Flash\nChunk概念及Chunk Size选择\nFlash换页机制及BSS、FSS\nCritical Data选项\nFEE SmallSector",
  },
  "MSRC.MemAcc": {
    nodeName: "MSRC.MemAcc",
    type: ["内训课"],
    match: ["MSRC.MemAcc", "MemAcc"],
    description:
      "掌握存储组件进阶功能与配置方法。本站点包含以下内容：\n\nMemAcc解决方案的使用场景\n虚拟地址空间\n与物理地址空间的映射",
  },
  "MSRC.MEM基础": {
    nodeName: "MSRC.MEM基础",
    type: ["公开课", "内训课"],
    match: ["MSRC.MEM基础", "MSRC.MEM"],
    description: "掌握NvM、Fee、Ea等组件功能与配置方法",
  },
  "MSRC.MEM进阶": {
    nodeName: "MSRC.MEM进阶",
    type: ["内训课"],
    match: ["MSRC.MEM进阶"],
    description: "掌握存储组件进阶功能与配置方法",
  },
  "I/O与CDD": {
    nodeName: "I/O与CDD",
    type: ["公开课", "内训课"],
    match: ["1/0与CDD", "I/O与CDD"],
    description: "理解I/O与CDD功能在AUTOSAR平台下的开发模式",
  },
  "I/O MCAL": {
    nodeName: "I/O MCAL",
    type: [],
    match: ["I/O MCAL", "I/OMCAL", "1/0 MCAL"],
    description: "理解I/O相关常见MCAL组件功能",
  },
  "开发合规&过程管理": {
    nodeName: "合规与过程管理",
    type: ["自学课"],
    match: ["合规与过程管理", "开发合规&过程管理", "开发合规", "过程管理", "合规"],
    description:
      "建立ASPICE、功能安全、信息安全基本认知。本站点包含以下内容：\n\nECU开发中的工程约束体系\nASPICE —— 过程驱动的工程能力体系\n功能安全 —— 从系统故障到风险控制\n信息安全 —— 从功能系统到攻击面系统\n多维约束下的ECU工程模型",
  },
  "密码学基础": {
    nodeName: "密码学",
    type: ["公开课", "内训课"],
    match: ["密码学", "密码学基础"],
    description:
      "了解对称加密、非对称加密、MAC、数字签名、证书等基础知识。本站点包含以下内容：\n\n哈希算法特点及常用算法\n对称加密特点及常用算法\n消息认证码（MAC）\n非对称加密特点及常用算法\n数字签名\n证书与证书链\n密钥交换常用算法\n加密算法优缺点梳理及措施",
  },
  "信息安全设计": {
    nodeName: "信息安全",
    type: ["公开课", "内训课"],
    match: ["信息安全", "信息安全设计"],
    description: "了解产品生命周期中的信息安全设计活动，理解开发工程师负责的环节。",
  },
  "MSRC.Security": {
    nodeName: "MSRC.Security",
    type: ["公开课", "内训课"],
    match: ["MSRC.Security", "MSRC.Secunty", "MSRC.SecuntyDoIP"],
    description:
      "掌握CSM、CryIf、Crypto等组件功能及配置方法。本站点包含以下内容：\n\n加密协议栈架构\n组件配置：加密原语、加密密钥、加密队列\nCSM任务机制：同步、异步模式\nCSM服务使用方式",
  },
  "MSRC.veHSM": {
    nodeName: "MSRC.veHSM",
    type: ["内训课"],
    match: ["MSRC.veHSM", "veHSM"],
    description: "掌握HSM固件的功能及配置方法",
  },
  "功能安全": {
    nodeName: "功能安全",
    type: ["公开课", "内训课"],
    match: ["功能安全"],
    description: "了解功能安全设计相关活动",
  },
  "MSRC.Safety": {
    nodeName: "MSRC.Safety",
    type: ["内训课"],
    match: ["MSRC.Safety", "MSRC.Satety"],
    description: "掌握MICROSAR针对功能安全的解决方案",
  },
};
