import { PublicPage } from "../public-page";
export default function Technology() { return <PublicPage eyebrow="Technology" scene="cardBusiness" title={<>Engineering for <em>practical use.</em></>} hue={["#2563eb", "#22d3ee"]} intro="Our teams build web products, connect existing systems and apply data or AI when there is a clear use for it. Security and reliability are part of the brief from the start." sections={[
  {title:"Software & platforms",body:"Web applications, APIs, enterprise systems and product engineering."},
  {title:"AI & workflow systems",body:"Operational analysis, controlled automation, human oversight and outcome measurement."},
  {title:"Data & integrations",body:"Data design, reporting and integration between systems with clear ownership boundaries."},
  {title:"Security & reliability",body:"Server-side permissions, tenant boundaries, audit trails and recoverable services."},
 ]}/>; }
