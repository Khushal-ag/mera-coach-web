/** Years-of-experience choices on the Coach Details step. */
export const EXPERIENCE = [
  { value: "0", label: "Less than 1 year" },
  ...Array.from({ length: 30 }, (_, index) => {
    const years = index + 1;
    return {
      value: String(years),
      label: `${years} year${years > 1 ? "s" : ""}`,
    };
  }),
  { value: "31", label: "30+ years" },
];
