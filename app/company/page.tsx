import { PublicPage } from "../public-page";
export default function Company() { return <PublicPage eyebrow="Company" title={<>One technology company. <em>Built on evidence.</em></>} image="companyHero" hue={["#e10613", "#d8b46a"]} intro="A technology company connecting practical education, engineering, operational improvement and professional capability." sections={[
  {title:"Our purpose",body:"Build useful capability and technology around real problems, with clear outcomes and responsible delivery."},
  {title:"Our approach",body:"Learn through practice, validate before building, diagnose before automating, and distinguish claimed skills from assessed evidence."},
  {title:"Our people",body:"The blueprint brings together product strategy, engineering, education, business analysis, verification, support and operational assurance."},
  {title:"Products & ventures",body:"The company blueprint lists LoadByTon, VelozTrade, The Imam Collective, Rootiva Herbal, Procurazo, Attesora, HospyQ, Elite Escape, MedinaBridge and Resilianta. Their availability is assessed individually."},
  {title:"Work with us",body:"Choose a division or start a general conversation.",href:"/get-started"},
 ]}/>; }
