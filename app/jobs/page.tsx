import DivisionPage from "../[division]/page";

// The static app/jobs folder (board routes) would otherwise shadow the dynamic division page for /jobs.
export default function JobsDivision() {
  return <DivisionPage params={Promise.resolve({ division: "jobs" })} />;
}
