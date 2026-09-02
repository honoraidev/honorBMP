export type Tier = "exceed" | "meet" | "below";

export interface Company {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  companyId: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  title: string;
  employeeNo: string;
  password?: string;
  /** Data URL (base64) of the user's uploaded avatar; absent = show default person icon. */
  avatarUrl?: string;
  companyId: string;
  departmentId: string;
  hireDate: string;
  primaryReviewerId: string | null;
  secondaryReviewerId: string | null;
  isHrAdmin?: boolean;
  /** Company IDs this person gives final 核決 (approval) for. Scoped per-company
   *  because 丞石集團 has more than one company chairman (e.g. 大可廣告 has its
   *  own chairwoman, distinct from the group chairman of the other 3 companies). */
  approverCompanyIds?: string[];
}

export interface CyclePhases {
  announce: string;
  selfStart: string;
  selfEnd: string;
  primaryStart: string;
  primaryEnd: string;
  secondaryStart: string;
  secondaryEnd: string;
  hrDeadline: string;
}

export interface AppraisalCycle {
  id: string;
  label: string;
  year: string;
  phases: CyclePhases;
  status: "active" | "closed";
}

export interface GoalItem {
  order: number; // 1-4
  title: string;
  standardDesc: string;
  weight: number; // points
  selfTier: Tier | null;
  primaryTier: Tier | null;
}

export interface FixedItem {
  key: "attendance" | "org" | "integrity" | "attitude" | "communication";
  label: string;
  weight: number; // always 5
  selfTier: Tier | null;
  primaryTier: Tier | null;
}

export type FormStatus =
  | "goal_setting"
  | "self"
  | "primary"
  | "secondary"
  | "hr_review"
  | "approved"
  | "returned";

export type RankingTier = "T1" | "T2" | "T3" | "T4" | "T5";

export interface HistoryEntry {
  at: string;
  actor: string;
  action: string;
  note?: string;
}

export interface AppraisalForm {
  id: string;
  cycleId: string;
  employeeId: string;
  goalItems: GoalItem[]; // 4 items, 75 pts
  fixedItems: FixedItem[]; // 5 items, 25 pts
  bonusMalus: number; // item 10, -10..10
  selfFeedbackGrowth: string;
  selfFeedbackNextYear: string;
  primaryComment: string;
  secondaryComment: string;
  secondaryDevAssessment: string;
  rankingTier: RankingTier | null;
  rankingOverrideReason: string;
  status: FormStatus;
  returnReason?: string;
  returnedFromStatus?: FormStatus;
  signatures: {
    selfAt?: string;
    primaryAt?: string;
    secondaryAt?: string;
    approvedAt?: string;
  };
  history: HistoryEntry[];
}

export const RANKING_LABELS: Record<RankingTier, string> = {
  T1: "等第一・表現亮眼",
  T2: "等第二・表現穩健",
  T3: "等第三・符合預期",
  T4: "等第四・尚可觀察",
  T5: "等第五・後續關注",
};

export const RANKING_TARGET_PCT: Record<RankingTier, number> = {
  T1: 5,
  T2: 15,
  T3: 65,
  T4: 10,
  T5: 5,
};

export const FIXED_ITEM_DEFS: { key: FixedItem["key"]; label: string; desc: Record<Tier, string> }[] = [
  {
    key: "attendance",
    label: "出勤情況",
    desc: {
      exceed: "出勤穩定準時，遵守請假規範，能主動配合工作時程",
      meet: "基本遵守出勤制度，偶有遲到或請假但屬合理範圍",
      below: "常遲到、早退或請假過多，在崗狀態不穩定，影響工作",
    },
  },
  {
    key: "org",
    label: "組織認同",
    desc: {
      exceed: "對組織有情感投入，傳播價值理念，休戚與共的奉獻精神",
      meet: "能按照組織要求的各項規定履行工作職責，並時有貢獻",
      below: "對自認為不合理的組織安排不配合、消極抵抗",
    },
  },
  {
    key: "integrity",
    label: "誠實品格",
    desc: {
      exceed: "言行一致、誠實不欺，能展現端正的品德和行為",
      meet: "表現中等，以保全自己為重，時有保留",
      below: "我行我素，缺乏誠實品格意識",
    },
  },
  {
    key: "attitude",
    label: "工作態度",
    desc: {
      exceed: "工作勤勉積極並主動承擔額外責任，積極革新",
      meet: "工作良好、準時，很少忽略任何應注意的事項",
      below: "需加以提醒、需要時常檢查或督導",
    },
  },
  {
    key: "communication",
    label: "溝通協作",
    desc: {
      exceed: "堅持原則、處理問題對事不對人，並能有效化解衝突與矛盾",
      meet: "能清晰完整地表達意見與想法，讓對方理解並完成工作事項",
      below: "以自我為中心，過早下結論，無法理解合作夥伴的訴求",
    },
  },
];

export const DEV_ASSESSMENT_OPTIONS = [
  "表現優異，具備承擔更高層級或更大範疇職務的能力",
  "表現良好，可進一步培養並輪調至其他適任職務",
  "表現穩定，現階段以維持現有職務為主",
  "建議調整職務內容，並啟動相關改善或支持計劃",
  "建議進行職務再配置，並優先推動強化與改善計劃",
];
