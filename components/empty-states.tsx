import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Connect Gmail",
    body: "Read-only access through Google. MailTriage can’t send or delete anything.",
  },
  {
    title: "Sort by what needs you",
    body: "Each email is labelled urgent, waiting on a client, invoice, new lead or low priority.",
  },
  {
    title: "Review a draft in your voice",
    body: "A local model drafts the reply. You edit it and save it to Gmail drafts. Nothing is sent automatically.",
  },
];

export function ConnectGmailState({ onConnect, error }: { onConnect: () => void; error?: string | null }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-14 sm:py-20 lg:grid-cols-2 lg:gap-20 animate-fade-in">
        <div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Clear your client inbox before lunch.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            MailTriage sorts incoming client email by urgency and drafts replies in your own voice. Everything runs on
            your machine.
          </p>
          {error && (
            <p className="mt-5 max-w-md rounded-md border border-red-700/30 bg-red-600/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          )}
          <Button size="lg" className="mt-8" onClick={onConnect}>
            Connect Gmail
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">You can disconnect at any time.</p>
        </div>

        <ol className="divide-y border-y">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4 py-5">
              <span className="font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function NoEmailsState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center animate-fade-in">
      <Inbox className="mb-3 h-6 w-6 text-muted-foreground" />
      <p className="text-sm font-semibold">{filtered ? "Nothing matches" : "Inbox is clear"}</p>
      <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">
        {filtered
          ? "Try a different category or clear your search."
          : "No recent client emails. Refresh to check for new messages."}
      </p>
    </div>
  );
}
