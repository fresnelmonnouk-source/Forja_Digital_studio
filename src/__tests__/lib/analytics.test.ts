/**
 * @jest-environment jsdom
 */
import { track, identify, reset, getConsent, setConsent } from "@/lib/analytics";

describe("analytics helper (consentement strict)", () => {
  beforeEach(() => {
    // Stub PostHog côté window (le provider en place le vrai SDK en prod).
    (window as unknown as { posthog: unknown }).posthog = {
      capture: jest.fn(),
      identify: jest.fn(),
      reset: jest.fn(),
    };
    window.localStorage.clear();
  });

  it("getConsent() retourne 'unknown' par défaut (rien en localStorage)", () => {
    expect(getConsent()).toBe("unknown");
  });

  it("setConsent('granted') persiste et getConsent le retrouve", () => {
    setConsent("granted");
    expect(getConsent()).toBe("granted");
  });

  it("setConsent('denied') persiste et getConsent le retrouve", () => {
    setConsent("denied");
    expect(getConsent()).toBe("denied");
  });

  it("track() est un no-op tant que le consentement est 'unknown'", () => {
    const ph = (window as unknown as { posthog: { capture: jest.Mock } }).posthog;
    track("landing_viewed");
    expect(ph.capture).not.toHaveBeenCalled();
  });

  it("track() est un no-op si le consentement est 'denied'", () => {
    setConsent("denied");
    const ph = (window as unknown as { posthog: { capture: jest.Mock } }).posthog;
    track("landing_viewed", { source: "test" });
    expect(ph.capture).not.toHaveBeenCalled();
  });

  it("track() capture l'event quand le consentement est 'granted'", () => {
    setConsent("granted");
    const ph = (window as unknown as { posthog: { capture: jest.Mock } }).posthog;
    track("landing_viewed", { source: "direct" });
    expect(ph.capture).toHaveBeenCalledTimes(1);
    expect(ph.capture).toHaveBeenCalledWith("landing_viewed", { source: "direct" });
  });

  it("identify() respecte le consentement", () => {
    const ph = (window as unknown as { posthog: { identify: jest.Mock } }).posthog;
    // Sans consentement → no-op
    identify("user-1", { plan: "free" });
    expect(ph.identify).not.toHaveBeenCalled();
    // Avec consentement → appel
    setConsent("granted");
    identify("user-1", { plan: "free" });
    expect(ph.identify).toHaveBeenCalledWith("user-1", { plan: "free" });
  });

  it("reset() s'exécute sans consentement (utile pour purger à la déconnexion)", () => {
    const ph = (window as unknown as { posthog: { reset: jest.Mock } }).posthog;
    reset();
    expect(ph.reset).toHaveBeenCalledTimes(1);
  });

  it("setConsent dispatche un CustomEvent 'forja-consent-change'", () => {
    const listener = jest.fn();
    window.addEventListener("forja-consent-change", listener);
    setConsent("granted");
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("forja-consent-change", listener);
  });

  it("PostHog absent du window → track() ne crashe pas (défensif)", () => {
    delete (window as unknown as { posthog?: unknown }).posthog;
    setConsent("granted");
    expect(() => track("landing_viewed")).not.toThrow();
  });
});
