import { validatePassword } from "@/lib/validate-password";

describe("validatePassword", () => {
  it("should reject empty password", () => {
    expect(validatePassword("")).toBeTruthy();
    expect(validatePassword(null)).toBeTruthy();
    expect(validatePassword(undefined)).toBeTruthy();
    // @ts-expect-error - testing invalid input
    expect(validatePassword(123)).toBeTruthy();
  });

  it("should reject passwords shorter than 8 characters", () => {
    expect(validatePassword("Pass1")).toBeTruthy();
    expect(validatePassword("Pass12")).toBeTruthy();
    expect(validatePassword("Pass123")).toBeTruthy();
  });

  it("should reject passwords without uppercase letter", () => {
    expect(validatePassword("password1")).toBeTruthy();
  });

  it("should reject passwords without digit", () => {
    expect(validatePassword("Password")).toBeTruthy();
  });

  it("should accept valid passwords", () => {
    expect(validatePassword("ValidPass1")).toBeNull();
    expect(validatePassword("Mypassword123")).toBeNull();
    expect(validatePassword("A1bCdEfG")).toBeNull();
  });
});
