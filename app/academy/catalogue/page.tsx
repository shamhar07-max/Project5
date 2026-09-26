import { PublicFrame, SectionHead } from "../_components/chrome";
import { CatalogueBrowser } from "../_components/client";
import { CATALOG, FAMILIES, type Family } from "../../../lib/academy/catalog";
import { FLAGSHIP } from "../../../lib/academy/curriculum";

export const metadata = { title: "Catalogue · DigitalBurj Academy" };

export default async function Catalogue({ searchParams }: { searchParams: Promise<{ family?: string }> }) {
  const { family } = await searchParams;
  const initial = FAMILIES.some(f => f.id === family) ? family as Family : "All";
  return <PublicFrame active="/academy/catalogue">
    <section className="a-hero" style={{ paddingBottom: "2rem" }}>
      <div className="a-grid-bg" aria-hidden="true" />
      <div className="a-shell" style={{ position: "relative" }}>
        <SectionHead eyebrow="Public catalogue" title={<>{CATALOG.length} units. <em className="a-grad">One standard.</em></>} lede="Technology, Professional Foundation, Professional Career, Advanced and the DB-22 Assessment Centre. Every unit follows the same contract: foundations, scenario practice, a twelve-stage mission and an evidence review." />
      </div>
    </section>
    <section style={{ paddingBottom: "6rem" }}>
      <div className="a-shell"><CatalogueBrowser courses={CATALOG} initialFamily={initial} authoredCodes={FLAGSHIP} /></div>
    </section>
  </PublicFrame>;
}
