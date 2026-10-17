"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { EmailCard } from "@/components/email-card";
import { DraftPanel } from "@/components/draft-panel";
import { WritingStyleDialog } from "@/components/writing-style-dialog";
import { SettingsDialog, type Theme } from "@/components/settings-dialog";
import { ConnectGmailState, NoEmailsState } from "@/components/empty-states";
import { Button } from "@/components/ui/button";
import { Input, ScrollArea } from "@/components/ui/primitives";
import { CATEGORY_META, type CategoryFilter, type Email, type StyleExample } from "@/lib/types";
import { cn } from "@/lib/utils";

interface OllamaStatus {
  online: boolean;
  model: string;
  hasModel: boolean;
}

export default function DashboardPage() {
  const [connected, setConnected] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [triagingIds, setTriagingIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [styleExamples, setStyleExamples] = useState<StyleExample[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);

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

  useEffect(() => {
    // Sync UI state with what the pre-paint script / storage already applied.
    queueMicrotask(() => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
      try {
        setSidebarCollapsed(localStorage.getItem("sidebar-collapsed") === "1");
      } catch {
        /* storage unavailable */
      }
    });
  }, []);

  const applyTheme = (next: Theme) => {
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable; theme just won't persist */
    }
  };

  const toggleTheme = () => applyTheme(theme === "dark" ? "light" : "dark");

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      try {
        localStorage.setItem("sidebar-collapsed", prev ? "0" : "1");
      } catch {
        /* storage unavailable */
      }
      return !prev;
    });
  };

  const loadEmails = useCallback(async () => {
    setRefreshing(true);
    setFetchError(null);
    try {
      const res = await fetch("/api/gmail", { cache: "no-store" });
      if (res.status === 401) {
        setConnected(false);
        setUserEmail(null);
        setEmails([]);
        return;
      }
      const data = (await res.json()) as { emails?: Email[]; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load emails");
      }
      setEmails((prev) => {
        const analysisById = new Map(prev.map((e) => [e.id, e.analysis]));
        return (data.emails ?? []).map((email) => ({
          ...email,
          analysis: analysisById.get(email.id) ?? email.analysis,
        }));
      });
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Failed to load emails");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    if (oauthError) {
      setFetchError(decodeURIComponent(oauthError));
      window.history.replaceState({}, "", window.location.pathname);
    }

    (async () => {
      try {
        const [authRes, ollamaRes] = await Promise.all([
          fetch("/api/auth/status", { cache: "no-store" }),
          fetch("/api/ollama/status", { cache: "no-store" }),
        ]);
        const data = (await authRes.json()) as { connected: boolean; email: string | null };
        setConnected(data.connected);
        setUserEmail(data.email);
        if (ollamaRes.ok) {
          setOllamaStatus((await ollamaRes.json()) as OllamaStatus);
        }
        if (data.connected) {
          const styleRes = await fetch("/api/style-examples", { cache: "no-store" });
          if (styleRes.ok) {
            const styleData = (await styleRes.json()) as { examples?: StyleExample[] };
            setStyleExamples(styleData.examples ?? []);
          }
          await loadEmails();
        }
      } finally {
        setBootstrapping(false);
      }
    })();
  }, [loadEmails]);

  const selectEmail = (email: Email) => {
    setSelectedId(email.id);
    setEmails((list) => list.map((e) => (e.id === email.id ? { ...e, unread: false } : e)));
  };

  const triage = async (email: Email) => {
    selectEmail(email);
    setTriagingIds((s) => new Set(s).add(email.id));
    setFetchError(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { analysis?: Email["analysis"]; error?: string };
      if (!res.ok || !data.analysis) {
        throw new Error(data.error ?? "Triage failed");
      }
      setEmails((list) => list.map((e) => (e.id === email.id ? { ...e, analysis: data.analysis } : e)));
    } catch (error) {
      setFetchError(error instanceof Error ? error.message : "Triage failed");
    } finally {
      setTriagingIds((s) => {
        const next = new Set(s);
        next.delete(email.id);
        return next;
      });
    }
  };

  const disconnect = async () => {
    await fetch("/api/auth/disconnect", { method: "POST" });
    setConnected(false);
    setUserEmail(null);
    setEmails([]);
    setSelectedId(null);
    setStyleExamples([]);
  };

  const connectGmail = () => {
    window.location.href = "/api/auth/google";
  };

  const addStyleExample = async (text: string) => {
    const res = await fetch("/api/style-examples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = (await res.json()) as { example?: StyleExample; error?: string };
    if (!res.ok || !data.example) {
      setFetchError(data.error ?? "Failed to save writing style");
      return;
    }
    setStyleExamples((list) => [data.example!, ...list]);
  };

  const removeStyleExample = async (id: string) => {
    const res = await fetch(`/api/style-examples?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
      setFetchError("Failed to remove writing style");
      return;
    }
    setStyleExamples((list) => list.filter((ex) => ex.id !== id));
  };

  const sendDraft = async (email: Email, draft: string) => {
    setFetchError(null);
    const res = await fetch("/api/gmail/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, draft }),
    });
    const data = (await res.json()) as { draftsUrl?: string; error?: string };
    if (!res.ok || !data.draftsUrl) {
      throw new Error(data.error ?? "Failed to create Gmail draft");
    }
    window.open(data.draftsUrl, "_blank", "noopener,noreferrer");
  };

  if (bootstrapping) {
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted-foreground">
        <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Loading your inbox…
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col">
      <Navbar
        connected={connected}
        userEmail={userEmail}
        onToggleTheme={toggleTheme}
        onDisconnect={disconnect}
        onOpenSidebar={() => setSidebarOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {!connected ? (
        <ConnectGmailState onConnect={connectGmail} error={fetchError} />
      ) : (
        <div className="flex min-h-0 flex-1">
          <Sidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={toggleSidebarCollapsed}
            onOpenSettings={() => setSettingsOpen(true)}
            filter={filter}
            onFilterChange={setFilter}
            counts={counts}
            unreadCount={emails.filter((e) => e.unread).length}
            onOpenWritingStyle={() => setStyleOpen(true)}
            ollamaStatus={ollamaStatus}
          />

          <main className="flex min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:px-6">
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  {filter === "all" ? "All mail" : CATEGORY_META[filter].label}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {visibleEmails.length} {visibleEmails.length === 1 ? "conversation" : "conversations"}
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
                <Button variant="outline" onClick={loadEmails} disabled={refreshing}>
                  <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>

            {fetchError && (
              <p className="border-b bg-red-600/10 px-4 py-2 text-sm text-red-700 dark:text-red-400 sm:px-6">{fetchError}</p>
            )}

            <ScrollArea className="flex-1">
              {visibleEmails.length === 0 && !refreshing ? (
                <NoEmailsState filtered={filter !== "all" || query.length > 0} />
              ) : (
                <div className={cn("transition-opacity", refreshing && "opacity-50")}>
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
                onSendDraft={async (email, draft) => {
                  try {
                    await sendDraft(email, draft);
                  } catch (error) {
                    setFetchError(error instanceof Error ? error.message : "Failed to create Gmail draft");
                    throw error instanceof Error ? error : new Error("Failed to create Gmail draft");
                  }
                }}
              />
            </aside>
          )}
        </div>
      )}

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        theme={theme}
        onThemeChange={applyTheme}
        userEmail={userEmail}
        onDisconnect={disconnect}
        onOpenWritingStyle={() => setStyleOpen(true)}
        styleExampleCount={styleExamples.length}
        ollamaStatus={ollamaStatus}
      />

      <WritingStyleDialog
        open={styleOpen}
        onOpenChange={setStyleOpen}
        examples={styleExamples}
        onAdd={addStyleExample}
        onRemove={removeStyleExample}
      />
    </div>
  );
}
