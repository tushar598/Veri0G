import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Veri0G",
  description: "Check whether a 0G Compute provider is running inside a genuine, attested TEE.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
