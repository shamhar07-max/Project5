import type { SceneKey } from "../brand-data";

const sceneImage: Partial<Record<SceneKey, "tower" | "creative" | "operations">> = {
  homeHero: "tower", companyHero: "tower", ecosystemHero: "tower", getStartedHero: "tower",
  heroAcademy: "creative", heroStudio: "creative",
  heroBusiness: "operations", heroTalent: "operations", heroJobs: "operations",
};

/** A small, pre-sized, responsive asset with no image runtime or animation JavaScript. */
export function HeroImage({ scene, context = "" }: { scene?: SceneKey; context?: string }) {
  const name = sceneImage[scene ?? "homeHero"] ?? (/academy|studio|technology|platform|docs|app/i.test(context) ? "creative" : /business|jobs|talent|contact/i.test(context) ? "operations" : "tower");
  return <picture className="cinematic-image" aria-hidden="true">
    <source media="(max-width: 700px)" srcSet={`/brand/hero/${name}-720.webp`} />
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={`/brand/hero/${name}-1440.webp`} width="1440" height="810" alt="" decoding="async" loading="eager" fetchPriority="high" />
  </picture>;
}
