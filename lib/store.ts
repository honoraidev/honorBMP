import {
  Company,
  Department,
  Employee,
  AppraisalCycle,
  AppraisalForm,
  GoalItem,
  FixedItem,
  Tier,
  FIXED_ITEM_DEFS,
  RankingTier,
  FormStatus,
} from "./types";

// ---------- Seed data ----------
// Real 丞石集團 organizational data, transcribed from the group's org charts
// (組織圖_1~4，維護更新 2026/08/06) and the 2025 年度受評人員表's documented
// reviewer-chain rule: 「部主管以下，由處主管決；部主管（含）以上，由董事長決」。
// Employee numbers (SYS-xxx) and hire dates are system-generated placeholders —
// this prototype does not yet integrate with the real HRIS/工號 system.

export const COMPANIES: Company[] = [
  { id: "co1", name: "丞石建築開發股份有限公司" },
  { id: "co2", name: "大可營造有限公司" },
  { id: "co3", name: "大可廣告有限公司" },
  { id: "co4", name: "誠泰地產開發股份有限公司" },
];

export const DEPARTMENTS: Department[] = [
  { id: "co1-d01", companyId: "co1", name: "董事長室" },
  { id: "co1-d02", companyId: "co1", name: "顧問室" },
  { id: "co1-d03", companyId: "co1", name: "AI部" },
  { id: "co1-d04", companyId: "co1", name: "都更事業處" },
  { id: "co1-d05", companyId: "co1", name: "都更部" },
  { id: "co1-d06", companyId: "co1", name: "整合行銷部" },
  { id: "co1-d07", companyId: "co1", name: "業務開發處" },
  { id: "co1-d08", companyId: "co1", name: "業務部" },
  { id: "co1-d09", companyId: "co1", name: "售後服務部" },
  { id: "co1-d10", companyId: "co1", name: "財務會計處" },
  { id: "co1-d11", companyId: "co1", name: "人資部與法務部" },
  { id: "co1-d12", companyId: "co1", name: "總務部與資訊部" },
  { id: "co1-d13", companyId: "co1", name: "數位管理部" },
  { id: "co2-d14", companyId: "co2", name: "採購發包部" },
  { id: "co2-d15", companyId: "co2", name: "成本控制部" },
  { id: "co2-d16", companyId: "co2", name: "機電部" },
  { id: "co2-d17", companyId: "co2", name: "工務部（43工務組）" },
  { id: "co2-d18", companyId: "co2", name: "圖說管理部" },
  { id: "co3-d19", companyId: "co3", name: "甜點餐飲處" },
  { id: "co3-d20", companyId: "co3", name: "吧檯部" },
  { id: "co3-d21", companyId: "co3", name: "甜點部" },
  { id: "co3-d22", companyId: "co3", name: "銷售處" },
  { id: "co3-d23", companyId: "co3", name: "70銷售組" },
  { id: "co3-d24", companyId: "co3", name: "43銷售組" },
  { id: "co3-d25", companyId: "co3", name: "900銷售組" },
  { id: "co4-d26", companyId: "co4", name: "桃園都更事業處" },
  { id: "co4-d27", companyId: "co4", name: "園藝顧問室" },
  { id: "co4-d28", companyId: "co4", name: "園藝部" },
];

