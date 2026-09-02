import { Tier } from "@/lib/types";

const TIER_META: { value: Tier; label: string }[] = [
  { value: "exceed", label: "超標準（90%以上）" },
  { value: "meet", label: "達目標（70–89%）" },
  { value: "below", label: "未達標（69%以下）" },
];

export default function TierRadioGroup({
  name,
  defaultValue,
  readOnly,
  descriptions,
  compareLabel,
  compareValue,
}: {
  name: string;
  defaultValue: Tier | null;
  readOnly?: boolean;
  descriptions?: Record<Tier, string>;
  compareLabel?: string;
  compareValue?: Tier | null;
}) {
  if (readOnly) {
    const meta = TIER_META.find((t) => t.value === defaultValue);
    return (
      <span className="badge bg-gray-100 text-gray-600">{meta ? meta.label : "尚未評分"}</span>
    );
  }
  return (
    <div className="space-y-1.5">
      {compareLabel && compareValue && (
        <p className="text-xs text-gray-400">
          {compareLabel}：{TIER_META.find((t) => t.value === compareValue)?.label}
        </p>
      )}
      <div className="grid gap-1.5">
        {TIER_META.map((t) => (
          <label
            key={t.value}
            className="flex items-start gap-2 border border-gray-200 rounded-md px-3 py-1.5 text-sm cursor-pointer has-[:checked]:border-navy has-[:checked]:bg-navy/5"
          >
            <input type="radio" name={name} value={t.value} defaultChecked={defaultValue === t.value} className="mt-0.5" required />
            <span>
              <span className="font-medium">{t.label}</span>
              {descriptions && <span className="block text-xs text-gray-500">{descriptions[t.value]}</span>}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
