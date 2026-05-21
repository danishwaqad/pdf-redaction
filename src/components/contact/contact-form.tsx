"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CONTACT_EMAIL } from "@/lib/site-contact";
import { Loader2, Send } from "lucide-react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus("loading");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: data,
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMsg(json.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again or email us directly.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required placeholder="Your name" autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Your email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="How can we help?"
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Send message
      </Button>
      {status === "success" && (
        <p className="text-sm text-emerald-600">
          Message sent — we&apos;ll reply to your email within 2 business days.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">
          {errorMsg}{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      )}
    </form>
  );
}
