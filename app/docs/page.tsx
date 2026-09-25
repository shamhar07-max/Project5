import { PublicPage } from "../public-page";
export default function Docs(){return <PublicPage eyebrow="Guides" title={<>Using <em>DigitalBurj.</em></>} hue={["#6366f1", "#10b981"]} intro="Find the right service, manage your workspace context and understand how your information is handled." sections={[
  {title:"Getting started",body:"Choose your goal from Get Started. You can use multiple divisions with the same account.",href:"/get-started"},
  {title:"Organizations",body:"Create an organization, invite members and switch context before working with shared records.",href:"/workspace/organizations"},
  {title:"Academy",body:"Practical learning should include missions, feedback and evidence. Course completion is separate from independent verification.",href:"/academy"},
  {title:"Studio & Business AI",body:"An initial enquiry begins discovery. It is not a project approval, proposal or payment.",href:"/workspace/intake"},
  {title:"Talent & Jobs",body:"Profiles and applications are separate. Sharing professional evidence should require your explicit consent.",href:"/talent"},
  {title:"Help center",body:"Step-by-step guides for accounts, Academy, Studio, Business AI, Talent, Jobs, billing and integrations.",href:"/support"},
  {title:"API & webhooks",body:"Versioned REST API with scoped organization keys, a consistent error model and signed webhooks.",href:"/docs/api"},
  {title:"Service status",body:"Live component health, incidents and maintenance.",href:"/status"},
  {title:"Support",body:"Create and track a support ticket from your workspace.",href:"/workspace/support"},
 ]}/>;}
