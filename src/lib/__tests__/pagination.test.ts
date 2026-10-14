import { describe, expect, test } from "bun:test";

import { pageWindow } from "@/lib/pagination";

describe("pageWindow", () => {
  test("starts at 1 on the first pages", () => {
    expect(pageWindow(1, 10)).toEqual({ start: 1, end: 5 });
    expect(pageWindow(3, 10)).toEqual({ start: 1, end: 5 });
  });
  test("centres in the middle", () => {
    expect(pageWindow(6, 20)).toEqual({ start: 4, end: 8 });
  });
  test("keeps five numbers at the end", () => {
    expect(pageWindow(10, 10)).toEqual({ start: 6, end: 10 });
    expect(pageWindow(9, 10)).toEqual({ start: 6, end: 10 });
  });
  test("short lists show every page", () => {
    expect(pageWindow(1, 1)).toEqual({ start: 1, end: 1 });
    expect(pageWindow(2, 3)).toEqual({ start: 1, end: 3 });
  });
});
