import { Inbox, Lock, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ConnectGmailState({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md text-center animate-fade-in">
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border bg-card shadow-lg">
            <Mail className="h-9 w-9 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Connect your Gmail</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          InboxGuard reads your recent client emails, triages them, and drafts replies in your voice — powered by a local AI
          model.
        </p>
        <Button size="lg" className="mt-6" onClick={onConnect}>
          <Mail className="h-4 w-4" /> Connect Gmail
        </Button>
        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Read-only access
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> 100% local processing
          </span>
        </div>
      </div>
    </div>
  );
}

export function NoEmailsState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center animate-fade-in">
      <div className="relative mb-5">
        <div className="flex h-16 w-16 rotate-[-6deg] items-center justify-center rounded-2xl border bg-card shadow-sm">
          <Inbox className="h-7 w-7 text-muted-foreground" />
        </div>
        <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border bg-background text-sm">
          ✨
        </span>
      </div>
      <p className="text-sm font-medium">{filtered ? "Nothing matches here" : "Inbox zero. Nice work!"}</p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
        {filtered
          ? "Try a different filter or clear your search."
          : "No recent client emails. Hit refresh to check for new messages."}
      </p>
    </div>
  );
}
