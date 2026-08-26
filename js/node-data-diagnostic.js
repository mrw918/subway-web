/**
 * 知识路线图节点 Hover 数据（诊断工程师）
 * 来源：诊断工程师.docx
 */
window.NODE_HOVER_DATA_DIAGNOSTIC = {
  "汽车电子基础": {
    nodeName: "汽车电子基础",
    type: ["B站"],
    match: ["汽车电子基础", "汽车电子与嵌入式基础", "汽⻋电⼦基础"],
    description: "在此站点，您将学习现代汽车电子电气（E/E）系统中的技术和概念，如“什么是ECU“、”汽车诊断的必要性“、”如何更新ECU软件“、”什么是UDS“等，为后续深入学习诊断奠定基础。",
  },
  "汽车通信概论": {
    nodeName: "汽车通信概论",
    type: ["线上课程"],
    match: ["汽车通信概论"],
    description: "现代汽车中存在多种数据通信网络及协议，包括CAN、LIN、FlexRay等。此外，以太网和TCP/IP等传统计算机网络技术也已在汽车中得到应用。在此站点，将向您介绍汽车通信的整体概况以及不同通信网络之间的区别。",
  },
  "ETH基础协议": {
    nodeName: "ETH基础协议",
    type: [],
    match: ["ETH基础协议", "ETH 基础协议"],
    description: "了解车载以太网基础协议与通信概念，为 DoIP 等诊断传输方式打基础。",
  },
  "DoIP协议": {
    nodeName: "DoIP协议",
    type: [],
    match: ["DoIP协议", "DoIP"],
    description: "了解基于 IP 的诊断通信（DoIP）协议与应用场景。",
  },
  "CAN协议": {
    nodeName: "CAN协议",
    type: ["B站", "ELN", "线上课程"],
    match: ["CAN协议"],
    description: "在此站点，您将学习CAN协议，并理解CAN总线寻址方式、总线访问机制和CAN报文结构。",
  },
  "CAN TP": {
    nodeName: "CAN TP",
    type: ["ELN", "线上课程", "CIT 课程"],
    match: ["CAN TP"],
    description: "诊断场景中，经常需要传输“大包“数据，CAN TP（即CAN传输协议）能够实现“大包“数据的拆包和组包。在此站点，您将学习CAN TP协议中的帧类型及其格式。",
  },
  "UDS协议": {
    nodeName: "UDS协议",
    type: ["B站", "OET 课程", "线上课程"],
    match: ["UDS协议"],
    description: "根据ISO 14229标准，统一诊断服务（UDS）是诊断系统与汽车ECU之间的通信协议，用于诊断故障和刷写ECU。在此站点，您将学习车辆诊断背景知识，USD协议中常用的诊断服务。",
  },
  "OBDonUDS/ZEVonUDS": {
    nodeName: "OBDonUDS/ZEVonUDS",
    type: ["OET 课程"],
    match: ["OBDonUDS/ZEVonUDS", "OBDOnUDS/ZEVonUDS", "OBDonUDS", "OBDOnUDS", "ZEVonUDS"],
    description: "SAE J1979-2标准（OBDonUDS）要求使用UDS读取OBD诊断数据。SAE J1979-3定义了诊断仪获取新能源汽车动力系统数据的通信规则。在此站点，您将了解相关标准。",
  },
  "MICROSAR.DIAG": {
    nodeName: "MICROSAR.DIAG",
    type: ["ELN"],
    match: ["MICROSAR.DIAG", "MICROSAR.DIA"],
    description: "在此站点，您将了解AUTOSAR诊断相关的基础软件： DCM（诊断通信管理器）、 DEM（诊断事件管理器）和FIM（功能抑制管理器）。",
  },
  "诊断工具链": {
    nodeName: "诊断工具链",
    type: ["OET 课程"],
    match: ["诊断工具链", "Vector诊断工具链"],
    description: "在诊断开发过程中，Vector提供了功能强大的软件工具，适用于整个车辆诊断开发过程的每个阶段。在此站点，您将整体了解Vector诊断工具链，包括CANdelaStudio、ODXStudio、CANoe.DiVa、Indigo及vFlash。",
  },
  "CDD": {
    nodeName: "CDD",
    type: ["ELN", "OET 课程", "线上课程"],
    match: ["CDD"],
    description: "CDD用于描述ECU支持的诊断服务、DID和通信规则等。在此站点，您将了解CDD文件。",
  },
  "ODX/PDX": {
    nodeName: "ODX/PDX",
    type: ["ELN", "OET 课程", "线上课程"],
    match: ["ODX/PDX", "ODX/P"],
    description: "ODX是一种标准化的XML格式，用于统一描述诊断数据，PDX是其打包形式。在此站点，您将了解ODX/PDX文件。",
  },
  "诊断规范": {
    nodeName: "诊断规范",
    type: ["ELN", "OET 课程", "线上课程"],
    match: ["诊断规范"],
    description: "OEM通常会定义统一的诊断规范，在此站点，您将了解诊断规范的概念。",
  },
  "刷写规范": {
    nodeName: "刷写规范",
    type: ["ELN", "OET 课程", "线上课程"],
    match: ["刷写规范"],
    description: "刷写规范定义了软件升级的标准流程和要求，例如安全机制、流程顺序、错误处理等。在此站点，您将了解刷写规范的概念。",
  },
  "CANdelaStudio": {
    nodeName: "CANdelaStudio",
    type: ["B站", "ELN", "OET 课程", "线上课程"],
    match: ["CANdelaStudio"],
    description: "CANdelaStudio支持用户轻松、高效地创建和编辑正式的ECU诊断规范。在此站点，您将学习应用CANdelaStudio编辑诊断服务、编辑诊断和传输层通信参数、编辑CDDT/CDD等。",
  },
  "ISO 22901-1": {
    nodeName: "ISO 22901-1",
    type: ["ELN", "线上课程"],
    match: ["ISO 22901-1", "22901-1"],
    description: "ODX是基于XML的ASAM标准，用于描述诊断相关的ECU数据。ODX于2008年正式成为ISO标准（ISO 22901-1）。在此站点，您将了解相关标准。",
  },
  "ODXStudio": {
    nodeName: "ODXStudio",
    type: ["ELN", "线上课程"],
    match: ["ODXStudio"],
    description: "ODXStudio是一款面向用户的ODX格式诊断数据编辑工具。在此站点，您将学习应用ODXStudio编辑ODX-D文件数据（如DID、DTC、DOP等），编辑ODX-C、ODX-V、ODX-E、ODX-F文件等。",
  },
  "Bootloader原理": {
    nodeName: "Bootloader原理",
    type: ["线上课程"],
    match: ["Bootloader原理", "Bootloader"],
    description: "在此站点，您将了解Bootloader原理。",
  },
  "刷写流程": {
    nodeName: "刷写流程",
    type: ["ELN", "OET 课程", "线上课程"],
    match: ["刷写流程"],
    description: "典型刷写流程包括进入特定会话、安全解锁、下载数据、数据传输和校验等步骤。在此站点，您将了解刷写流程。",
  },
  "刷写服务": {
    nodeName: "刷写服务",
    type: ["ELN", "OET 课程", "线上课程"],
    match: ["刷写服务"],
    description: "刷写依赖UDS中的特定服务，如34服务、36服务、37服务等，在此站点，您将了解刷写相关的UDS服务。",
  },
  "S19/HEX/bin文件": {
    nodeName: "S19/HEX/bin文件",
    type: ["ELN", "OET 课程", "线上课程"],
    match: ["S19/HEX/bin文件", "S19/HEX", "bin文件"],
    description: "S19 / HEX / bin文件是ECU软件的不同格式表示。您将了解这三种文件及其特点。",
  },
  "vFlash": {
    nodeName: "vFlash",
    type: ["ELN", "OET 课程", "线上课程"],
    match: ["vFlash"],
    description: "vFlash是一款非常简单易用的工具，可通过诊断（如UDS）对ECU进行刷写。在此站点，您将学习如何应用vFlash对ECU进行刷写。",
  },
  "产线刷写": {
    nodeName: "产线刷写",
    type: ["ELN", "OET 课程", "线上课程"],
    match: ["产线刷写"],
    description: "在生产线上，ECU软件需要批量刷写。vFlash Station可通过独立的CAN/CAN FD、LIN、FlexRay或以太网（DoIP）通道对多达10个ECU进行并行刷写。vFlash Station提供GUI界面在电脑上使用，也提供简单的C/C# API，用于创建您自己的应用程序，执行不同的自动化任务。在此站点，您将了解到vFlash Station的应用。",
  },
  "售后升级": {
    nodeName: "售后升级",
    type: ["ELN", "OET 课程", "线上课程"],
    match: ["售后升级"],
    description: "vFlash System Update可以按照客户定义的刷写顺序，通过单个通道更新一组ECU。在此站点，您将了解到vFlash System Update的应用。 vService轻松实现车辆持续更新/升级。vService为制造整车厂提供完全由整车厂控制的售后诊断、软件更新和车队监控的全面解决方案。vService将OTA和售后应用整合在一个完整的解决方案中，从而节省时间和金钱。",
  },
  "CANoe桌面版": {
    nodeName: "CANoe桌面版",
    type: ["B站", "ELN", "OET 课程", "线上课程", "CIT 课程"],
    match: ["CANoe桌面版"],
    description: "CANoe桌面版（即CANoe DE）支持众多总线系统，支持残余总线仿真、总线数据分析、测试开发及执行等功能。在此站点，您将学习CANoe的基础操作。",
  },
  "CANoe.DiVa": {
    nodeName: "CANoe.DiVa",
    type: ["ELN", "OET 课程", "线上课程"],
    match: ["CANoe.DiVa", "DiVa"],
    description: "DiVa是CANoe的一个扩展功能，用于自动化测试和验证ECU中诊断软件的实现，可根据CDD或ODX格式的ECU诊断描述生成可重复的测试用例。在此站点，您将学习CANoe.DiVa的使用方法。",
  },
  "Indigo": {
    nodeName: "Indigo",
    type: ["OET 课程", "线上课程"],
    match: ["Indigo"],
    description: "Indigo是一款易于使用且直观的诊断仪，适用于所有诊断任务，既可用于开发阶段，也可用于车间工作或生产售后。在此站点，您将了解工具Indigo。",
  },
  "SOVD": {
    nodeName: "SOVD",
    type: ["线上课程"],
    match: ["SOVD"],
    description: "SOVD以http REST为基础技术，可为远程、近场或车载诊断等各种应用场景提供智能访问通道。在此站点，您将学习SOVD标准。",
  },
  "SOVD Explorer": {
    nodeName: "SOVD Explorer",
    type: ["线上课程"],
    match: ["SOVD Explorer", "SOVDExplorer"],
    description: "SOVD Explorer作为原生的SOVD工程诊断仪，可以实现SOVD诊断交互。在此站点，您将学习如何应用SOVD Explorer。",
  },
  "Security概论": {
    nodeName: "Security概论",
    type: ["ELN"],
    match: ["Securitv概论", "Security概论", "Security 概论"],
    description: "在此站点，您将学习哈希算法、对称密钥、非对称密钥、MAC消息验证码、数字签名、证书、Diffie-Hellman密钥交换等密码技术，这是了解上层协议的基础。",
  },
  "UDS 0x27服务": {
    nodeName: "UDS 0x27服务",
    type: ["线上课程"],
    match: ["UDS 0x27服务", "UDS Ox27服务", "Ox27服务", "UDS0x27服务"],
    description: "UDS 0x27服务实现种子-密钥机制，用于控制访问权限，是最常见的诊断安全实现方式。在此站点，您将学习UDS 0x27服务的具体内容。",
  },
  "UDS 0x29服务": {
    nodeName: "UDS 0x29服务",
    type: ["线上课程"],
    match: ["UDS 0x29服务", "UDS Ox29服务", "Ox29服务", "UDS0x29服务"],
    description: "0x29用于更高级别的安全认证，支持更复杂的安全策略。在此站点，您将学习UDS 0x29服务的具体内容。",
  },
  "诊断安全配置": {
    nodeName: "诊断安全配置",
    type: ["线上课程"],
    match: ["诊断安全配置"],
    description: "Vector工具集成Security Manager插件，方便实现与OEM安全设施之间的链接。针对不同ECU的安全通信技术，均可通过通用化配置实现快速配置。在此站点，您将学习Security的相关配置。",
  }
};
