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
  FormAttachment,
  FormTemplate,
  DepartmentReviewConfig,
} from "./types";
import type { HandbookEntry } from "./handbook";

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
  const now = new Date().toISOString();
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
    history: [{ at: now, actor: "系統", action: "建立考核表" }],
    attachments: [],
    customFieldValues: {},
    rejectHistory: [],
    lastStatusChangedAt: now,
  }));
}

// ---------- In-memory store (demo only — resets on cold start / redeploy) ----------

type EmployeeOverride = { avatarUrl?: string; password?: string };

interface Store {
  companies: Company[];
  departments: Department[];
  employees: Employee[];
  cycle: AppraisalCycle;
  forms: AppraisalForm[];
  employeeOverrides: Record<string, EmployeeOverride>;
  /** People added at runtime by HR (not in the seed). Persisted so they
   *  survive restarts; merged into `employees` on hydrate. */
  newEmployees: Employee[];
  /** Manager-added handbook content (notes + uploaded files). Persisted in its
   *  own table; file bytes live on the object only in no-DB mode. */
  handbookEntries: HandbookEntry[];
  /** HR-managed custom form templates (extra fields appended to appraisal forms). */
  formTemplates: FormTemplate[];
  /** Per-department default reviewer config (overrides individual employee settings). */
  deptReviewConfigs: DepartmentReviewConfig[];
  /** IDs of employees soft-deleted by HR; filtered out on every hydrate. */
  deletedEmployeeIds: string[];
}

function freshStore(): Store {
  return {
    companies: COMPANIES,
    departments: DEPARTMENTS,
    // clone so profile edits (avatar/password) never mutate the shared seed array
    employees: EMPLOYEES.map((e) => ({ ...e })),
    cycle: { ...CYCLE, phases: { ...CYCLE.phases } },
    forms: seedForms(),
    employeeOverrides: {},
    newEmployees: [],
    handbookEntries: [],
    formTemplates: [],
    deptReviewConfigs: [],
    deletedEmployeeIds: [],
  };
}

/** Merge HR-created employees back into a fresh store during hydrate. */
function mergeNewEmployees(store: Store, list: Employee[]) {
  store.newEmployees = list.map((e) => ({ ...e }));
  for (const e of store.newEmployees) {
    if (!store.employees.some((x) => x.id === e.id)) store.employees.push({ ...e });
  }
}

function applyEmployeeOverrides(store: Store, overrides: Record<string, EmployeeOverride>) {
  store.employeeOverrides = overrides;
  for (const [id, patch] of Object.entries(overrides)) {
    const emp = store.employees.find((e) => e.id === id);
    if (!emp) continue;
    if (patch.avatarUrl !== undefined) emp.avatarUrl = patch.avatarUrl;
    if (patch.password !== undefined) emp.password = patch.password;
  }
}

/** Update one employee's avatar and/or password; persists immediately. */
export function updateEmployeeProfile(employeeId: string, patch: EmployeeOverride) {
  const store = getStore();
  const emp = store.employees.find((e) => e.id === employeeId);
  if (!emp) return;
  if (patch.avatarUrl !== undefined) emp.avatarUrl = patch.avatarUrl;
  if (patch.password !== undefined) emp.password = patch.password;
  store.employeeOverrides[employeeId] = { ...store.employeeOverrides[employeeId], ...patch };
  persist();
  persistEmployee(emp);
}

export interface NewEmployeeInput {
  name: string;
  employeeNo: string;
  title: string;
  departmentId: string;
  primaryReviewerId: string | null;
  secondaryReviewerId: string | null;
  isHrAdmin?: boolean;
  approverCompanyIds?: string[];
  password?: string;
}

/** True for a person added at runtime by HR (id prefix `emp-`), not from the seed. */
export function isHrCreatedEmployee(id: string): boolean {
  return id.startsWith("emp-");
}

/**
 * Create a new employee (HR only). Company is derived from the chosen department.
 * Also seeds this cycle's appraisal form so the person enters the workflow.
 * Persists immediately.
 */