const EMPLOYEES_RAW: Omit<Employee, "primaryReviewerId" | "secondaryReviewerId">[] = [
  { id: "p001", name: "彭智祺", title: "董事長", employeeNo: "SYS-001", companyId: "co1", departmentId: "co1-d01", hireDate: "－", approverCompanyIds: ["co1","co2","co4"] },
  { id: "p002", name: "吳紜芯", title: "董事長特助", employeeNo: "SYS-002", companyId: "co1", departmentId: "co1-d01", hireDate: "－", approverCompanyIds: ["co3"] },
  { id: "p003", name: "曾之恩", title: "秘書", employeeNo: "SYS-003", companyId: "co1", departmentId: "co1-d01", hireDate: "－" },
  { id: "p004", name: "謝孟昌", title: "司機", employeeNo: "SYS-004", companyId: "co1", departmentId: "co1-d01", hireDate: "－" },
  { id: "p005", name: "楊志松", title: "顧問", employeeNo: "SYS-005", companyId: "co1", departmentId: "co1-d02", hireDate: "－" },
  { id: "p006", name: "高立瑜", title: "AI負責人", employeeNo: "SYS-006", companyId: "co1", departmentId: "co1-d03", hireDate: "－" },
  { id: "p007", name: "游欣樺", title: "實習生", employeeNo: "SYS-007", companyId: "co1", departmentId: "co1-d03", hireDate: "－" },
  { id: "p008", name: "林倖誼", title: "實習生", employeeNo: "SYS-008", companyId: "co1", departmentId: "co1-d03", hireDate: "－" },
  { id: "p009", name: "周奕均", title: "實習生", employeeNo: "SYS-009", companyId: "co1", departmentId: "co1-d03", hireDate: "－" },
  { id: "p010", name: "薛鴻偉", title: "都更事業處執行長", employeeNo: "SYS-010", companyId: "co1", departmentId: "co1-d04", hireDate: "－" },
  { id: "p011", name: "王將", title: "都更高級專員", employeeNo: "SYS-011", companyId: "co1", departmentId: "co1-d05", hireDate: "－" },
  { id: "p012", name: "吳駿宇", title: "都更高級專員", employeeNo: "SYS-012", companyId: "co1", departmentId: "co1-d05", hireDate: "－" },
  { id: "p013", name: "朱佳儀", title: "都更高級專員", employeeNo: "SYS-013", companyId: "co1", departmentId: "co1-d05", hireDate: "－" },
  { id: "p014", name: "邱渲涵", title: "行銷視覺設計", employeeNo: "SYS-014", companyId: "co1", departmentId: "co1-d06", hireDate: "－" },
  { id: "p015", name: "黃程裕", title: "業務協理", employeeNo: "SYS-015", companyId: "co1", departmentId: "co1-d07", hireDate: "－" },
  { id: "p016", name: "劉宜柔", title: "業務經理", employeeNo: "SYS-016", companyId: "co1", departmentId: "co1-d07", hireDate: "－" },
  { id: "p017", name: "林慧雯", title: "業務主任", employeeNo: "SYS-017", companyId: "co1", departmentId: "co1-d08", hireDate: "－" },
  { id: "p018", name: "莊欣穎", title: "業務行政", employeeNo: "SYS-018", companyId: "co1", departmentId: "co1-d08", hireDate: "－" },
  { id: "p019", name: "張雁婷", title: "業務行政", employeeNo: "SYS-019", companyId: "co1", departmentId: "co1-d08", hireDate: "－" },
  { id: "p020", name: "余璟明", title: "客服襄理", employeeNo: "SYS-020", companyId: "co1", departmentId: "co1-d09", hireDate: "－" },
  { id: "p021", name: "廖耘瑚", title: "客服專員", employeeNo: "SYS-021", companyId: "co1", departmentId: "co1-d09", hireDate: "－" },
  { id: "p022", name: "王仁謙", title: "客服主任", employeeNo: "SYS-022", companyId: "co1", departmentId: "co1-d09", hireDate: "－" },
  { id: "p023", name: "張仲廷", title: "財務經理", employeeNo: "SYS-023", companyId: "co1", departmentId: "co1-d10", hireDate: "－" },
  { id: "p024", name: "許家溱", title: "會計主任", employeeNo: "SYS-024", companyId: "co1", departmentId: "co1-d10", hireDate: "－" },
  { id: "p025", name: "許錦鳳", title: "會計主任", employeeNo: "SYS-025", companyId: "co1", departmentId: "co1-d10", hireDate: "－" },
  { id: "p026", name: "尤文慈", title: "出納主任", employeeNo: "SYS-026", companyId: "co1", departmentId: "co1-d10", hireDate: "－" },
  { id: "p027", name: "林瑋雯", title: "會計資深專員", employeeNo: "SYS-027", companyId: "co1", departmentId: "co1-d10", hireDate: "－" },
  { id: "p028", name: "伍珍瑩", title: "會計專員", employeeNo: "SYS-028", companyId: "co1", departmentId: "co1-d10", hireDate: "－" },
  { id: "p029", name: "高翊書", title: "人事行政處協理", employeeNo: "SYS-029", companyId: "co1", departmentId: "co1-d11", hireDate: "－", isHrAdmin: true },
  { id: "p030", name: "張瑞舫", title: "總務資訊副理", employeeNo: "SYS-030", companyId: "co1", departmentId: "co1-d12", hireDate: "－" },
  { id: "p031", name: "李姿涵", title: "總務專員", employeeNo: "SYS-031", companyId: "co1", departmentId: "co1-d12", hireDate: "－" },
  { id: "p032", name: "王暐婷", title: "總務專員", employeeNo: "SYS-032", companyId: "co1", departmentId: "co1-d12", hireDate: "－" },
  { id: "p033", name: "許舜堯", title: "資訊專員", employeeNo: "SYS-033", companyId: "co1", departmentId: "co1-d12", hireDate: "－" },
  { id: "p034", name: "曾柏鈞", title: "綜合管理專員", employeeNo: "SYS-034", companyId: "co1", departmentId: "co1-d11", hireDate: "－" },
  { id: "p035", name: "鄭剴文", title: "人資主任", employeeNo: "SYS-035", companyId: "co1", departmentId: "co1-d11", hireDate: "－", isHrAdmin: true },
  { id: "p036", name: "吳宗謙", title: "數位管理部經理", employeeNo: "SYS-036", companyId: "co1", departmentId: "co1-d13", hireDate: "－" },
  { id: "p037", name: "李思惠", title: "採發經理", employeeNo: "SYS-037", companyId: "co2", departmentId: "co2-d14", hireDate: "－" },
  { id: "p038", name: "黃國維", title: "成控經理", employeeNo: "SYS-038", companyId: "co2", departmentId: "co2-d15", hireDate: "－" },
  { id: "p039", name: "林京賢", title: "成控襄理", employeeNo: "SYS-039", companyId: "co2", departmentId: "co2-d15", hireDate: "－" },
  { id: "p040", name: "陳澤宏", title: "機電經理", employeeNo: "SYS-040", companyId: "co2", departmentId: "co2-d16", hireDate: "－" },
  { id: "p041", name: "廖銘源", title: "機電主任", employeeNo: "SYS-041", companyId: "co2", departmentId: "co2-d16", hireDate: "－" },
  { id: "p042", name: "陳柏勳", title: "機電副理", employeeNo: "SYS-042", companyId: "co2", departmentId: "co2-d16", hireDate: "－" },
  { id: "p043", name: "陳介民", title: "工務經理", employeeNo: "SYS-043", companyId: "co2", departmentId: "co2-d17", hireDate: "－" },
  { id: "p044", name: "高瑋宏", title: "工地副所長", employeeNo: "SYS-044", companyId: "co2", departmentId: "co2-d17", hireDate: "－" },
  { id: "p045", name: "林柏豪", title: "工地主任", employeeNo: "SYS-045", companyId: "co2", departmentId: "co2-d17", hireDate: "－" },
  { id: "p046", name: "許耀天", title: "工地副主任", employeeNo: "SYS-046", companyId: "co2", departmentId: "co2-d17", hireDate: "－" },
  { id: "p047", name: "吳憲宜", title: "工地副主任", employeeNo: "SYS-047", companyId: "co2", departmentId: "co2-d17", hireDate: "－" },
  { id: "p048", name: "周學裕", title: "勞安工程師", employeeNo: "SYS-048", companyId: "co2", departmentId: "co2-d17", hireDate: "－" },
  { id: "p049", name: "詹予妮", title: "工務助理", employeeNo: "SYS-049", companyId: "co2", departmentId: "co2-d17", hireDate: "－" },
  { id: "p050", name: "張人魁", title: "圖管經理", employeeNo: "SYS-050", companyId: "co2", departmentId: "co2-d18", hireDate: "－" },
  { id: "p051", name: "曹俊明", title: "圖管機電工程師", employeeNo: "SYS-051", companyId: "co2", departmentId: "co2-d18", hireDate: "－" },
  { id: "p052", name: "洪銓甫", title: "圖管土建工程師", employeeNo: "SYS-052", companyId: "co2", departmentId: "co2-d18", hireDate: "－" },
  { id: "p053", name: "陳宥菲", title: "圖管土建工程師", employeeNo: "SYS-053", companyId: "co2", departmentId: "co2-d18", hireDate: "－" },
  { id: "p054", name: "耿綺萱", title: "甜點餐飲主任", employeeNo: "SYS-054", companyId: "co3", departmentId: "co3-d19", hireDate: "－" },
  { id: "p055", name: "詹依雯", title: "吧檯組長", employeeNo: "SYS-055", companyId: "co3", departmentId: "co3-d20", hireDate: "－" },
  { id: "p056", name: "王苡安", title: "吧檯副組長", employeeNo: "SYS-056", companyId: "co3", departmentId: "co3-d20", hireDate: "－" },
  { id: "p057", name: "羅姿涵", title: "吧檯人員PT", employeeNo: "SYS-057", companyId: "co3", departmentId: "co3-d20", hireDate: "－" },
  { id: "p058", name: "趙宇婕", title: "吧檯人員PT", employeeNo: "SYS-058", companyId: "co3", departmentId: "co3-d20", hireDate: "－" },
  { id: "p059", name: "游珮琪", title: "吧檯人員PT", employeeNo: "SYS-059", companyId: "co3", departmentId: "co3-d20", hireDate: "－" },
  { id: "p060", name: "黃千漫", title: "吧檯人員PT", employeeNo: "SYS-060", companyId: "co3", departmentId: "co3-d20", hireDate: "－" },
  { id: "p061", name: "吳佳葳", title: "吧檯人員PT", employeeNo: "SYS-061", companyId: "co3", departmentId: "co3-d20", hireDate: "－" },
  { id: "p062", name: "孫霈晴", title: "主廚", employeeNo: "SYS-062", companyId: "co3", departmentId: "co3-d21", hireDate: "－" },
  { id: "p063", name: "張靖民", title: "副主廚", employeeNo: "SYS-063", companyId: "co3", departmentId: "co3-d21", hireDate: "－" },
  { id: "p064", name: "陳宏濬", title: "銷售顧問（赫泰）", employeeNo: "SYS-064", companyId: "co3", departmentId: "co3-d22", hireDate: "－" },
  { id: "p065", name: "陳康濬", title: "銷售主委（赫泰）", employeeNo: "SYS-065", companyId: "co3", departmentId: "co3-d22", hireDate: "－" },
  { id: "p066", name: "陳威志", title: "銷售專案（赫泰）", employeeNo: "SYS-066", companyId: "co3", departmentId: "co3-d23", hireDate: "－" },
  { id: "p067", name: "陳麗觀", title: "銷售專員", employeeNo: "SYS-067", companyId: "co3", departmentId: "co3-d23", hireDate: "－" },
  { id: "p068", name: "劉惠嵐", title: "銷售專員", employeeNo: "SYS-068", companyId: "co3", departmentId: "co3-d23", hireDate: "－" },
  { id: "p069", name: "陶昕琳", title: "銷售專員", employeeNo: "SYS-069", companyId: "co3", departmentId: "co3-d23", hireDate: "－" },
  { id: "p070", name: "藍心晨", title: "銷售專員", employeeNo: "SYS-070", companyId: "co3", departmentId: "co3-d23", hireDate: "－" },
  { id: "p071", name: "郭宇淳", title: "銷售行政", employeeNo: "SYS-071", companyId: "co3", departmentId: "co3-d23", hireDate: "－" },
  { id: "p072", name: "陳雅琴", title: "櫃台業務", employeeNo: "SYS-072", companyId: "co3", departmentId: "co3-d24", hireDate: "－" },
  { id: "p073", name: "許家寧", title: "品牌大使", employeeNo: "SYS-073", companyId: "co3", departmentId: "co3-d24", hireDate: "－" },
  { id: "p074", name: "洪毓君", title: "銷售專員", employeeNo: "SYS-074", companyId: "co3", departmentId: "co3-d24", hireDate: "－" },
  { id: "p075", name: "廖家興", title: "銷售專案", employeeNo: "SYS-075", companyId: "co3", departmentId: "co3-d25", hireDate: "－" },
  { id: "p076", name: "范芷瞬", title: "銷售專員", employeeNo: "SYS-076", companyId: "co3", departmentId: "co3-d25", hireDate: "－" },
  { id: "p077", name: "周家蓁", title: "銷售專員", employeeNo: "SYS-077", companyId: "co3", departmentId: "co3-d25", hireDate: "－" },
  { id: "p078", name: "劉香佩", title: "銷售行政", employeeNo: "SYS-078", companyId: "co3", departmentId: "co3-d25", hireDate: "－" },
  { id: "p079", name: "宋源環", title: "都更事業處執行長", employeeNo: "SYS-079", companyId: "co4", departmentId: "co4-d26", hireDate: "－" },
  { id: "p080", name: "林家如", title: "土地開發襄理", employeeNo: "SYS-080", companyId: "co4", departmentId: "co4-d26", hireDate: "－" },
  { id: "p081", name: "陳均翰", title: "土地開發高級專員", employeeNo: "SYS-081", companyId: "co4", departmentId: "co4-d26", hireDate: "－" },
  { id: "p082", name: "莊賀凱", title: "土地開發高級專員", employeeNo: "SYS-082", companyId: "co4", departmentId: "co4-d26", hireDate: "－" },
  { id: "p083", name: "鄧育涵", title: "土地開發高級專員", employeeNo: "SYS-083", companyId: "co4", departmentId: "co4-d26", hireDate: "－" },
  { id: "p084", name: "王姿蘋", title: "土地開發助理", employeeNo: "SYS-084", companyId: "co4", departmentId: "co4-d26", hireDate: "－" },
  { id: "p085", name: "宋銘祥", title: "園藝顧問", employeeNo: "SYS-085", companyId: "co4", departmentId: "co4-d27", hireDate: "－" },
  { id: "p086", name: "譚明龍", title: "工務襄理", employeeNo: "SYS-086", companyId: "co4", departmentId: "co4-d28", hireDate: "－" },
  { id: "p087", name: "李珮儀", title: "行政接待專員", employeeNo: "SYS-087", companyId: "co4", departmentId: "co4-d28", hireDate: "－" },
  { id: "p088", name: "林家輝", title: "園藝人員", employeeNo: "SYS-088", companyId: "co4", departmentId: "co4-d28", hireDate: "－" },
  { id: "p089", name: "洪金廷", title: "園藝人員", employeeNo: "SYS-089", companyId: "co4", departmentId: "co4-d28", hireDate: "－" },
  { id: "p090", name: "陳成熠", title: "園藝人員", employeeNo: "SYS-090", companyId: "co4", departmentId: "co4-d28", hireDate: "－" },
  { id: "p091", name: "蔡東蒴", title: "園藝人員", employeeNo: "SYS-091", companyId: "co4", departmentId: "co4-d28", hireDate: "－" },
  { id: "p092", name: "林新淵", title: "園藝人員", employeeNo: "SYS-092", companyId: "co4", departmentId: "co4-d28", hireDate: "－" },
  { id: "p093", name: "吳承翰", title: "園藝人員PT", employeeNo: "SYS-093", companyId: "co4", departmentId: "co4-d28", hireDate: "－" },
  { id: "p094", name: "李文瑜", title: "吧檯人員PT", employeeNo: "SYS-094", companyId: "co4", departmentId: "co4-d28", hireDate: "－" },
  { id: "p095", name: "王春梅", title: "澆水工PT", employeeNo: "SYS-095", companyId: "co4", departmentId: "co4-d28", hireDate: "－" },
  { id: "p096", name: "遠山紘一", title: "澆水工PT", employeeNo: "SYS-096", companyId: "co4", departmentId: "co4-d28", hireDate: "－" },
];

