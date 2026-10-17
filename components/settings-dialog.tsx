"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { SectionLabel } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export type Theme = "light" | "dark";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  userEmail: string | null;
  onDisconnect: () => void;
  onOpenWritingStyle: () => void;
  styleExampleCount: number;
  ollamaStatus: { online: boolean; model: string; hasModel: boolean } | null;
}

function Row({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsDialog({
  open,
  onOpenChange,
  theme,
  onThemeChange,
  userEmail,
  onDisconnect,
  onOpenWritingStyle,
  styleExampleCount,
  ollamaStatus,
}: SettingsDialogProps) {
  const modelReady = Boolean(ollamaStatus?.online && ollamaStatus?.hasModel);
  const modelText = !ollamaStatus
    ? "Checking…"
    : !ollamaStatus.online
      ? "Ollama offline"
      : !ollamaStatus.hasModel
        ? "Model not installed"
        : "Ready";

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Settings"
      description="Preferences for this device."
      footer={<Button onClick={() => onOpenChange(false)}>Done</Button>}
    >
      <div className="space-y-6">
        <section>
          <SectionLabel>Appearance</SectionLabel>
          <Row title="Theme" description="Applies immediately and is remembered on this device.">
            <div className="inline-flex rounded-md border p-0.5">
              {(
                [
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                ] as const
              ).map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onThemeChange(value)}
                  aria-pressed={theme === value}
                  className={cn(
                    "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors",
                    theme === value ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </Row>
        </section>

        <section className="divide-y">
          <SectionLabel className="pb-2">Drafting</SectionLabel>
          <Row
            title="Writing style"
            description={
              styleExampleCount === 0
                ? "No examples saved yet"
                : `${styleExampleCount} saved ${styleExampleCount === 1 ? "example" : "examples"}`
            }
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onOpenWritingStyle();
              }}
            >
              Manage
            </Button>
          </Row>
          <Row title="Local model" description={ollamaStatus?.model ?? "gemma3"}>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Monitor className="h-3.5 w-3.5" />
              <span className={cn("h-1.5 w-1.5 rounded-full", modelReady ? "bg-emerald-600" : "bg-amber-600")} />
              {modelText}
            </span>
          </Row>
        </section>

        <section className="divide-y">
          <SectionLabel className="pb-2">Account</SectionLabel>
          <Row title="Gmail" description={userEmail ?? "Connected"}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onDisconnect();
              }}
            >
              Disconnect
            </Button>
          </Row>
        </section>
      </div>
    </Dialog>
  );
}
