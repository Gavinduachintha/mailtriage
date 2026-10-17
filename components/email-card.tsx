"use client";

import { Loader2, PenLine, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
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

/** A single ruled row in the inbox list. */
export function EmailCard({ email, selected, triaging, onSelect, onTriage }: EmailCardProps) {
  const { analysis } = email;

  return (
    <article
      onClick={() => onSelect(email)}
      className={cn(
        "group flex cursor-pointer gap-3 border-b px-4 py-3 transition-colors sm:px-6",
        "border-l-2",
        selected ? "border-l-primary bg-card" : "border-l-transparent hover:bg-card/70",
      )}
    >
      <span
        className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", email.unread ? "bg-primary" : "bg-transparent")}
        aria-label={email.unread ? "Unread" : undefined}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-3">
          <p className={cn("truncate text-sm", email.unread ? "font-semibold" : "font-medium")}>{email.sender.name}</p>
          <time className="ml-auto shrink-0 font-mono text-xs text-muted-foreground" suppressHydrationWarning>
            {formatTimestamp(email.receivedAt)}
          </time>
        </div>

        <p className="mt-0.5 truncate text-sm">
          <span className={email.unread ? "font-medium" : ""}>{email.subject}</span>
          <span className="text-muted-foreground"> — {email.preview}</span>
        </p>

        <div className="mt-2 flex min-h-7 flex-wrap items-center gap-x-4 gap-y-1">
          {analysis ? (
            <>
              <CategoryBadge category={analysis.category} />
              <PriorityIndicator score={analysis.priority} />
            </>
          ) : (
            <span className="text-xs text-muted-foreground">Not triaged</span>
          )}

          <Button
            size="sm"
            variant={analysis ? "ghost" : "outline"}
            className={cn("ml-auto h-7", analysis && !triaging && "sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100")}
            disabled={triaging}
            onClick={(e) => {
              e.stopPropagation();
              onTriage(email);
            }}
          >
            {triaging ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : analysis ? (
              <RefreshCw className="h-3.5 w-3.5" />
            ) : (
              <PenLine className="h-3.5 w-3.5" />
            )}
            {triaging ? "Working…" : analysis ? "Redo" : "Draft reply"}
          </Button>
        </div>
      </div>
    </article>
  );
}