const REVIEW_MAP: Record<string, { primary: string | null; secondary: string | null }> = {
  p001: { primary: null, secondary: null },
  p002: { primary: "p001", secondary: null },
  p003: { primary: "p001", secondary: null },
  p004: { primary: "p001", secondary: null },
  p005: { primary: "p001", secondary: null },
  p006: { primary: "p001", secondary: null },
  p007: { primary: "p006", secondary: "p001" },
  p008: { primary: "p006", secondary: "p001" },
  p009: { primary: "p006", secondary: "p001" },
  p010: { primary: "p001", secondary: null },
  p011: { primary: "p010", secondary: "p001" },
  p012: { primary: "p010", secondary: "p001" },
  p013: { primary: "p010", secondary: "p001" },
  p014: { primary: "p010", secondary: "p001" },
  p015: { primary: "p001", secondary: null },
  p016: { primary: "p015", secondary: "p001" },
  p017: { primary: "p016", secondary: "p015" },
  p018: { primary: "p016", secondary: "p015" },
  p019: { primary: "p016", secondary: "p015" },
  p020: { primary: "p016", secondary: "p015" },
  p021: { primary: "p016", secondary: "p015" },
  p022: { primary: "p016", secondary: "p015" },
  p023: { primary: "p001", secondary: null },
  p024: { primary: "p023", secondary: "p001" },
  p025: { primary: "p023", secondary: "p001" },
  p026: { primary: "p023", secondary: "p001" },
  p027: { primary: "p023", secondary: "p001" },
  p028: { primary: "p023", secondary: "p001" },
  p029: { primary: "p001", secondary: null },
  p030: { primary: "p029", secondary: "p001" },
  p031: { primary: "p030", secondary: "p029" },
  p032: { primary: "p030", secondary: "p029" },
  p033: { primary: "p030", secondary: "p029" },
  p034: { primary: "p029", secondary: "p001" },
  p035: { primary: "p029", secondary: "p001" },
  p036: { primary: "p029", secondary: "p001" },
  p037: { primary: "p001", secondary: null },
  p038: { primary: "p001", secondary: null },
  p039: { primary: "p038", secondary: "p001" },
  p040: { primary: "p001", secondary: null },
  p041: { primary: "p040", secondary: "p001" },
  p042: { primary: "p040", secondary: "p001" },
  p043: { primary: "p001", secondary: null },
  p044: { primary: "p043", secondary: "p001" },
  p045: { primary: "p043", secondary: "p001" },
  p046: { primary: "p043", secondary: "p001" },
  p047: { primary: "p043", secondary: "p001" },
  p048: { primary: "p043", secondary: "p001" },
  p049: { primary: "p043", secondary: "p001" },
  p050: { primary: "p001", secondary: null },
  p051: { primary: "p050", secondary: "p001" },
  p052: { primary: "p050", secondary: "p001" },
  p053: { primary: "p050", secondary: "p001" },
  p054: { primary: "p015", secondary: "p001" },
  p055: { primary: "p054", secondary: "p015" },
  p056: { primary: "p054", secondary: "p015" },
  p057: { primary: "p054", secondary: "p015" },
  p058: { primary: "p054", secondary: "p015" },
  p059: { primary: "p054", secondary: "p015" },
  p060: { primary: "p054", secondary: "p015" },
  p061: { primary: "p054", secondary: "p015" },
  p062: { primary: "p054", secondary: "p015" },
  p063: { primary: "p054", secondary: "p015" },
  p064: { primary: "p002", secondary: null },
  p065: { primary: "p064", secondary: "p002" },
  p066: { primary: "p065", secondary: "p064" },
  p067: { primary: "p066", secondary: "p065" },
  p068: { primary: "p066", secondary: "p065" },
  p069: { primary: "p066", secondary: "p065" },
  p070: { primary: "p066", secondary: "p065" },
  p071: { primary: "p066", secondary: "p065" },
  p072: { primary: "p065", secondary: "p064" },
  p073: { primary: "p065", secondary: "p064" },
  p074: { primary: "p065", secondary: "p064" },
  p075: { primary: "p065", secondary: "p064" },
  p076: { primary: "p075", secondary: "p065" },
  p077: { primary: "p075", secondary: "p065" },
  p078: { primary: "p075", secondary: "p065" },
  p079: { primary: "p001", secondary: null },
  p080: { primary: "p079", secondary: "p001" },
  p081: { primary: "p079", secondary: "p001" },
  p082: { primary: "p079", secondary: "p001" },
  p083: { primary: "p079", secondary: "p001" },
  p084: { primary: "p079", secondary: "p001" },
  p085: { primary: "p001", secondary: null },
  p086: { primary: "p085", secondary: "p001" },
  p087: { primary: "p086", secondary: "p085" },
  p088: { primary: "p086", secondary: "p085" },
  p089: { primary: "p086", secondary: "p085" },
  p090: { primary: "p086", secondary: "p085" },
  p091: { primary: "p086", secondary: "p085" },
  p092: { primary: "p086", secondary: "p085" },
  p093: { primary: "p086", secondary: "p085" },
  p094: { primary: "p086", secondary: "p085" },
  p095: { primary: "p086", secondary: "p085" },
  p096: { primary: "p086", secondary: "p085" },
};

