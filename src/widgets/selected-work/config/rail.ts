export const railConfig = {
  compactQuery: "(max-width: 760px)",
  // Card widths as a percentage of the rail. 01 dominates; 02–04 advertise that more work exists.
  widths: { active: 48, activeCompressed: 43, next: 24, rest: 19, hover: 26 },
  gap: 16,
  // Discrete mouse wheels report ±100/±120 per notch; trackpads send small fractional deltas.
  wheelThreshold: 40,
  wheelNotch: 120,
  // ms without a notch after which the accumulated wheel target resets to the live position.
  wheelSettle: 300,
  dragThreshold: 6,
} as const;