export function createEmployee(input: NewEmployeeInput): { employee: Employee } | { error: string } {
  const store = getStore();
  const name = input.name.trim();
  const employeeNo = input.employeeNo.trim().toUpperCase();
  const title = input.title.trim();

  if (!name || !employeeNo || !title) return { error: "請完整填寫姓名、工號與職稱" };

  const dept = store.departments.find((d) => d.id === input.departmentId);
  if (!dept) return { error: "請選擇部門" };

  if (store.employees.some((e) => e.employeeNo.toUpperCase() === employeeNo)) {
    return { error: `工號 ${employeeNo} 已存在` };
  }
  if (store.employees.some((e) => e.name === name)) {
    return { error: `系統已有同名人員「${name}」，請確認是否重複建立` };
  }

  const validReviewer = (rid: string | null) =>
    !rid || store.employees.some((e) => e.id === rid);
  if (!validReviewer(input.primaryReviewerId) || !validReviewer(input.secondaryReviewerId)) {
    return { error: "指定的主管不存在" };
  }

  const approverCompanyIds = (input.approverCompanyIds ?? []).filter((cid) =>
    store.companies.some((c) => c.id === cid)
  );

  const id = `emp-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const employee: Employee = {
    id,
    name,
    title,
    employeeNo,
    password: input.password?.trim() || "1",
    companyId: dept.companyId,
    departmentId: dept.id,
    hireDate: "－",
    primaryReviewerId: input.primaryReviewerId || null,
    secondaryReviewerId: input.secondaryReviewerId || null,
    ...(input.isHrAdmin ? { isHrAdmin: true } : {}),
    ...(approverCompanyIds.length ? { approverCompanyIds } : {}),
  };

  store.employees.push(employee);
  store.newEmployees.push({ ...employee });

  const newFormNow = new Date().toISOString();
  store.forms.push({
    id: `f-${id}`,
    cycleId: store.cycle.id,
    employeeId: id,
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
    status: "goal_setting",
    signatures: {},
    history: [{ at: newFormNow, actor: "人資", action: "建立人員與考核表" }],
    attachments: [],
    customFieldValues: {},
    rejectHistory: [],
    lastStatusChangedAt: newFormNow,
  });

  persist();
  persistEmployee(employee);
  return { employee };
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
  reseedEmployeesTable().catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[store] personnel reseed failed:", err);
  });
}

// ---------- Persistence (optional, MariaDB/MySQL) ----------
// Workflow state (forms + cycle) is stored as a JSON blob in
// `chengshi_appraisal_state`. Personnel data lives as real rows in
// `chengshi_employees` (seeded once from the array in this file, then the DB
// is the source of truth — HR edits/creates write straight through).
// Companies / departments still come from the seed in this file.

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

// ---------- Personnel table (chengshi_employees) ----------

/* eslint-disable @typescript-eslint/no-explicit-any */

async function ensureEmployeesTable() {
  const { getPool } = await import("./db");
  await getPool().query(
    `CREATE TABLE IF NOT EXISTS chengshi_employees (
       id                    VARCHAR(64) PRIMARY KEY,
       name                  VARCHAR(100) NOT NULL,
       title                 VARCHAR(100) NOT NULL,
       employee_no           VARCHAR(50) NOT NULL,
       password              VARCHAR(255),
       avatar_url            LONGTEXT,
       company_id            VARCHAR(20) NOT NULL,
       department_id         VARCHAR(20) NOT NULL,
       hire_date             VARCHAR(20),
       primary_reviewer_id   VARCHAR(64),
       secondary_reviewer_id VARCHAR(64),
       is_hr_admin           TINYINT(1) NOT NULL DEFAULT 0,
       approver_company_ids  VARCHAR(255),
       source                VARCHAR(10) NOT NULL DEFAULT 'seed',
       updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       UNIQUE KEY uq_employee_no (employee_no)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );
}

