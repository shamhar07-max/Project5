import { PublicPage } from "../public-page";
export default function Privacy(){return <PublicPage eyebrow="Privacy" title="Your information" intro="DigitalBurj needs a reviewed legal privacy notice before public launch. This page explains the current app’s visible data handling, not a final legal policy." sections={[
  {title:"Workspace data",body:"Signed-in records, enquiries, messages and documents are stored in the app and scoped to the individual or selected organization."},
  {title:"Sharing",body:"Organization members can see shared organization records and team messages. Personal records remain in the individual context."},
  {title:"Identity",body:"The current app uses ChatGPT sign-in. A future dedicated DigitalBurj identity system is specified in the master blueprint."},
  {title:"Requests",body:"Use Support for access or data questions while formal export and erasure workflows are under development.",href:"/workspace/support"},
 ]}/>;}
