// 員工手冊 / 文件閱覽 —— 靜態內容資料
//
// 章節內文與附件目前為示範資料。正式上線時可：
//   1. 把 PDF 放到 public/handbook/ 底下（檔名對應 attachment.file）
//   2. 或改成從文件管理系統 / 資料庫撈章節與附件清單
//
// 附件若沒有實體檔案（file 為 undefined），畫面會顯示「尚未上傳」。

export interface HandbookAttachment {
  /** 顯示名稱 */
  name: string;
  /** public/handbook/ 底下的檔名；沒有則視為尚未上傳 */
  file?: string;
  /** 顯示用檔案大小，如 "422.38KB" */
  size?: string;
  updatedAt?: string;
}

export interface HandbookSection {
  slug: string;
  title: string;
  /** 章節說明（純文字段落，會逐段渲染） */
  body: string[];
  attachments?: HandbookAttachment[];
  /** 導向系統內其他功能（例如「年度績效考核管理」直接連到考核表） */
  internalLinks?: { label: string; href: string }[];
}

export interface HandbookManual {
  slug: string;
  title: string;
  summary: string;
  /** 側邊選單分組用 */
  group: string;
  sections: HandbookSection[];
}

export const HANDBOOK: HandbookManual[] = [
  {
    slug: "hr-policy",
    title: "人事制度管理手冊",
    summary: "出勤、差旅、獎懲福利、教育訓練、職場倫理、績效考核與離職等人事相關規範。",
    group: "員工手冊",
    sections: [
      {
        slug: "attendance",
        title: "出勤與工作規範",
        body: [
          "本章節說明公司對同仁的出勤要求與相關工作規範，目的在於確保工作秩序與公平性，員工應遵守本章節規定，維護公司營運效率。",
          "出勤採電子差勤系統登錄，遲到、早退、請假均須於系統提出申請並經主管核准。連續曠職三日或一個月內累計曠職達六日者，依工作規則辦理。",
        ],
        attachments: [
          { name: "丞石集團工作規則_20230327.pdf", file: "work-rules-20230327.pdf", size: "422.38KB", updatedAt: "2023-03-27" },
        ],
      },
      {
        slug: "travel-expense",
        title: "出差、交通與費用",
        body: [
          "同仁因公出差應事先於系統提出出差申請單，經權責主管核准後始得成行。出差費用包含交通費、住宿費與膳雜費，依《差旅費報支標準》辦理。",
          "出差結束後七個工作日內完成核銷，逾期未辦理者由申請人自行負擔。",
        ],
        attachments: [
          { name: "差旅費報支標準.pdf", size: "—" },
        ],
      },
      {
        slug: "reward-welfare",
        title: "獎勵與福利",
        body: [
          "公司設有年節獎金、婚喪喜慶補助、生日禮金、健康檢查補助等法定與非法定福利，詳如附件福利辦法。",
          "重大貢獻或提案改善經審查通過者，得由單位主管簽報專案獎勵。",
        ],
        attachments: [
          { name: "員工福利委員會設置辦法.pdf", size: "—" },
        ],
      },
      {
        slug: "training",
        title: "教育訓練與發展",
        body: [
          "新進同仁應完成到職訓練與職安衛教育訓練。在職同仁每年應完成公司指定之年度必修課程時數。",
          "同仁得依職涯發展需求提出外訓申請，經核准後公司補助訓練費用，並簽訂服務約定。",
        ],
      },
      {
        slug: "ethics",
        title: "職場倫理與規範",
        body: [
          "同仁應遵守誠信經營、利益迴避、資訊保密與職場性騷擾防治等相關規範。",
          "發現不法或違反倫理情事，得透過內部檢舉管道反映，公司保障檢舉人身分不受不利處分。",
        ],
        attachments: [
          { name: "誠信經營守則.pdf", size: "—" },
          { name: "職場性騷擾防治措施.pdf", size: "—" },
        ],
      },
      {
        slug: "appraisal",
        title: "年度績效考核管理",
        body: [
          "公司每年辦理一次年度績效考核，流程為「自評 → 初評 → 複評 → 人資彙整 → 董事長核決」。考核結果作為調薪、獎金與職涯發展之參考依據。",
          "考核項目包含工作目標達成（75 分）、固定考核項目（25 分）與加減分項（±10 分），並依部門進行等第常態分配。",
          "詳細作業請至線上考核系統各功能頁面辦理。",
        ],
        internalLinks: [
          { label: "前往我的考核表 / 首頁", href: "/" },
          { label: "考核週期與時程", href: "/hr/cycle" },
        ],
        attachments: [
          { name: "績效考核管理辦法.pdf", size: "—" },
        ],
      },
      {
        slug: "resignation",
        title: "離職作業",
        body: [
          "同仁離職應依勞動基準法規定期間提出離職申請，並完成職務交接與財產、權限歸還。",
          "人資於離職生效日辦理勞健保退保、離職證明開立與離職面談。",
        ],
        attachments: [
          { name: "離職交接清單範本.pdf", size: "—" },
        ],
      },
      {
        slug: "privacy",
        title: "個資安全維護",
        body: [
          "同仁於執行職務所蒐集、處理及利用之個人資料，應遵守個人資料保護法及公司個資管理規範，不得逾越特定目的必要範圍。",
          "個資外洩或疑似外洩事件應立即通報個資管理窗口，並依應變程序處理。",
        ],
        attachments: [
          { name: "個人資料保護管理規範.pdf", size: "—" },
        ],
      },
    ],
  },
  {
    slug: "procurement",
    title: "工程採購管理手冊",
    summary: "工程發包、採購請購、廠商管理與驗收付款等作業規範。",
    group: "員工手冊",
    sections: [
      {
        slug: "overview",
        title: "採購作業總則",
        body: [
          "工程及物料採購應本公開、公平原則辦理，達一定金額以上須經比價或議價程序，並依分層負責表核決。",
        ],
        attachments: [{ name: "採購管理辦法.pdf", size: "—" }],
      },
      {
        slug: "vendor",
        title: "廠商管理與評鑑",
        body: [
          "合格廠商應建檔管理，每年至少辦理一次廠商評鑑，評鑑不合格者列入限制往來名單。",
        ],
      },
    ],
  },
  {
    slug: "finance",
    title: "財務請款管理手冊",
    summary: "請款、付款、零用金與費用核銷作業規範。",
    group: "員工手冊",
    sections: [
      {
        slug: "payment",
        title: "請款與付款作業",
        body: [
          "各項請款應檢附原始憑證並依核決權限表簽核，付款作業每週固定辦理二次。",
        ],
        attachments: [{ name: "費用核銷作業要點.pdf", size: "—" }],
      },
    ],
  },
];

export function getManual(slug: string): HandbookManual | undefined {
  return HANDBOOK.find((m) => m.slug === slug);
}

export function getSection(
  manual: HandbookManual,
  sectionSlug?: string
): HandbookSection | undefined {
  if (!sectionSlug) return manual.sections[0];
  return manual.sections.find((s) => s.slug === sectionSlug);
}
