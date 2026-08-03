"use client";

import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ComparisonTable } from "@/components/landing/comparison-table";
import { KeywordHubSection } from "@/components/landing/keyword-hub-section";
import { FaqSection } from "@/components/landing/faq";

export function HomeClient() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <ComparisonTable />
      <KeywordHubSection />
      <FaqSection />
    </>
  );
}
