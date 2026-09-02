import { FormStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/store";

const COLORS: Record<FormStatus, string> = {
  goal_setting: "bg-gray-100 text-gray-600",
  self: "bg-amber-100 text-amber-700",
  primary: "bg-blue-100 text-blue-700",
  secondary: "bg-purple-100 text-purple-700",
  hr_review: "bg-teal-100 text-teal-700",
  approved: "bg-green-100 text-green-700",
  returned: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }: { status: FormStatus }) {
  return <span className={`badge ${COLORS[status]}`}>{STATUS_LABEL[status]}</span>;
}
