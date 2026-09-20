const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
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
  /** ms of slack before continuing without waiting for an animation (hidden tab). */
  grace: 150,
  content: 0.45,
  contentDelay: 0.15,
  contentEase: "easeOut",
  ease: ease.inOutQuart,
} as const;
