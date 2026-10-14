import { describe, expect, test } from "bun:test";

import {
  isValidMobile,
  validateAge,
  validateEmail,
  validateHeight,
  validateMobile,
  validateRequired,
  validateWeight,
} from "@/lib/validation";

describe("mobile", () => {
  test("accepts 10 digits starting 6 to 9, ignoring spaces and dashes", () => {
    expect(isValidMobile("9823456712")).toBe(true);
    expect(isValidMobile("98234 56712")).toBe(true);
    expect(isValidMobile("98-2345-6712")).toBe(true);
  });
  test("rejects short, long and wrong-prefix numbers", () => {
    expect(isValidMobile("982345671")).toBe(false);
    expect(isValidMobile("98234567123")).toBe(false);
    expect(isValidMobile("5823456712")).toBe(false);
    expect(isValidMobile("")).toBe(false);
  });
  test("required flag controls the empty case", () => {
    expect(validateMobile("")).not.toBeNull();
    expect(validateMobile("  ", false)).toBeNull();
  });
});

describe("email", () => {
  test("optional by default, valid and invalid forms", () => {
    expect(validateEmail("")).toBeNull();
    expect(validateEmail("", true)).not.toBeNull();
    expect(validateEmail("a@b.co")).toBeNull();
    expect(validateEmail("a@b")).not.toBeNull();
    expect(validateEmail("a b@c.com")).not.toBeNull();
  });
});

describe("body measurements", () => {
  test("age is a whole number from 5 to 100", () => {
    expect(validateAge("28")).toBeNull();
    expect(validateAge("4")).not.toBeNull();
    expect(validateAge("101")).not.toBeNull();
    expect(validateAge("28.5")).not.toBeNull();
    expect(validateAge("abc")).not.toBeNull();
  });
  test("height is 100 to 250 cm and weight 20 to 200 kg", () => {
    expect(validateHeight("162")).toBeNull();
    expect(validateHeight("99.9")).not.toBeNull();
    expect(validateHeight("")).toBe("Height is required.");
    expect(validateWeight("58.5")).toBeNull();
    expect(validateWeight("201")).not.toBeNull();
    expect(validateWeight("-5")).not.toBeNull();
    expect(validateWeight("1e2")).not.toBeNull();
  });
});

test("required trims whitespace", () => {
  expect(validateRequired("   ", "Name")).toBe("Name is required.");
  expect(validateRequired("x", "Name")).toBeNull();
});
