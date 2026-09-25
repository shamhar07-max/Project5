import { PublicPage } from "../public-page";
export default function Company() { return <PublicPage eyebrow="Company" title={<>One technology company. <em>Built on evidence.</em></>} image="companyHero" hue={["#e10613", "#d8b46a"]} intro="A technology company connecting practical education, engineering, operational improvement and professional capability." sections={[
  {title:"Our purpose",body:"Help people learn useful skills and help organizations build systems that make daily work better."},
  {title:"Our approach",body:"Learn through practice, validate before building, diagnose before automating, and distinguish claimed skills from assessed evidence."},
  {title:"Our people",body:"Our work draws on product strategy, engineering, education, business analysis and careful review. The right specialists join each engagement as needed."},
  {title:"Products & ventures",body:"DigitalBurj also develops and supports ventures in different sectors. Ask us about a specific product to learn its current stage."},
  {title:"Work with us",body:"Tell us what you are working on and we will connect you with the right team.",href:"/get-started"},
 ]}/>; }
