import { PipelinePage } from "../pipeline";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  return <PipelinePage section="studio" stage={(await searchParams).stage} />;
}