export const PASSWORD_MAP: Record<string, string> = {
  "SYS-001": "7obKd2A4",
  "SYS-002": "iiCq92pR",
  "SYS-003": "HvnKN5z7",
  "SYS-004": "nFgfAxdd",
  "SYS-005": "oxQZcUkG",
  "SYS-006": "U44rJQPF",
  "SYS-007": "g8p4Zv2n",
  "SYS-008": "3J5vmXEE",
  "SYS-009": "MGRLwj3G",
  "SYS-010": "nYAFm6L9",
  "SYS-011": "vwdvqPay",
  "SYS-012": "EiFw7JfT",
  "SYS-013": "eY29edXS",
  "SYS-014": "DqyP3Jo7",
  "SYS-015": "zWG7CofY",
  "SYS-016": "cKaGrGR9",
  "SYS-017": "eNvozWAh",
  "SYS-018": "oioAXiQB",
  "SYS-019": "E4NMQzMT",
  "SYS-020": "uHrFnya9",
  "SYS-021": "tW6PCsVC",
  "SYS-022": "WdcTNYHd",
  "SYS-023": "ntizi78N",
  "SYS-024": "DubjbyZ9",
  "SYS-025": "W9at9YMm",
  "SYS-026": "FYVHpiPx",
  "SYS-027": "bJNLVM4c",
  "SYS-028": "hE7bATs9",
  "SYS-029": "brJTWXti",
  "SYS-030": "EQyqLGPQ",
  "SYS-031": "BFpjf7x4",
  "SYS-032": "TP2zjJeM",
  "SYS-033": "a6g9bwhp",
  "SYS-034": "nnRkXiA5",
  "SYS-035": "WEZCLP4J",
  "SYS-036": "JYQ5yrbX",
  "SYS-037": "d9c6CbcX",
  "SYS-038": "vTQPJgfX",
  "SYS-039": "wxk7cGjR",
  "SYS-040": "eLxEQJPF",
  "SYS-041": "4wQCekNZ",
  "SYS-042": "TEdDJuLs",
  "SYS-043": "acdGvtWp",
  "SYS-044": "QXbJyZdS",
  "SYS-045": "Y7azX5yX",
  "SYS-046": "aUQjtbG4",
  "SYS-047": "sEcZTMzS",
  "SYS-048": "6JfxN34x",
  "SYS-049": "BaGqhrD2",
  "SYS-050": "sEqAdDSJ",
  "SYS-051": "dpPdb3QW",
  "SYS-052": "P3BeHNML",
  "SYS-053": "gcU7Rrio",
  "SYS-054": "J2McpTuQ",
  "SYS-055": "ZCuwE2hb",
  "SYS-056": "LZRyCXrK",
  "SYS-057": "iJ6WcH9z",
  "SYS-058": "koC2ReUG",
  "SYS-059": "V2Ld9fd3",
  "SYS-060": "cdnEMQFS",
  "SYS-061": "yoaq6BfT",
  "SYS-062": "iAPpcxzA",
  "SYS-063": "ajH8UG9b",
  "SYS-064": "CwNCVnXH",
  "SYS-065": "t5oWtHje",
  "SYS-066": "FqA7NFz3",
  "SYS-067": "XYxaLZ45",
  "SYS-068": "mJQPQDLg",
  "SYS-069": "h3HfYLBw",
  "SYS-070": "B3EuGAH6",
  "SYS-071": "CYM3abZH",
  "SYS-072": "FZd2UWwX",
  "SYS-073": "gMpyD8ec",
  "SYS-074": "n29hdeLS",
  "SYS-075": "JeAA75GT",
  "SYS-076": "QTxbz6Wc",
  "SYS-077": "nFNspSNH",
  "SYS-078": "Yy6qmFRy",
  "SYS-079": "yLQq4ZJx",
  "SYS-080": "G6ihbjWz",
  "SYS-081": "P6WDRRGM",
  "SYS-082": "H8T9FnLT",
  "SYS-083": "3FnFzbNu",
  "SYS-084": "Zydzxo2h",
  "SYS-085": "pVK9HRKe",
  "SYS-086": "QrFwo8hz",
  "SYS-087": "SAbTgMmf",
  "SYS-088": "CcEAbcFs",
  "SYS-089": "tCfVHVAg",
  "SYS-090": "bTRV2evW",
  "SYS-091": "AFJBHGkN",
  "SYS-092": "gjUN9rfV",
  "SYS-093": "M3a9XcEc",
  "SYS-094": "nu6xbiSK",
  "SYS-095": "nXWFTzfR",
  "SYS-096": "eUjNQTbX",
};

