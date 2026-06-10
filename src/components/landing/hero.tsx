import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoVideoModal } from "@/components/landing/demo-video-modal";
import { PdfUploader } from "@/components/pdf/pdf-uploader";
import { HERO_BADGE, HERO_SUBTITLE, HERO_TITLE } from "@/lib/site-messaging";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/80 via-white to-white" />
      <div className="relative mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-800">
            <Lock className="h-4 w-4" />
            {HERO_BADGE}
          </span>
          <h1 className="text-balance max-w-4xl text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            {HERO_TITLE}
          </h1>
          <p className="text-balance mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {HERO_SUBTITLE}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="h-12 px-8 text-base shadow-md">
              <Link href="/tool">
                Redact PDF Online Free
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <DemoVideoModal />
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-xl">
          <PdfUploader variant="hero" redirectToTool />
        </div>
      </div>
    </section>
  );
}
