import { PublicPage } from "../public-page";
export default function Ecosystem() { return <PublicPage eyebrow="Ecosystem" title={<>Connected <em>where it helps.</em></>} image="ecosystemHero" hue={["#8b5cf6", "#22d3ee"]} intro="Each division has its own work, customers and decisions, with one identity and workspace for authorized activity." sections={[
  {title:"Academy",body:"Practical learning, assessment and evidence.",href:"/academy"},
  {title:"Studio",body:"Product discovery, validation, engineering and delivery.",href:"/studio"},
  {title:"Business AI",body:"Operational diagnosis, controlled automation and measurement.",href:"/business"},
  {title:"Verified Talent",body:"Professional profiles, evidence and consent-led discovery.",href:"/talent"},
  {title:"Jobs",body:"Listings, applications and structured recruitment.",href:"/jobs"},
 ]}/>; }
