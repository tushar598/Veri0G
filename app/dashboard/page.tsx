// Server component — reads ?provider= from the URL and passes it down.
// All interactive logic lives in DashboardClient (a Client Component).
import { DashboardClient } from "@/app/components/DashboardClient";

interface Props {
  searchParams: Promise<{ provider?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const { provider } = await searchParams;

  // Validate basic format before passing it down (prevent garbage input from URL)
  const isValidAddress = provider
    ? /^0x[0-9a-fA-F]{40}$/.test(provider)
    : false;

  return (
    <DashboardClient initialProvider={isValidAddress ? provider : undefined} />
  );
}