export const TOP_CHAIRMAN_ID = "p001"; // 彭智祺 — group top, no appraisal form

const EMPLOYEES: Employee[] = EMPLOYEES_RAW.map((e) => ({
  ...e,
  password: "1",
  primaryReviewerId: REVIEW_MAP[e.id]?.primary ?? null,
  secondaryReviewerId: REVIEW_MAP[e.id]?.secondary ?? null,
}));

export function verifyCredentials(account: string, pass: string): Employee | null {
  const normAccount = account.trim().toUpperCase();
  const normPass = pass.trim();
  
  const emp = getStore().employees.find(
    (e) => e.employeeNo.toUpperCase() === normAccount || e.name === account.trim()
  );
  if (!emp) return null;
  
  const expectedPass = emp.password || PASSWORD_MAP[emp.employeeNo];
  if (expectedPass && expectedPass === normPass) {
    return emp;
  }
  return null;
}

const CYCLE: AppraisalCycle = {
  id: "cy115",
  label: "115年度（2026年度）績效考核",
  year: "115",
  phases: {
    announce: "2026-11-21",
    selfStart: "2026-11-21",
    selfEnd: "2026-12-03",
    primaryStart: "2026-12-03",
    primaryEnd: "2026-12-12",
    secondaryStart: "2026-12-12",
    secondaryEnd: "2026-12-22",
    hrDeadline: "2026-12-22",
  },
  status: "active",
};

