import { CATEGORY_META, priorityLevel, type EmailCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Plain text label with a small colour dot — no pill, no border. */
export function CategoryBadge({ category, className }: { category: EmailCategory; className?: string }) {
  const meta = CATEGORY_META[category];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium", className)}>
      <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

const PRIORITY_STYLES = {
  high: { label: "High", bars: 3, color: "bg-foreground" },
  medium: { label: "Medium", bars: 2, color: "bg-foreground/70" },
  low: { label: "Low", bars: 1, color: "bg-foreground/40" },
} as const;

export function PriorityIndicator({ score, showScore = false }: { score: number; showScore?: boolean }) {
  const style = PRIORITY_STYLES[priorityLevel(score)];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" title={`Priority ${score}/10`}>
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
      {showScore && <span className="font-mono tabular-nums text-foreground">· {score}/10</span>}
    </span>
  );
}
