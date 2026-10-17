"use client";

import { LogOut, Mail, Menu, Moon, Settings, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/primitives";

interface NavbarProps {
  connected: boolean;
  userEmail: string | null;
  onToggleTheme: () => void;
  onDisconnect: () => void;
  onOpenSidebar: () => void;
  onOpenSettings: () => void;
}

export function Navbar({
  connected,
  userEmail,
  onToggleTheme,
  onDisconnect,
  onOpenSidebar,
  onOpenSettings,
}: NavbarProps) {
  // Derive a display name from the address, e.g. "jamie.lee@x.com" -> "jamie lee".
  const displayName = userEmail ? userEmail.split("@")[0].replace(/[._-]+/g, " ") : "Account";

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b bg-card px-4">
      {connected && (
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Open sidebar">
          <Menu className="h-4 w-4" />
        </Button>
      )}

      <span className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
          <Mail className="h-3.5 w-3.5" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight">MailTriage</span>
      </span>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
          <Sun className="hidden h-4 w-4 dark:block" />
          <Moon className="h-4 w-4 dark:hidden" />
        </Button>

        {connected && (
          <DropdownMenu
            trigger={
              <span className="flex items-center gap-2 py-1 pl-2 pr-1" aria-label="Account menu">
                <span className="hidden max-w-40 truncate text-sm capitalize text-muted-foreground sm:inline">
                  {displayName}
                </span>
                <Avatar name={displayName} className="h-8 w-8" />
              </span>
            }
          >
            {(close) => (
              <>
                <div className="px-2.5 py-2">
                  <p className="truncate text-sm font-medium capitalize">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{userEmail ?? "Gmail connected"}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    close();
                    onOpenSettings();
                  }}
                >
                  <Settings /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  destructive
                  onClick={() => {
                    close();
                    onDisconnect();
                  }}
                >
                  <LogOut /> Disconnect Gmail
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
