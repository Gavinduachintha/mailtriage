"use client";

import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/primitives";
import { CategoryBadge, PriorityIndicator } from "@/components/category-badge";
import type { Email } from "@/lib/types";
import { cn, formatTimestamp } from "@/lib/utils";

interface EmailCardProps {
  email: Email;
  selected: boolean;
  triaging: boolean;
  onSelect: (email: Email) => void;
  onTriage: (email: Email) => void;
}

export function EmailCard({ email, selected, triaging, onSelect, onTriage }: EmailCardProps) {
  const { analysis } = email;

  return (
    <article
      onClick={() => onSelect(email)}
      className={cn(
        "group relative cursor-pointer rounded-xl border bg-card p-4 transition-all duration-150",
        "hover:border-foreground/15 hover:shadow-md",
        selected && "border-primary/50 ring-1 ring-primary/30 shadow-md",
      )}
    >
      {email.unread && <span className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary" />}

      <div className="flex items-start gap-3">
        <Avatar name={email.sender.name} muted className="mt-0.5" />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className={cn("truncate text-sm", email.unread ? "font-semibold" : "font-medium")}>{email.sender.name}</p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">{email.sender.email}</p>
            <time className="ml-auto shrink-0 text-xs text-muted-foreground" suppressHydrationWarning>
              {formatTimestamp(email.receivedAt)}
            </time>
          </div>

          <p className={cn("mt-0.5 truncate text-sm", email.unread ? "text-foreground" : "text-foreground/80")}>{email.subject}</p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{email.preview}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {analysis ? (
              <>
                <CategoryBadge category={analysis.category} />
                <PriorityIndicator score={analysis.priority} />
              </>
            ) : (
              <span className="text-[11px] text-muted-foreground">Not triaged yet</span>
            )}

            <Button
              size="sm"
              variant={analysis ? "ghost" : "outline"}
              className="ml-auto"
              disabled={triaging}
              onClick={(e) => {
                e.stopPropagation();
                onTriage(email);
              }}
            >
              {triaging ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-primary" />}
              {triaging ? "Analyzing…" : analysis ? "Re-triage" : "Triage & Draft"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