function defaultGoalItems(): GoalItem[] {
  return [
    { order: 1, title: "", standardDesc: "", weight: 20, selfTier: null, primaryTier: null },
    { order: 2, title: "", standardDesc: "", weight: 20, selfTier: null, primaryTier: null },
    { order: 3, title: "", standardDesc: "", weight: 20, selfTier: null, primaryTier: null },
    { order: 4, title: "", standardDesc: "", weight: 15, selfTier: null, primaryTier: null },
  ];
}

function defaultFixedItems(): FixedItem[] {
  return FIXED_ITEM_DEFS.map((d) => ({ key: d.key, label: d.label, weight: 5, selfTier: null, primaryTier: null }));
}

function seedForms(): AppraisalForm[] {
  // Every employee gets a form except the group's top chairman (no one reviews him).
  return EMPLOYEES.filter((e) => e.id !== TOP_CHAIRMAN_ID).map((e) => ({
    id: `f-${e.id}`,
    cycleId: CYCLE.id,
    employeeId: e.id,
    goalItems: defaultGoalItems(),
    fixedItems: defaultFixedItems(),
    bonusMalus: 0,
    selfFeedbackGrowth: "",
    selfFeedbackNextYear: "",
    primaryComment: "",
    secondaryComment: "",
    secondaryDevAssessment: "",
    rankingTier: null,
    rankingOverrideReason: "",
    status: "goal_setting" as FormStatus,
    signatures: {},
    history: [{ at: new Date().toISOString(), actor: "系統", action: "建立考核表" }],
  }));
}

