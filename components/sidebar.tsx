"use client";

import { Inbox, PanelLeftClose, PanelLeftOpen, PenLine, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, type CategoryFilter, type EmailCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  filter: CategoryFilter;
  onFilterChange: (filter: CategoryFilter) => void;
  counts: Record<CategoryFilter, number>;
  unreadCount: number;
  onOpenWritingStyle: () => void;
  onOpenSettings: () => void;
  ollamaStatus?: { online: boolean; model: string; hasModel: boolean } | null;
}

const FILTERS: CategoryFilter[] = ["all", "urgent", "waiting", "invoice", "lead", "low"];

const itemBase = "flex w-full items-center gap-2.5 px-2.5 py-1.5 text-sm transition-colors cursor-pointer border-l-2";
const itemIdle = "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground";

export function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapsed,
  filter,
  onFilterChange,
  counts,
  unreadCount,
  onOpenWritingStyle,
  onOpenSettings,
  ollamaStatus,
}: SidebarProps) {
  const modelLabel = ollamaStatus?.model ?? "gemma3";
  const modelReady = Boolean(ollamaStatus?.online && ollamaStatus?.hasModel);
  // The collapsed rail only applies on desktop; the mobile drawer is always full width.
  const rail = collapsed;
  const hideInRail = rail ? "lg:hidden" : "";
  const modelTitle = !ollamaStatus?.online
    ? "Ollama offline"
    : !ollamaStatus.hasModel
      ? `Model ${modelLabel} not found`
      : `${modelLabel} ready`;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-card transition-[transform,width] duration-150 ease-out",
          "lg:static lg:z-auto lg:translate-x-0",
          rail ? "lg:w-14" : "lg:w-60",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4 lg:hidden">
          <span className="text-sm font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto py-3 pr-3 scrollbar-thin">
          <div>
            <p
              className={cn(
                "px-5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                hideInRail,
              )}
            >
              Inbox
            </p>
            <ul className="space-y-0.5">
              {FILTERS.map((key) => {
                const active = filter === key;
                const isAll = key === "all";
                const label = isAll ? "All mail" : CATEGORY_META[key as EmailCategory].label;
                return (
                  <li key={key}>
                    <button
                      onClick={() => {
                        onFilterChange(key);
                        onClose();
                      }}
                      aria-current={active ? "page" : undefined}
                      title={rail ? `${label} (${counts[key]})` : undefined}
                      className={cn(
                        itemBase,
                        "rounded-r-md pl-[18px]",
                        active ? "border-primary bg-muted font-medium text-foreground" : itemIdle,
                      )}
                    >
                      {isAll ? (
                        <Inbox className="h-4 w-4 shrink-0" />
                      ) : (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                          <span className={cn("h-2 w-2 rounded-full", CATEGORY_META[key as EmailCategory].dot)} />
                        </span>
                      )}
                      <span className={cn("flex-1 truncate text-left", hideInRail)}>{label}</span>
                      <span className={cn("font-mono text-xs tabular-nums text-muted-foreground", hideInRail)}>
                        {isAll && unreadCount > 0 ? `${unreadCount} / ${counts[key]}` : counts[key]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {unreadCount > 0 && (
              <p className={cn("px-5 pt-1.5 text-[11px] text-muted-foreground", hideInRail)}>Unread / total</p>
            )}
          </div>

          <div>
            <p
              className={cn(
                "px-5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                hideInRail,
              )}
            >
              Workspace
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => {
                    onOpenWritingStyle();
                    onClose();
                  }}
                  title={rail ? "Writing style" : undefined}
                  className={cn(itemBase, itemIdle, "rounded-r-md pl-[18px]")}
                >
                  <PenLine className="h-4 w-4 shrink-0" />
                  <span className={cn("truncate", hideInRail)}>Writing style</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onOpenSettings();
                    onClose();
                  }}
                  title={rail ? "Settings" : undefined}
                  className={cn(itemBase, itemIdle, "rounded-r-md pl-[18px]")}
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <span className={cn("truncate", hideInRail)}>Settings</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="border-t">
          <div className={cn("px-4 py-3", hideInRail)}>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span
                className={cn("h-1.5 w-1.5 rounded-full", modelReady ? "bg-emerald-600" : "bg-amber-600")}
                title={modelTitle}
              />
              <span className="font-mono">{modelLabel}</span>
              <span className="font-normal text-muted-foreground">· local</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {!ollamaStatus?.online
                ? "Ollama is offline. Start it with ollama serve."
                : !ollamaStatus.hasModel
                  ? `Pull the model: ollama pull ${modelLabel}`
                  : "Client emails never leave your device."}
            </p>
          </div>

          {rail && (
            <div className="hidden justify-center py-3 lg:flex" title={modelTitle}>
              <span className={cn("h-2 w-2 rounded-full", modelReady ? "bg-emerald-600" : "bg-amber-600")} />
            </div>
          )}

          <div className={cn("hidden border-t p-2 lg:flex", rail ? "justify-center" : "justify-end")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapsed}
              aria-label={rail ? "Expand sidebar" : "Collapse sidebar"}
              title={rail ? "Expand sidebar" : "Collapse sidebar"}
            >
              {rail ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
