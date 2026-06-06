import { describe, expect, it } from "vitest";
import { formatEmailFrom } from "../lib/server/email";

describe("formatEmailFrom", () => {
  it("keeps a valid display-name sender", () => {
    expect(formatEmailFrom('"Disputr" <hello@example.com>')).toBe('"Disputr" <hello@example.com>');
  });

  it("keeps a bare email sender", () => {
    expect(formatEmailFrom("hello@example.com")).toBe("hello@example.com");
  });

  it("normalizes a name followed by an email address", () => {
    expect(formatEmailFrom("Disputr convertyourcodes@gmail.com")).toBe('"Disputr" <convertyourcodes@gmail.com>');
  });
});
