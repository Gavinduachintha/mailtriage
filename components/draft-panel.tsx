"use client";

import { useState } from "react";
import { ArrowLeft, BookmarkPlus, Check, Copy, Lightbulb, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, Card, ScrollArea, Separator, Textarea } from "@/components/ui/primitives";
import { CategoryBadge, PriorityIndicator } from "@/components/category-badge";
import type { Email } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";

interface DraftPanelProps {
  email: Email;
  triaging: boolean;
  onClose: () => void;
  onTriage: (email: Email) => void;
  onSaveStyleExample: (text: string) => void;
}

export function DraftPanel({ email, triaging, onClose, onTriage, onSaveStyleExample }: DraftPanelProps) {
  const { analysis } = email;
  const [draft, setDraft] = useState(analysis?.draft ?? "");
  const [syncedDraft, setSyncedDraft] = useState(analysis?.draft);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (analysis?.draft !== syncedDraft) {
    setSyncedDraft(analysis?.draft);
    setDraft(analysis?.draft ?? "");
  }

  const copy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const save = () => {
    onSaveStyleExample(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="flex h-full flex-col bg-background animate-fade-in">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <Button variant="ghost" size="icon" className="xl:hidden" onClick={onClose} aria-label="Back to inbox">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="truncate text-sm font-medium">{email.subject}</p>
        <Button variant="ghost" size="icon" className="ml-auto hidden xl:inline-flex" onClick={onClose} aria-label="Close panel">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-5 p-4 sm:p-6">
          <section>
            <div className="flex items-start gap-3">
              <Avatar name={email.sender.name} muted />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{email.sender.name}</p>
                <p className="truncate text-xs text-muted-foreground">{email.sender.email}</p>
              </div>
              <time className="text-xs text-muted-foreground" suppressHydrationWarning>
                {formatTimestamp(email.receivedAt)}
              </time>
            </div>
            <div className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-xl border bg-muted/30 p-4 text-sm leading-relaxed text-foreground/90 scrollbar-thin">
              {email.body}
            </div>
          </section>

          {!analysis ? (
            <Card className="flex flex-col items-center gap-3 border-dashed p-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </span>
              <div>
                <p className="text-sm font-medium">No analysis yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Let Gemma 3 categorize this email and draft a reply locally.</p>
              </div>
              <Button onClick={() => onTriage(email)} disabled={triaging}>
                {triaging ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {triaging ? "Analyzing locally…" : "Triage & Draft"}
              </Button>
            </Card>
          ) : (
            <>
              <section>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Analysis
                </h3>
                <Card className="space-y-4 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <CategoryBadge category={analysis.category} />
                    <PriorityIndicator score={analysis.priority} showScore />
                  </div>
                  <p className="text-sm leading-relaxed">{analysis.summary}</p>
                  <Separator />
                  <div className="flex gap-2.5">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Suggested action</p>
                      <p className="mt-0.5 text-sm">{analysis.suggestedAction}</p>
                    </div>
                  </div>
                </Card>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Draft Reply</h3>
                <div className="relative">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={11}
                    placeholder="No reply needed for this email."
                    disabled={triaging}
                  />
                  {triaging && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-card/80 text-sm text-muted-foreground backdrop-blur-[1px]">
                      <Loader2 className="h-4 w-4 animate-spin" /> Regenerating…
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={copy} disabled={!draft || triaging}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy Draft"}
                  </Button>
                  <Button variant="outline" onClick={() => onTriage(email)} disabled={triaging}>
                    <RefreshCw className={triaging ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Regenerate
                  </Button>
                  <Button variant="ghost" onClick={save} disabled={!draft || triaging}>
                    {saved ? <Check className="h-4 w-4 text-emerald-500" /> : <BookmarkPlus className="h-4 w-4" />}
                    {saved ? "Saved" : "Save as Style Example"}
                  </Button>
                </div>
              </section>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
