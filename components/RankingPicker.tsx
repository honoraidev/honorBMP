"use client";

import { useMemo, useState } from "react";
import { RankingTier, RANKING_LABELS, RANKING_TARGET_PCT } from "@/lib/types";

const TIERS: RankingTier[] = ["T1", "T2", "T3", "T4", "T5"];

export default function RankingPicker({
  deptCounts,
  deptTotal,
  deptName,
  defaultValue,
  relaxed,
  defaultReason,
}: {
  deptCounts: Record<RankingTier, number>;
  deptTotal: number;
  deptName: string;
  defaultValue: RankingTier | null;
  relaxed: boolean;
  defaultReason: string;
}) {
  const [selected, setSelected] = useState<RankingTier | null>(defaultValue);

  const projected = useMemo(() => {
    const counts = { ...deptCounts };
    if (selected) counts[selected] = (counts[selected] || 0) + 1;
    return TIERS.map((t) => {
      const count = counts[t] || 0;
      const pct = deptTotal > 0 ? Math.round((count / deptTotal) * 1000) / 10 : 0;
      const target = RANKING_TARGET_PCT[t];
      const deviates = Math.abs(pct - target) > target * 0.6 + 8; // rough leniency band
      return { tier: t, count, pct, target, deviates };
    });
  }, [selected, deptCounts, deptTotal]);

  const anyDeviates = projected.some((p) => p.deviates && !relaxed);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {TIERS.map((t) => (
          <label
            key={t}
            className={`border rounded-lg px-3 py-2 text-sm cursor-pointer transition ${
              selected === t ? "border-navy bg-navy/5 ring-1 ring-navy" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="rankingTier"
              value={t}
              checked={selected === t}
              onChange={() => setSelected(t)}
              className="mr-1.5"
              required
            />
            <span className="font-semibold">{RANKING_LABELS[t]}</span>
          </label>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-2">
          {deptName}目前等第分佈（含本次選擇試算，共 {deptTotal} 人）・常態分配目標 5% / 15% / 65% / 10% / 5%
          {relaxed && <span className="text-teal font-semibold">・本部門人數少於4人，得不區分第一、第五等</span>}
        </p>
        <div className="grid grid-cols-5 gap-2 text-center">
          {projected.map((p) => (
            <div key={p.tier} className={`rounded-md py-1.5 text-xs ${p.deviates && !relaxed ? "bg-amber-100 text-amber-800" : "bg-white text-gray-600"} border border-gray-200`}>
              <div className="font-bold">{p.tier}</div>
              <div>{p.count} 人</div>
              <div>{p.pct}%</div>
            </div>
          ))}
        </div>
        {anyDeviates && (
          <p className="text-xs text-amber-700 mt-2">
            ⚠ 提醒：目前分佈與常態分配比例有落差，惟制度允許依個案實際情況調整；請於下方填寫調整原因以利存查（非強制阻擋）。
          </p>
        )}
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">等第調整原因說明（若分佈不符常態分配或有個案考量，建議填寫）</label>
        <textarea name="rankingOverrideReason" className="textarea" rows={2} defaultValue={defaultReason} placeholder="例如：該員為新進人員、部門今年整體績效突出等" />
      </div>
    </div>
  );
}
