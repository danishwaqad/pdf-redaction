"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DEMO_YOUTUBE_VIDEO_ID } from "@/lib/site-messaging";

type DemoVideoModalProps = {
  variant?: "hero" | "compact";
};

export function DemoVideoModal({ variant = "hero" }: DemoVideoModalProps) {
  const [open, setOpen] = useState(false);
  const isHero = variant === "hero";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={isHero ? "outline" : "ghost"}
          size={isHero ? "lg" : "sm"}
          className={isHero ? "h-12 px-8 text-base" : "h-8 gap-1.5 px-2 text-xs text-muted-foreground"}
        >
          <Play className={isHero ? "h-4 w-4" : "h-3.5 w-3.5"} />
          See 10-sec Demo
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-4 p-4 sm:p-5">
        <DialogTitle>RedactPDF in 10 seconds</DialogTitle>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
          {open ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${DEMO_YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
              title="RedactPDF demo — search, mark all, apply redaction"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : null}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Search → mark all matches → apply → download.{" "}
          <a
            href={`https://youtu.be/${DEMO_YOUTUBE_VIDEO_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand hover:underline"
          >
            Watch on YouTube
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}

export function DemoVideoEmbed({ title = "See RedactPDF in action" }: { title?: string }) {
  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <h3 className="mb-4 text-center text-lg font-semibold">{title}</h3>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-slate-900 shadow-md">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${DEMO_YOUTUBE_VIDEO_ID}?rel=0`}
          title="RedactPDF demo — search, mark all, apply redaction"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}
