"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRedactionStore } from "@/store/redaction-store";

export function TextSearchPanel() {
  const searchQuery = useRedactionStore((s) => s.searchQuery);
  const useRegex = useRedactionStore((s) => s.useRegex);
  const setSearchQuery = useRedactionStore((s) => s.setSearchQuery);
  const setUseRegex = useRedactionStore((s) => s.setUseRegex);
  const runSearch = useRedactionStore((s) => s.runSearch);
  const addRedactions = useRedactionStore((s) => s.addRedactions);

  const handleRedactAll = () => {
    const found = runSearch();
    if (found.length === 0) {
      alert("No matches found.");
      return;
    }
    addRedactions(found);
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Text search
      </Label>
      <div className="flex gap-2">
        <Input
          placeholder='e.g. "John Smith"'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRedactAll()}
        />
        <Button size="icon" variant="outline" onClick={handleRedactAll} title="Redact all matches">
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
      <Button className="w-full" size="sm" onClick={handleRedactAll} disabled={!searchQuery.trim()}>
        Redact All Matches
      </Button>
    </div>
  );
}
