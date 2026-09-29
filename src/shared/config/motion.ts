const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
  write: [0.45, 0.05, 0.35, 1],
} as const;

export const heroMotion = {
  ease: ease.outExpo,
  micro: 0.3,
  arrowDuration: 2,
} as const;

export const caseMotion = {
  open: 0.7,
  close: 0.25,
  closeScale: 0.985,
  closeEase: "easeIn",
  grace: 150,
  content: 0.45,
  contentDelay: 0.15,
  contentEase: "easeOut",
  ease: ease.inOutQuart,
} as const;

export const experienceMotion = {
  ease: ease.outExpo,
  reveal: 0.9,
  stagger: 0.09,
  rule: 1.6,
  lift: 18,
  amount: 0.25,
} as const;

export const capabilitiesMotion = {
  ease: ease.outExpo,
  reveal: 0.9,
  stagger: 0.08,
  lift: 14,
  amount: 0.3,
} as const;

export const contactMotion = {
  ease: ease.outExpo,
  reveal: 0.9,
  stagger: 0.09,
  lift: 16,
  rise: 1.1,
  rule: 1.2,
  write: 1.9,
  writeDelay: 0.6,
  writeEase: ease.write,
  underline: 0.8,
  amount: 0.35,
} as const;
