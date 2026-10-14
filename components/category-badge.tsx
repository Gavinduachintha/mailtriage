import { Badge } from "@/components/ui/primitives";
import { CATEGORY_META, priorityLevel, type EmailCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryBadge({ category, className }: { category: EmailCategory; className?: string }) {
  const meta = CATEGORY_META[category];
  return (
    <Badge className={cn(meta.badge, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </Badge>
  );
}

const PRIORITY_STYLES = {
  high: { label: "High", bars: 3, color: "bg-red-500" },
  medium: { label: "Medium", bars: 2, color: "bg-amber-500" },
  low: { label: "Low", bars: 1, color: "bg-zinc-400" },
} as const;

export function PriorityIndicator({ score, showScore = false }: { score: number; showScore?: boolean }) {
  const style = PRIORITY_STYLES[priorityLevel(score)];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground" title={`Priority ${score}/10`}>
      <span className="flex items-end gap-0.5">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("w-1 rounded-sm", i <= style.bars ? style.color : "bg-border")}
            style={{ height: 4 + i * 3 }}
          />
        ))}
      </span>
      {style.label}
      {showScore && <span className="tabular-nums text-foreground">· {score}/10</span>}
    </span>
  );
}
