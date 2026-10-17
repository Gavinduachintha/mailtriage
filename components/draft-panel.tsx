"use client";

import { useState } from "react";
import { ArrowLeft, BookmarkPlus, Check, Copy, Loader2, PenLine, RefreshCw, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, Card, ScrollArea, SectionLabel, Textarea } from "@/components/ui/primitives";
import { CategoryBadge, PriorityIndicator } from "@/components/category-badge";
import type { Email } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";

interface DraftPanelProps {
  email: Email;
  triaging: boolean;
  onClose: () => void;
  onTriage: (email: Email) => void;
  onSaveStyleExample: (text: string) => void;
  onSendDraft: (email: Email, draft: string) => Promise<void>;
}

export function DraftPanel({
  email,
  triaging,
  onClose,
  onTriage,
  onSaveStyleExample,
  onSendDraft,
}: DraftPanelProps) {
  const { analysis } = email;
  const [draft, setDraft] = useState(analysis?.draft ?? "");
  const [syncedDraft, setSyncedDraft] = useState(analysis?.draft);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sendingDraft, setSendingDraft] = useState(false);
  const [draftSent, setDraftSent] = useState(false);

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

  const sendDraft = async () => {
    if (!draft.trim() || sendingDraft) return;
    setSendingDraft(true);
    try {
      await onSendDraft(email, draft);
      setDraftSent(true);
      setTimeout(() => setDraftSent(false), 2000);
    } catch {
      /* parent surfaces the error banner */
    } finally {
      setSendingDraft(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-card animate-fade-in">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <Button variant="ghost" size="icon" className="xl:hidden" onClick={onClose} aria-label="Back to inbox">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="truncate text-sm font-semibold">{email.subject}</p>
        <Button variant="ghost" size="icon" className="ml-auto hidden xl:inline-flex" onClick={onClose} aria-label="Close panel">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4 sm:p-6">
          <section>
            <div className="flex items-start gap-3">
              <Avatar name={email.sender.name} muted />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{email.sender.name}</p>
                <p className="truncate text-xs text-muted-foreground">{email.sender.email}</p>
              </div>
              <time className="font-mono text-xs text-muted-foreground" suppressHydrationWarning>
                {formatTimestamp(email.receivedAt)}
              </time>
            </div>
            <div className="mt-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-md border bg-background p-4 text-sm leading-relaxed text-foreground/90 scrollbar-thin">
              {email.body}
            </div>
          </section>

          {!analysis ? (
            <Card className="flex flex-col items-start gap-3 border-dashed p-5">
              <div>
                <p className="text-sm font-medium">No analysis yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Categorize this email and draft a reply using the local model.
                </p>
              </div>
              <Button onClick={() => onTriage(email)} disabled={triaging}>
                {triaging ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
                {triaging ? "Working…" : "Draft reply"}
              </Button>
            </Card>
          ) : (
            <>
              <section>
                <SectionLabel className="mb-2">Assessment</SectionLabel>
                <Card className="divide-y">
                  <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <CategoryBadge category={analysis.category} />
                    <PriorityIndicator score={analysis.priority} showScore />
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Summary</p>
                    <p className="mt-1 text-sm leading-relaxed">{analysis.summary}</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground">Suggested action</p>
                    <p className="mt-1 text-sm leading-relaxed">{analysis.suggestedAction}</p>
                  </div>
                </Card>
              </section>

              <section>
                <SectionLabel className="mb-2">Draft reply</SectionLabel>
                <div className="relative">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={11}
                    placeholder="No reply needed for this email."
                    disabled={triaging}
                  />
                  {triaging && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-md bg-card/90 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Regenerating…
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button onClick={sendDraft} disabled={!draft.trim() || triaging || sendingDraft}>
                    {sendingDraft ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : draftSent ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {sendingDraft ? "Saving to Gmail…" : draftSent ? "Opened Drafts" : "Save to Gmail drafts"}
                  </Button>
                  <Button variant="outline" onClick={copy} disabled={!draft || triaging}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="outline" onClick={() => onTriage(email)} disabled={triaging}>
                    <RefreshCw className={triaging ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Regenerate
                  </Button>
                  <Button variant="ghost" className="sm:ml-auto" onClick={save} disabled={!draft || triaging}>
                    {saved ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                    {saved ? "Saved" : "Save as style example"}
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
