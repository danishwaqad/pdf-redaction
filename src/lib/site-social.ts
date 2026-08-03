import type { LucideIcon } from "lucide-react";
import { Facebook, Instagram, Linkedin, Youtube } from "lucide-react";

/** Founder social profiles — used in footer and about page */
export const SOCIAL_LINKS: ReadonlyArray<{
  href: string;
  label: string;
  icon: LucideIcon;
}> = [
  {
    href: "https://www.facebook.com/ddanishwaqad/",
    label: "Danish Waqad on Facebook",
    icon: Facebook,
  },
  {
    href: "https://www.instagram.com/danishwaqad/",
    label: "Danish Waqad on Instagram",
    icon: Instagram,
  },
  {
    href: "https://www.youtube.com/@danishwaqad3969",
    label: "Danish Waqad on YouTube",
    icon: Youtube,
  },
  {
    href: "https://pk.linkedin.com/in/danish-waqad",
    label: "Danish Waqad on LinkedIn",
    icon: Linkedin,
  },
];
