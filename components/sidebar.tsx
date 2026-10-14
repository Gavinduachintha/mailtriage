"use client";

import { Cpu, Inbox, PenLine, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/primitives";
import { CATEGORY_META, type CategoryFilter, type EmailCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  filter: CategoryFilter;
  onFilterChange: (filter: CategoryFilter) => void;
  counts: Record<CategoryFilter, number>;
  unreadCount: number;
  onOpenWritingStyle: () => void;
}

const FILTERS: CategoryFilter[] = ["all", "urgent", "waiting", "invoice", "lead", "low"];

export function Sidebar({ open, onClose, filter, onFilterChange, counts, unreadCount, onOpenWritingStyle }: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-200 ease-out",
          "lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 lg:hidden">
          <span className="text-sm font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close sidebar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-3 scrollbar-thin">
          <div>
            <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Inbox</p>
            <ul className="space-y-0.5">
              {FILTERS.map((key) => {
                const active = filter === key;
                const isAll = key === "all";
                return (
                  <li key={key}>
                    <button
                      onClick={() => {
                        onFilterChange(key);
                        onClose();
                      }}
                      className={cn(
                        "group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors cursor-pointer",
                        active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      {isAll ? (
                        <Inbox className="h-4 w-4" />
                      ) : (
                        <span className="flex h-4 w-4 items-center justify-center">
                          <span className={cn("h-2 w-2 rounded-full", CATEGORY_META[key as EmailCategory].dot)} />
                        </span>
                      )}
                      <span className="flex-1 text-left">{isAll ? "All mail" : CATEGORY_META[key as EmailCategory].label}</span>
                      {isAll && unreadCount > 0 && (
                        <span className="rounded-md bg-primary/15 px-1.5 text-[11px] font-semibold text-primary">{unreadCount}</span>
                      )}
                      <span className="min-w-5 text-right text-xs tabular-nums text-muted-foreground">{counts[key]}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <Separator />

          <div className="space-y-0.5">
            <button
              onClick={() => {
                onOpenWritingStyle();
                onClose();
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground cursor-pointer"
            >
              <PenLine className="h-4 w-4" /> My Writing Style
            </button>
            <a
              href="#settings"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <Settings className="h-4 w-4" /> Settings
            </a>
          </div>
        </nav>

        <div className="m-3 rounded-xl border bg-muted/40 p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Cpu className="h-3.5 w-3.5 text-primary" /> Gemma 3 · Local
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            All triage and drafting runs on your machine. Emails never leave your device.
          </p>
        </div>
      </aside>
    </>
  );
}
