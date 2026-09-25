import { PublicPage } from "../public-page";
export default function Contact() { return <PublicPage eyebrow="Contact" title={<>Start a <em>conversation.</em></>} hue={["#25d366", "#2563eb"]} intro="Tell us what you want to learn, build or improve through the relevant workspace service." sections={[
  {title:"Product development",body:"Share the problem, users, stage and timeline with the Studio team.",href:"/workspace/intake?service=studio"},
  {title:"Business improvement",body:"Describe the operational challenge and the result you want to measure.",href:"/workspace/intake?service=business"},
  {title:"WhatsApp",body:"Compose a guided first message and continue the conversation on WhatsApp.",href:"/connect/whatsapp"},
  {title:"Mobile app",body:"Install DigitalBurj on your phone for one-tap access to your workspace.",href:"/app"},
  {title:"Other enquiries",body:"Create a support request after signing in. A general public contact channel has not been configured.",href:"/workspace/support"},
 ]}/>; }
