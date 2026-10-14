"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { EmailCard } from "@/components/email-card";
import { DraftPanel } from "@/components/draft-panel";
import { WritingStyleDialog } from "@/components/writing-style-dialog";
import { ConnectGmailState, NoEmailsState } from "@/components/empty-states";
import { Button } from "@/components/ui/button";
import { Input, ScrollArea } from "@/components/ui/primitives";
import { MOCK_EMAILS, mockTriage } from "@/lib/mock-data";
import { CATEGORY_META, type CategoryFilter, type Email, type StyleExample } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [dark, setDark] = useState(true);
  const [connected, setConnected] = useState(true);
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [triagingIds, setTriagingIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [styleExamples, setStyleExamples] = useState<StyleExample[]>([]);

  const counts = useMemo(() => {
    const result = { all: emails.length } as Record<CategoryFilter, number>;
    for (const key of Object.keys(CATEGORY_META) as (keyof typeof CATEGORY_META)[]) {
      result[key] = emails.filter((e) => e.analysis?.category === key).length;
    }
    return result;
  }, [emails]);

  const visibleEmails = useMemo(() => {
    const q = query.trim().toLowerCase();
    return emails.filter((e) => {
      if (filter !== "all" && e.analysis?.category !== filter) return false;
      if (!q) return true;
      return [e.sender.name, e.sender.email, e.subject, e.preview].some((s) => s.toLowerCase().includes(q));
    });
  }, [emails, filter, query]);

  const selected = emails.find((e) => e.id === selectedId) ?? null;

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark", !dark);
    setDark(!dark);
  };

  const selectEmail = (email: Email) => {
    setSelectedId(email.id);
    setEmails((list) => list.map((e) => (e.id === email.id ? { ...e, unread: false } : e)));
  };

  const triage = async (email: Email) => {
    selectEmail(email);
    setTriagingIds((s) => new Set(s).add(email.id));
    const analysis = await mockTriage(email);
    setEmails((list) => list.map((e) => (e.id === email.id ? { ...e, analysis } : e)));
    setTriagingIds((s) => {
      const next = new Set(s);
      next.delete(email.id);
      return next;
    });
  };

  const refresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 900));
    setRefreshing(false);
  };

  const addStyleExample = (text: string) =>
    setStyleExamples((list) => [{ id: crypto.randomUUID(), text, createdAt: new Date().toISOString() }, ...list]);

  return (
    <div className="flex h-dvh flex-col">
      <Navbar
        connected={connected}
        dark={dark}
        onToggleTheme={toggleTheme}
        onDisconnect={() => {
          setConnected(false);
          setSelectedId(null);
        }}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {!connected ? (
        <ConnectGmailState onConnect={() => setConnected(true)} />
      ) : (
        <div className="flex min-h-0 flex-1">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            filter={filter}
            onFilterChange={setFilter}
            counts={counts}
            unreadCount={emails.filter((e) => e.unread).length}
            onOpenWritingStyle={() => setStyleOpen(true)}
          />

          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:px-6">
              <div>
                <h1 className="text-base font-semibold tracking-tight">
                  {filter === "all" ? "All mail" : CATEGORY_META[filter].label}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {visibleEmails.length} {visibleEmails.length === 1 ? "email" : "emails"}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:ml-auto">
                <div className="relative flex-1 sm:w-64 sm:flex-none">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search emails…"
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" onClick={refresh} disabled={refreshing}>
                  <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                  <span className="hidden sm:inline">Refresh Emails</span>
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {visibleEmails.length === 0 ? (
                <NoEmailsState filtered={filter !== "all" || query.length > 0} />
              ) : (
                <div className={cn("mx-auto max-w-3xl space-y-2 p-4 sm:p-6 transition-opacity", refreshing && "opacity-50")}>
                  {visibleEmails.map((email) => (
                    <EmailCard
                      key={email.id}
                      email={email}
                      selected={email.id === selectedId}
                      triaging={triagingIds.has(email.id)}
                      onSelect={selectEmail}
                      onTriage={triage}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </main>

          {selected && (
            <aside className="fixed inset-0 z-30 pt-14 xl:static xl:z-auto xl:w-[480px] xl:shrink-0 xl:border-l xl:pt-0 2xl:w-[560px]">
              <DraftPanel
                key={selected.id}
                email={selected}
                triaging={triagingIds.has(selected.id)}
                onClose={() => setSelectedId(null)}
                onTriage={triage}
                onSaveStyleExample={addStyleExample}
              />
            </aside>
          )}
        </div>
      )}

      <WritingStyleDialog
        open={styleOpen}
        onOpenChange={setStyleOpen}
        examples={styleExamples}
        onAdd={addStyleExample}
        onRemove={(id) => setStyleExamples((list) => list.filter((ex) => ex.id !== id))}
      />
    </div>
  );
}