// ---------- In-memory store (demo only — resets on cold start / redeploy) ----------

interface Store {
  companies: Company[];
  departments: Department[];
  employees: Employee[];
  cycle: AppraisalCycle;
  forms: AppraisalForm[];
}

function freshStore(): Store {
  return {
    companies: COMPANIES,
    departments: DEPARTMENTS,
    employees: EMPLOYEES,
    cycle: { ...CYCLE, phases: { ...CYCLE.phases } },
    forms: seedForms(),
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __APPRAISAL_STORE__: Store | undefined;
}

export function getStore(): Store {
  if (!globalThis.__APPRAISAL_STORE__) {
    globalThis.__APPRAISAL_STORE__ = freshStore();
  }
  return globalThis.__APPRAISAL_STORE__;
}

export function resetStore() {
  globalThis.__APPRAISAL_STORE__ = freshStore();
  persist();
}

// ---------- Persistence (optional, MariaDB/MySQL) ----------
// Only workflow state (forms + cycle) is stored. Org data (companies /
// departments / employees) always comes from the seed in this file.

const STATE_ID = 1;

async function ensureTable() {
  const { getPool } = await import("./db");
  await getPool().query(
    `CREATE TABLE IF NOT EXISTS chengshi_appraisal_state (
       id INT PRIMARY KEY,
       data LONGTEXT NOT NULL,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );
}

export async function hydrateStoreFromDb(): Promise<void> {
  const { dbEnabled, getPool } = await import("./db");
  if (!dbEnabled()) return;
  try {
    await ensureTable();
    const [rows] = (await getPool().query(
      "SELECT data FROM chengshi_appraisal_state WHERE id = ?",
      [STATE_ID]
    )) as unknown as [{ data: string }[], unknown];

    const base = freshStore();
    if (rows.length > 0) {
      const saved = JSON.parse(rows[0].data) as { forms?: AppraisalForm[]; cycle?: AppraisalCycle };
      if (saved.forms) base.forms = saved.forms;
      if (saved.cycle) base.cycle = saved.cycle;
    }
    globalThis.__APPRAISAL_STORE__ = base;

    if (rows.length === 0) await persistStore();
    // eslint-disable-next-line no-console
    console.log(`[store] hydrated from DB (${base.forms.length} forms)`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[store] DB hydrate failed, using in-memory seed:", err);
  }
}

export async function persistStore(): Promise<void> {
  const { dbEnabled, getPool } = await import("./db");
  if (!dbEnabled()) return;
  const store = getStore();
  const data = JSON.stringify({ forms: store.forms, cycle: store.cycle });
  await ensureTable();
  await getPool().query(
    "INSERT INTO chengshi_appraisal_state (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)",
    [STATE_ID, data]
  );
}

/** Fire-and-forget save; safe to call from sync code. No-op without DB env. */
export function persist(): void {
  persistStore().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[store] persist failed:", err);
  });
}

// ---------- Query helpers ----------

export function getEmployee(id: string): Employee | undefined {
  return getStore().employees.find((e) => e.id === id);
}

export function getCompany(id: string): Company | undefined {
  return getStore().companies.find((c) => c.id === id);
}

export function getDepartment(id: string): Department | undefined {
  return getStore().departments.find((d) => d.id === id);
}

export function getForm(id: string): AppraisalForm | undefined {
  return getStore().forms.find((f) => f.id === id);
}

export function getFormByEmployee(employeeId: string): AppraisalForm | undefined {
  return getStore().forms.find((f) => f.employeeId === employeeId);
}

export function formsAsPrimary(employeeId: string): AppraisalForm[] {
  return getStore().forms.filter((f) => getEmployee(f.employeeId)?.primaryReviewerId === employeeId);
}

export function formsAsSecondary(employeeId: string): AppraisalForm[] {
  return getStore().forms.filter((f) => getEmployee(f.employeeId)?.secondaryReviewerId === employeeId);
}

export function allForms(): AppraisalForm[] {
  return getStore().forms;
}

// ---------- Scoring logic ----------

export function tierMultiplier(tier: Tier | null): number {
  if (tier === "exceed") return 1.0;
  if (tier === "meet") return 0.8;
  if (tier === "below") return 0.6;
  return 0;
}

export function goalItemScore(item: GoalItem): number {
  const tier = item.primaryTier ?? item.selfTier;
  return Math.round(item.weight * tierMultiplier(tier) * 10) / 10;
}

export function fixedItemScore(item: FixedItem): number {
  const tier = item.primaryTier ?? item.selfTier;
  // fixed items map exceed/meet/below -> 5/3/1 as per the original paper form
  if (!tier) return 0;
  if (tier === "exceed") return 5;
  if (tier === "meet") return 3;
  return 1;
}

export function goalWeightSum(items: GoalItem[]): number {
  return items.reduce((s, i) => s + i.weight, 0);
}

export function computeTotal(form: AppraisalForm): number {
  const goalTotal = form.goalItems.reduce((s, i) => s + goalItemScore(i), 0);
  const fixedTotal = form.fixedItems.reduce((s, i) => s + fixedItemScore(i), 0);
  return Math.round((goalTotal + fixedTotal + (form.bonusMalus || 0)) * 10) / 10;
}

export const STATUS_LABEL: Record<FormStatus, string> = {
  goal_setting: "待自評／目標設定",
  self: "初評中",
  primary: "複評中",
  secondary: "待人資彙整",
  hr_review: "待核決",
  approved: "已核決",
  returned: "已退回",
};

export const STATUS_ORDER: FormStatus[] = ["goal_setting", "self", "primary", "secondary", "hr_review", "approved"];

export function pushHistory(form: AppraisalForm, actor: string, action: string, note?: string) {
  form.history.push({ at: new Date().toISOString(), actor, action, note });
  persist();
}

// ---------- Ranking distribution ----------

export function tierCounts(forms: AppraisalForm[]): Record<RankingTier, number> {
  const counts: Record<RankingTier, number> = { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0 };
  forms.forEach((f) => {
    if (f.rankingTier) counts[f.rankingTier]++;
  });
  return counts;
}

export function departmentEmployeeCount(departmentId: string): number {
  return getStore().employees.filter((e) => e.departmentId === departmentId && e.id !== TOP_CHAIRMAN_ID).length;
}