function rowToEmployee(r: any): Employee {
  return {
    id: r.id,
    name: r.name,
    title: r.title,
    employeeNo: r.employee_no,
    password: r.password ?? "1",
    ...(r.avatar_url ? { avatarUrl: r.avatar_url as string } : {}),
    companyId: r.company_id,
    departmentId: r.department_id,
    hireDate: r.hire_date ?? "－",
    primaryReviewerId: r.primary_reviewer_id || null,
    secondaryReviewerId: r.secondary_reviewer_id || null,
    ...(r.is_hr_admin ? { isHrAdmin: true } : {}),
    ...(r.approver_company_ids
      ? { approverCompanyIds: String(r.approver_company_ids).split(",").filter(Boolean) }
      : {}),
  };
}

function employeeParams(e: Employee, source: "seed" | "hr"): any[] {
  return [
    e.id,
    e.name,
    e.title,
    e.employeeNo,
    e.password ?? "1",
    e.avatarUrl ?? null,
    e.companyId,
    e.departmentId,
    e.hireDate ?? "－",
    e.primaryReviewerId ?? null,
    e.secondaryReviewerId ?? null,
    e.isHrAdmin ? 1 : 0,
    e.approverCompanyIds?.length ? e.approverCompanyIds.join(",") : null,
    source,
  ];
}

async function upsertEmployeeRow(e: Employee, source: "seed" | "hr"): Promise<void> {
  const { dbEnabled, getPool } = await import("./db");
  if (!dbEnabled()) return;
  await ensureEmployeesTable();
  await getPool().query(
    `INSERT INTO chengshi_employees
       (id, name, title, employee_no, password, avatar_url, company_id, department_id,
        hire_date, primary_reviewer_id, secondary_reviewer_id, is_hr_admin,
        approver_company_ids, source)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name), title = VALUES(title), employee_no = VALUES(employee_no),
       password = VALUES(password), avatar_url = VALUES(avatar_url),
       company_id = VALUES(company_id), department_id = VALUES(department_id),
       hire_date = VALUES(hire_date), primary_reviewer_id = VALUES(primary_reviewer_id),
       secondary_reviewer_id = VALUES(secondary_reviewer_id), is_hr_admin = VALUES(is_hr_admin),
       approver_company_ids = VALUES(approver_company_ids)`,
    employeeParams(e, source)
  );
}

/** Fire-and-forget personnel-row save; safe from sync code. No-op without DB env. */
export function persistEmployee(emp: Employee): void {
  upsertEmployeeRow(emp, isHrCreatedEmployee(emp.id) ? "hr" : "seed").catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[store] persist employee failed:", err);
  });
}

async function deleteEmployeeRow(id: string): Promise<void> {
  const { dbEnabled, getPool } = await import("./db");
  if (!dbEnabled()) return;
  await ensureEmployeesTable();
  await getPool().query("DELETE FROM chengshi_employees WHERE id = ?", [id]);
}

/**
 * Delete an employee (HR only). Removes from memory store + DB.
 * Their appraisal form is kept for archive. Returns error string if not allowed.
 */
export function deleteEmployee(id: string): { ok: true } | { error: string } {
  const store = getStore();
  const idx = store.employees.findIndex((e) => e.id === id);
  if (idx < 0) return { error: "找不到員工" };
  store.employees.splice(idx, 1);
  // Also remove from newEmployees list
  store.newEmployees = store.newEmployees.filter((e) => e.id !== id);
  if (!store.deletedEmployeeIds.includes(id)) store.deletedEmployeeIds.push(id);
  persist();
  deleteEmployeeRow(id).catch((err) => console.error("[store] delete employee row failed:", err));
  return { ok: true };
}

