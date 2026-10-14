"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/primitives";
import type { StyleExample } from "@/lib/types";

interface WritingStyleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examples: StyleExample[];
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
}

export function WritingStyleDialog({ open, onOpenChange, examples, onAdd, onRemove }: WritingStyleDialogProps) {
  const [text, setText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="My Writing Style"
      description="Paste a few past replies. Gemma 3 uses them locally to match your tone in new drafts."
      footer={<Button onClick={() => onOpenChange(false)}>Done</Button>}
    >
      <div className="space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={"Hi Jamie,\n\nThanks for the quick turnaround — this looks great…"}
        />
        <Button variant="outline" size="sm" onClick={add} disabled={!text.trim()}>
          <Plus className="h-3.5 w-3.5" /> Add example
        </Button>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Saved examples · {examples.length}
        </p>
        {examples.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            No examples yet. 3–5 replies is usually enough.
          </p>
        ) : (
          <ul className="space-y-2">
            {examples.map((ex) => (
              <li key={ex.id} className="group flex gap-3 rounded-lg border bg-muted/30 p-3">
                <p className="line-clamp-3 flex-1 whitespace-pre-wrap text-xs leading-relaxed text-foreground/80">{ex.text}</p>
                <button
                  onClick={() => onRemove(ex.id)}
                  className="self-start rounded-md p-1 text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                  aria-label="Remove example"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
