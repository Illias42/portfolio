export const sections = {
  work: { id: "selected-work", label: "Selected work", nav: "Work", index: 1 },
  experience: { id: "experience", label: "Experience", nav: "Experience", index: 2 },
  capabilities: { id: "capabilities", label: "Capabilities", nav: "Capabilities", index: 3 },
  contact: { id: "contact", label: "Contact", nav: "Contact", index: 4 },
} as const;

export const sectionOrder = [
  sections.work,
  sections.experience,
  sections.capabilities,
  sections.contact,
] as const;
