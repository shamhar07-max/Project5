import { PublicPage } from "../public-page";
export default function Contact() { return <PublicPage eyebrow="Contact" title="Start a conversation." intro="Tell us what you want to learn, build or improve through the relevant workspace service." sections={[
  {title:"Product development",body:"Share the problem, users, stage and timeline with the Studio team.",href:"/workspace/intake?service=studio"},
  {title:"Business improvement",body:"Describe the operational challenge and the result you want to measure.",href:"/workspace/intake?service=business"},
  {title:"Other enquiries",body:"Create a support request after signing in. A general public contact channel has not been configured.",href:"/workspace/support"},
 ]}/>; }
