import * as React from "react";
import { cn, initials } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-md border bg-card shadow-[0_1px_0_rgba(0,0,0,0.03)]", className)} {...props} />;
}

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded border bg-card px-1.5 py-0.5 text-[11px] font-medium text-foreground/80",
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-md border bg-card px-3 text-sm transition-colors placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-md border bg-card p-3 text-sm leading-relaxed transition-colors placeholder:text-muted-foreground scrollbar-thin",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ring",
        className,
      )}
      {...props}
    />
  );
}

export function Separator({ className, vertical }: { className?: string; vertical?: boolean }) {
  return <div role="separator" className={cn("shrink-0 bg-border", vertical ? "h-full w-px" : "h-px w-full", className)} />;
}

export function ScrollArea({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-y-auto scrollbar-thin", className)} {...props} />;
}

export function Avatar({ name, muted, className }: { name: string; muted?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full text-xs font-medium",
        muted ? "bg-muted text-foreground/80" : "bg-primary text-primary-foreground",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/** Small uppercase section heading used consistently across panels. */
export function SectionLabel({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", className)}
      {...props}
    />
  );
}