/** Wipe and re-seed the personnel table from the file seed (used by demo reset). */
export async function reseedEmployeesTable(): Promise<void> {
  const { dbEnabled, getPool } = await import("./db");
  if (!dbEnabled()) return;
  await ensureEmployeesTable();
  await getPool().query("DELETE FROM chengshi_employees");
  for (const e of EMPLOYEES) await upsertEmployeeRow(e, "seed");
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------- Handbook entries (chengshi_handbook_entries) ----------

/* eslint-disable @typescript-eslint/no-explicit-any */

async function ensureHandbookTable() {
  const { getPool } = await import("./db");
  await getPool().query(
    `CREATE TABLE IF NOT EXISTS chengshi_handbook_entries (
       id            VARCHAR(64) PRIMARY KEY,
       manual_slug   VARCHAR(64) NOT NULL,
       section_slug  VARCHAR(64) NOT NULL,
       kind          VARCHAR(10) NOT NULL,
       text          LONGTEXT,
       file_name     VARCHAR(255),
       file_mime     VARCHAR(120),
       file_size     VARCHAR(30),
       file_data     LONGTEXT,
       created_by    VARCHAR(100) NOT NULL,
       created_by_id VARCHAR(64) NOT NULL,
       created_at    VARCHAR(40) NOT NULL,
       KEY idx_section (manual_slug, section_slug)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
  );
}

function rowToHandbookEntry(r: any, withData = false): HandbookEntry {
  return {
    id: r.id,
    manualSlug: r.manual_slug,
    sectionSlug: r.section_slug,
    kind: r.kind,
    ...(r.text ? { text: r.text as string } : {}),
    ...(r.file_name ? { fileName: r.file_name as string } : {}),
    ...(r.file_mime ? { fileMime: r.file_mime as string } : {}),
    ...(r.file_size ? { fileSize: r.file_size as string } : {}),
    ...(withData && r.file_data ? { fileData: r.file_data as string } : {}),
    createdBy: r.created_by,
    createdById: r.created_by_id,
    createdAt: r.created_at,
  };
}

async function insertHandbookRow(e: HandbookEntry): Promise<void> {
  const { dbEnabled, getPool } = await import("./db");
  if (!dbEnabled()) return;
  await ensureHandbookTable();
  await getPool().query(
    `INSERT INTO chengshi_handbook_entries
       (id, manual_slug, section_slug, kind, text, file_name, file_mime, file_size,
        file_data, created_by, created_by_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      e.id,
      e.manualSlug,
      e.sectionSlug,
      e.kind,
      e.text ?? null,
      e.fileName ?? null,
      e.fileMime ?? null,
      e.fileSize ?? null,
      e.fileData ?? null,
      e.createdBy,
      e.createdById,
      e.createdAt,
    ]
  );
}

async function deleteHandbookRow(id: string): Promise<void> {
  const { dbEnabled, getPool } = await import("./db");
  if (!dbEnabled()) return;
  await ensureHandbookTable();
  await getPool().query("DELETE FROM chengshi_handbook_entries WHERE id = ?", [id]);
}

/* eslint-enable @typescript-eslint/no-explicit-any */

export async function hydrateStoreFromDb(): Promise<void> {
  const { dbEnabled, getPool } = await import("./db");
  if (!dbEnabled()) return;
  try {
    await ensureTable();

    const base = freshStore();

    // Personnel: seed the table once, then treat the DB as source of truth.
    try {
      await ensureEmployeesTable();
      const [erows] = (await getPool().query(
        "SELECT * FROM chengshi_employees"
      )) as unknown as [Record<string, unknown>[], unknown];
      if (erows.length === 0) {
        for (const e of EMPLOYEES) await upsertEmployeeRow(e, "seed");
        base.employees = EMPLOYEES.map((e) => ({ ...e }));
      } else {
        base.employees = erows.map(rowToEmployee);
      }
      // eslint-disable-next-line no-console
      console.log(`[store] personnel loaded from DB (${base.employees.length} people)`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[store] personnel table hydrate failed, using file seed:", err);
    }

    // Manager-added handbook content (metadata only; file bytes stay in the DB).
    try {
      await ensureHandbookTable();
      const [hrows] = (await getPool().query(
        `SELECT id, manual_slug, section_slug, kind, text, file_name, file_mime, file_size,
                created_by, created_by_id, created_at
           FROM chengshi_handbook_entries ORDER BY created_at ASC`
      )) as unknown as [Record<string, unknown>[], unknown];
      base.handbookEntries = hrows.map((r) => rowToHandbookEntry(r));
      // eslint-disable-next-line no-console
      console.log(`[store] handbook entries loaded from DB (${base.handbookEntries.length})`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[store] handbook table hydrate failed:", err);
    }

    const [rows] = (await getPool().query(
      "SELECT data FROM chengshi_appraisal_state WHERE id = ?",
      [STATE_ID]
    )) as unknown as [{ data: string }[], unknown];

    if (rows.length > 0) {
      const saved = JSON.parse(rows[0].data) as {
        forms?: AppraisalForm[];
        cycle?: AppraisalCycle;
        employeeOverrides?: Record<string, EmployeeOverride>;
        newEmployees?: Employee[];
        formTemplates?: FormTemplate[];
        deptReviewConfigs?: DepartmentReviewConfig[];
        deletedEmployeeIds?: string[];
      };
      if (saved.newEmployees) mergeNewEmployees(base, saved.newEmployees);
      if (saved.forms) {
        // Migrate old forms that lack new fields
        base.forms = saved.forms.map((f) => ({
          attachments: [],
          customFieldValues: {},
          rejectHistory: [],
          lastStatusChangedAt: f.history?.[f.history.length - 1]?.at ?? new Date().toISOString(),
          ...f,
        }));
      }
      if (saved.cycle) base.cycle = saved.cycle;
      if (saved.employeeOverrides) applyEmployeeOverrides(base, saved.employeeOverrides);
      if (saved.formTemplates) base.formTemplates = saved.formTemplates;
      if (saved.deptReviewConfigs) base.deptReviewConfigs = saved.deptReviewConfigs;
      if (saved.deletedEmployeeIds) {
        base.deletedEmployeeIds = saved.deletedEmployeeIds;
        // Filter deleted employees out of base.employees
        base.employees = base.employees.filter((e) => !saved.deletedEmployeeIds!.includes(e.id));
        base.newEmployees = base.newEmployees.filter((e) => !saved.deletedEmployeeIds!.includes(e.id));
      }
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
  const data = JSON.stringify({
    forms: store.forms,
    cycle: store.cycle,
    employeeOverrides: store.employeeOverrides,
    newEmployees: store.newEmployees,
    formTemplates: store.formTemplates,
    deptReviewConfigs: store.deptReviewConfigs,
    deletedEmployeeIds: store.deletedEmployeeIds,
  });
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

// ---------- Handbook: manager-added content ----------

/** True if this person may add notes / files to the handbook: HR admins,
 *  approvers, or anyone who is a primary/secondary reviewer of at least one
 *  employee (i.e. a line manager). */
export function canEditHandbook(user: Employee): boolean {
  if (user.isHrAdmin || user.approverCompanyIds?.length) return true;
  return getStore().employees.some(
    (e) => e.primaryReviewerId === user.id || e.secondaryReviewerId === user.id
  );
}

export function getHandbookEntries(manualSlug: string, sectionSlug: string): HandbookEntry[] {
  return getStore().handbookEntries.filter(
    (e) => e.manualSlug === manualSlug && e.sectionSlug === sectionSlug
  );
}

function newHandbookId() {
  return `hb-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function addHandbookNote(input: {
  manualSlug: string;
  sectionSlug: string;
  text: string;
  user: Employee;
}): { entry: HandbookEntry } | { error: string } {
  const text = input.text.trim();
  if (!text) return { error: "請輸入內容" };
  if (text.length > 4000) return { error: "內容過長（上限 4000 字）" };
  const entry: HandbookEntry = {
    id: newHandbookId(),
    manualSlug: input.manualSlug,
    sectionSlug: input.sectionSlug,
    kind: "note",
    text,
    createdBy: input.user.name,
    createdById: input.user.id,
    createdAt: new Date().toISOString(),
  };
  getStore().handbookEntries.push(entry);
  insertHandbookRow(entry).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[store] handbook note persist failed:", err);
  });
  return { entry };
}

const MAX_HANDBOOK_FILE_BYTES = 10 * 1024 * 1024;

export function addHandbookFile(input: {
  manualSlug: string;
  sectionSlug: string;
  fileName: string;
  fileMime: string;
  dataBase64: string;
  user: Employee;
}): { entry: HandbookEntry } | { error: string } {
  const name = input.fileName.trim();
  if (!name) return { error: "檔名無效" };
  const bytes = Math.floor((input.dataBase64.length * 3) / 4);
  if (bytes === 0) return { error: "檔案是空的" };
  if (bytes > MAX_HANDBOOK_FILE_BYTES) return { error: "檔案過大（上限 10MB）" };

  const entry: HandbookEntry = {
    id: newHandbookId(),
    manualSlug: input.manualSlug,
    sectionSlug: input.sectionSlug,
    kind: "file",
    fileName: name,
    fileMime: input.fileMime || "application/octet-stream",
    fileSize: formatBytes(bytes),
    fileData: input.dataBase64,
    createdBy: input.user.name,
    createdById: input.user.id,
    createdAt: new Date().toISOString(),
  };
  getStore().handbookEntries.push(entry);
  insertHandbookRow(entry).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[store] handbook file persist failed:", err);
  });
  return { entry };
}

/** Returns the file bytes for a handbook file entry, reading from the DB when
 *  enabled (metadata-only copy in memory) and falling back to the in-memory
 *  copy otherwise. */
export async function getHandbookFile(
  id: string
): Promise<{ name: string; mime: string; buffer: Buffer } | null> {
  const local = getStore().handbookEntries.find((e) => e.id === id && e.kind === "file");
  if (local?.fileData) {
    return {
      name: local.fileName || "file",
      mime: local.fileMime || "application/octet-stream",
      buffer: Buffer.from(local.fileData, "base64"),
    };
  }
  const { dbEnabled, getPool } = await import("./db");
  if (!dbEnabled()) return null;
  try {
    await ensureHandbookTable();
    const [rows] = (await getPool().query(
      "SELECT file_name, file_mime, file_data FROM chengshi_handbook_entries WHERE id = ? AND kind = 'file'",
      [id]
    )) as unknown as [{ file_name: string; file_mime: string; file_data: string }[], unknown];
    if (!rows.length || !rows[0].file_data) return null;
    return {
      name: rows[0].file_name || "file",
      mime: rows[0].file_mime || "application/octet-stream",
      buffer: Buffer.from(rows[0].file_data, "base64"),
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[store] handbook file read failed:", err);
    return null;
  }
}

export function deleteHandbookEntry(id: string, user: Employee): { ok: true } | { error: string } {
  const store = getStore();
  const entry = store.handbookEntries.find((e) => e.id === id);
  if (!entry) return { error: "找不到這筆內容" };
  if (entry.createdById !== user.id && !user.isHrAdmin) {
    return { error: "只能刪除自己新增的內容" };
  }
  store.handbookEntries = store.handbookEntries.filter((e) => e.id !== id);
  deleteHandbookRow(id).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("[store] handbook entry delete failed:", err);
  });
  return { ok: true };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

export function allForms(): AppraisalForm[] {
  return getStore().forms;
}

// ---------- Form attachments ----------

export function addFormAttachment(formId: string, attachment: FormAttachment): { ok: true } | { error: string } {
  const form = getForm(formId);
  if (!form) return { error: "找不到表單" };
  if (!form.attachments) form.attachments = [];
  form.attachments.push(attachment);
  persist();
  return { ok: true };
}

export function deleteFormAttachment(
  formId: string,
  attachmentId: string,
  userId: string,
  isHrAdmin: boolean
): { ok: true } | { error: string } {
  const form = getForm(formId);
  if (!form) return { error: "找不到表單" };
  const att = (form.attachments ?? []).find((a) => a.id === attachmentId);
  if (!att) return { error: "找不到附件" };
  if (att.uploaderId !== userId && !isHrAdmin) return { error: "無權刪除此附件" };
  form.attachments = form.attachments.filter((a) => a.id !== attachmentId);
  persist();
  return { ok: true };
}

// ---------- Form templates ----------

export function getTemplates(): FormTemplate[] {
  return getStore().formTemplates;
}

export function getTemplate(id: string): FormTemplate | undefined {
  return getStore().formTemplates.find((t) => t.id === id);
}

export function upsertTemplate(template: FormTemplate): void {
  const store = getStore();
  const idx = store.formTemplates.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    store.formTemplates[idx] = template;
  } else {
    store.formTemplates.push(template);
  }
  persist();
}

export function deleteTemplate(id: string): void {
  const store = getStore();
  store.formTemplates = store.formTemplates.filter((t) => t.id !== id);
  persist();
}

/** Get templates applicable to a given employee (company + department scope). */
export function getTemplatesForEmployee(employee: Employee): FormTemplate[] {
  return getStore().formTemplates.filter((t) => {
    if (t.companyId && t.companyId !== employee.companyId) return false;
    if (t.departmentId && t.departmentId !== employee.departmentId) return false;
    return true;
  });
}

// ---------- Dept review config ----------

export function getDeptReviewConfigs(): DepartmentReviewConfig[] {
  return getStore().deptReviewConfigs;
}

export function getDeptReviewConfig(departmentId: string): DepartmentReviewConfig | undefined {
  return getStore().deptReviewConfigs.find((c) => c.departmentId === departmentId);
}

export function upsertDeptReviewConfig(config: DepartmentReviewConfig): void {
  const store = getStore();
  const idx = store.deptReviewConfigs.findIndex((c) => c.departmentId === config.departmentId);
  if (idx >= 0) {
    store.deptReviewConfigs[idx] = config;
  } else {
    store.deptReviewConfigs.push(config);
  }
  persist();
}

/** Update a single employee's reviewer assignments (individual hierarchy override). */
export function updateEmployeeReviewers(
  employeeId: string,
  primaryReviewerId: string | null,
  secondaryReviewerId: string | null
): { ok: true } | { error: string } {
  const store = getStore();
  const emp = store.employees.find((e) => e.id === employeeId);
  if (!emp) return { error: "找不到員工" };
  emp.primaryReviewerId = primaryReviewerId;
  emp.secondaryReviewerId = secondaryReviewerId;
  persist();
  persistEmployee(emp);
  return { ok: true };
}

/** Returns forms that have been stuck in a non-terminal status for >= staleThresholdDays. */
export function getPendingStaleReminders(staleThresholdDays = 3): Array<{
  form: AppraisalForm;
  daysStale: number;
  assigneeId: string;
}> {
  const STALE_STATUSES: FormStatus[] = ["self", "primary", "secondary", "hr_review"];
  const now = Date.now();
  const results: Array<{ form: AppraisalForm; daysStale: number; assigneeId: string }> = [];

  for (const form of getStore().forms) {
    if (!STALE_STATUSES.includes(form.status)) continue;
    const lastChange = form.lastStatusChangedAt ? new Date(form.lastStatusChangedAt).getTime() : 0;
    const daysStale = Math.floor((now - lastChange) / 86_400_000);
    if (daysStale < staleThresholdDays) continue;

    const emp = getEmployee(form.employeeId);
    if (!emp) continue;

    let assigneeId: string | null = null;
    if (form.status === "self") assigneeId = form.employeeId;
    else if (form.status === "primary") assigneeId = emp.primaryReviewerId;
    else if (form.status === "secondary") assigneeId = emp.secondaryReviewerId;
    else if (form.status === "hr_review") {
      // find any HR admin
      assigneeId = getStore().employees.find((e) => e.isHrAdmin)?.id ?? null;
    }

    if (assigneeId) results.push({ form, daysStale, assigneeId });
  }
  return results;
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
