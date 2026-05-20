"use client";

import { Mail, Phone, CreditCard, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRedactionStore } from "@/store/redaction-store";
import type { PatternKey } from "@/lib/pdf/pattern-detect";

const PATTERN_BUTTONS: { key: PatternKey; label: string; icon: React.ElementType }[] = [
  { key: "email", label: "Emails", icon: Mail },
  { key: "phone", label: "Phones", icon: Phone },
  { key: "creditCard", label: "Cards", icon: CreditCard },
  { key: "date", label: "Dates", icon: Calendar },
  { key: "ssn", label: "SSN", icon: Shield },
];

export function PatternDetectPanel() {
  const runPatternDetect = useRedactionStore((s) => s.runPatternDetect);
  const patternSummary = useRedactionStore((s) => s.patternSummary);
  const patternCounts = useRedactionStore((s) => s.patternCounts);

  const total = patternCounts
    ? Object.values(patternCounts).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Auto-detect PII
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PATTERN_BUTTONS.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            className="justify-start gap-2 text-xs"
            onClick={() => runPatternDetect([key])}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>
      <Button
        className="w-full"
        variant="secondary"
        size="sm"
        onClick={() =>
          runPatternDetect(["email", "phone", "creditCard", "date", "ssn"])
        }
      >
        Detect All Patterns
      </Button>
      {patternSummary && (
        <p className="rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
          Found {patternSummary}.
          {total > 0 ? " Marked for redaction — use Download to apply permanently." : ""}
        </p>
      )}
    </div>
  );
}
