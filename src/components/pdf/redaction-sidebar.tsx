"use client";

import { useMemo } from "react";
import {
  Search,
  Mail,
  Phone,
  CreditCard,
  Calendar,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useRedactionStore } from "@/store/redaction-store";
import { cn } from "@/lib/utils";
import { countSearchMatches, type PatternKey } from "@/lib/pdf/text";

const PII_BUTTONS: { key: PatternKey; label: string; icon: React.ElementType }[] = [
  { key: "email", label: "Emails", icon: Mail },
  { key: "phone", label: "Phones", icon: Phone },
  { key: "creditCard", label: "Cards", icon: CreditCard },
  { key: "date", label: "Dates", icon: Calendar },
  { key: "ssn", label: "SSN", icon: Shield },
];

export function RedactionSidebar() {
  const searchQuery = useRedactionStore((s) => s.searchQuery);
  const useRegex = useRedactionStore((s) => s.useRegex);
  const setSearchQuery = useRedactionStore((s) => s.setSearchQuery);
  const setUseRegex = useRedactionStore((s) => s.setUseRegex);
  const textSpans = useRedactionStore((s) => s.textSpans);
  const runSearch = useRedactionStore((s) => s.runSearch);
  const addRedactions = useRedactionStore((s) => s.addRedactions);
  const runPatternDetect = useRedactionStore((s) => s.runPatternDetect);
  const patternSummary = useRedactionStore((s) => s.patternSummary);

  const matchCount = useMemo(
    () =>
      searchQuery.trim()
        ? countSearchMatches(textSpans, searchQuery, useRegex)
        : 0,
    [textSpans, searchQuery, useRegex]
  );

  const markSearchMatches = () => {
    const found = runSearch();
    if (!found.length) {
      alert("No matches found.");
      return;
    }
    addRedactions(found);
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Search text
        </Label>
        <div className="flex gap-2">
          <Input
            className="h-10"
            placeholder="Name, email, phrase…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && markSearchMatches()}
          />
          <Button
            size="icon"
            variant="outline"
            className="h-10 w-10 shrink-0"
            onClick={markSearchMatches}
            title="Mark all matches"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useRegex}
            onChange={(e) => setUseRegex(e.target.checked)}
            className="rounded border-input"
          />
          Use regex
        </label>
        {matchCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {matchCount} match{matchCount !== 1 ? "es" : ""} in document
          </p>
        )}
        <Button className="h-10 w-full" size="sm" onClick={markSearchMatches} disabled={!searchQuery.trim()}>
          Mark all matches
        </Button>
      </section>

      <Separator />

      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Detect PII
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PII_BUTTONS.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              className={cn("h-10 justify-start gap-2 text-xs", key === "ssn" && "col-span-2")}
              onClick={() => runPatternDetect([key])}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </Button>
          ))}
        </div>
        <Button
          className="w-full"
          variant="secondary"
          size="sm"
          onClick={() => runPatternDetect(["email", "phone", "creditCard", "date", "ssn"])}
        >
          Detect all
        </Button>
        {patternSummary && (
          <p className="rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
            Found {patternSummary}. Then click Apply Redactions.
          </p>
        )}
      </section>
    </div>
  );
}
