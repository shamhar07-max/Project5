import { PublicPage } from "../public-page";
export default function Status(){return <PublicPage eyebrow="Service status" title={<>Availability <em>updates.</em></>} art={{ seed: "status-hero", variant: "bars" }} hue={["#10b981", "#22d3ee"]} intro="This page does not yet receive automated health or incident data. For a service problem, create a support ticket." sections={[
  {title:"Incident reporting",body:"Report an issue with enough detail to identify the affected service and your organization context.",href:"/workspace/support"},
  {title:"Monitoring",body:"Automated public uptime and incident history are planned; no live status claims are shown until monitoring is connected."},
 ]}/>;}
