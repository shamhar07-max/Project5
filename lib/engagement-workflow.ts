export const engagementKinds = {
  studio: ["Problem and users", "Product assumption", "Requirement", "Milestone", "Quality note"],
  business: ["Current process", "Operational problem", "Baseline", "Improvement opportunity", "Human control"],
} as const;

export function validateEntry(service: keyof typeof engagementKinds, input: {
  kind: string; title: string; detail: string; evidence: string; measurement: string; measurementBasis: string;
}) {
  if (!(engagementKinds[service] as readonly string[]).includes(input.kind)) throw new Error("Choose an entry type for this service.");
  if (input.title.length < 3 || input.title.length > 140) throw new Error("Enter a title between 3 and 140 characters.");
  if (input.detail.length < 15 || input.detail.length > 4000) throw new Error("Describe the item in at least 15 characters.");
  if (input.evidence.length > 800 || input.measurement.length > 120) throw new Error("An entry field is too long.");
  if (input.kind === "Baseline") {
    if (!input.measurement || !["Measured", "Estimated"].includes(input.measurementBasis)) throw new Error("A baseline needs a value and a measured or estimated label.");
    if (input.measurementBasis === "Measured" && input.evidence.length < 10) throw new Error("Describe the source of a measured baseline.");
  } else if (input.measurement || input.measurementBasis) throw new Error("Only baselines can contain measurements.");
}
