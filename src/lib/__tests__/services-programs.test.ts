import { describe, expect, it } from "bun:test";

import {
  programFromHash,
  SERVICE_PROGRAMS,
} from "@/constants/services-programs";

describe("programFromHash", () => {
  it("finds a programme from the URL hash, with or without the #", () => {
    expect(programFromHash("#diet")).toBe("diet");
    expect(programFromHash("nutrition")).toBe("nutrition");
  });

  it("ignores hashes that are not a programme", () => {
    expect(programFromHash("")).toBeNull();
    expect(programFromHash("#profiles")).toBeNull();
    expect(programFromHash("#coaching")).toBeNull();
  });
});

describe("SERVICE_PROGRAMS", () => {
  it("keeps the three programmes with their details", () => {
    expect(SERVICE_PROGRAMS.map((program) => program.id)).toEqual([
      "exercise",
      "nutrition",
      "diet",
    ]);
    for (const program of SERVICE_PROGRAMS) {
      expect(program.features.length).toBeGreaterThanOrEqual(5);
      expect(program.tags.length).toBeGreaterThan(0);
    }
  });
});
