"use client";

import { LogOut, Menu, Moon, Settings, ShieldCheck, Sun, Unplug, User } from "lucide-react";
import { Avatar } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavbarProps {
  connected: boolean;
  dark: boolean;
  onToggleTheme: () => void;
  onDisconnect: () => void;
  onOpenSidebar: () => void;
}

export function Navbar({ connected, dark, onToggleTheme, onDisconnect, onOpenSidebar }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="Open sidebar">
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/30">
          <ShieldCheck className="h-4 w-4 text-white" />
        </span>
        <span className="text-sm font-semibold tracking-tight">InboxGuard</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span
          className={cn(
            "hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset sm:inline-flex",
            connected
              ? "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400"
              : "bg-muted text-muted-foreground ring-border",
          )}
        >
          <span className="relative flex h-1.5 w-1.5">
            {connected && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />}
            <span className={cn("relative h-1.5 w-1.5 rounded-full", connected ? "bg-emerald-500" : "bg-zinc-400")} />
          </span>
          {connected ? "Connected to Gmail" : "Gmail not connected"}
        </span>

        <Button variant="ghost" size="icon" onClick={onToggleTheme} aria-label="Toggle theme">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu trigger={<Avatar name="Alex Morgan" />}>
          {(close) => (
            <>
              <div className="px-2.5 py-2">
                <p className="text-sm font-medium">Alex Morgan</p>
                <p className="truncate text-xs text-muted-foreground">alex.morgan@gmail.com</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={close}>
                <User /> Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={close}>
                <Settings /> Settings
              </DropdownMenuItem>
              {connected && (
                <DropdownMenuItem
                  onClick={() => {
                    onDisconnect();
                    close();
                  }}
                >
                  <Unplug /> Disconnect Gmail
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={close}>
                <LogOut /> Log out
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenu>
      </div>
    </header>
  );
}
