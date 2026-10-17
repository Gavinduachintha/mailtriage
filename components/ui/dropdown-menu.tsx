"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function DropdownMenu({
  trigger,
  children,
  align = "end",
}: {
  trigger: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: "start" | "end";
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center rounded-md transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full z-50 mt-1.5 w-56 rounded-md border bg-card p-1 animate-fade-in",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  destructive,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { destructive?: boolean }) {
  return (
    <button
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-sm transition-colors cursor-pointer [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-muted-foreground",
        destructive ? "text-red-700 hover:bg-red-600/10 dark:text-red-400 [&_svg]:text-current" : "hover:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuSeparator() {
  return <div className="-mx-1 my-1 h-px bg-border" />;
}
