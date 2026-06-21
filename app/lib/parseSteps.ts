// src/app/lib/parseSteps.ts
export function extractHashPair(
  steps: string[]
): { calculated: string; eventLog: string } | null {
  const calcLine = steps.find((s) => s.includes("Calculated Hash:"));
  const eventLine = steps.find((s) => s.includes("Event Log Hash:"));
  if (!calcLine || !eventLine) return null;

  const calculated = calcLine.split("Calculated Hash:")[1]?.trim();
  const eventLog = eventLine.split("Event Log Hash:")[1]?.trim();
  if (!calculated || !eventLog) return null;

  return { calculated, eventLog };
}

export function cleanDockerImage(raw: string): string {
  return raw.replace(/\\+n\s*$/g, "").trim();
}