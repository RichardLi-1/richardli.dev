import { describe, expect, it } from "vitest";
import { scoreVisit, utcOffsetMinutes, type HumanSignals } from "./human-score";

// A normal desktop Chrome visitor who moved the mouse and scrolled.
const humanDesktop: HumanSignals = {
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  webdriver: false,
  languagesCount: 2,
  screenWidth: 1512,
  screenHeight: 982,
  outerWidth: 1512,
  outerHeight: 900,
  pluginsCount: 5,
  isMobile: false,
  timeZone: "America/Toronto",
  pointerMoves: 40,
  touches: 0,
  scrolls: 6,
  keyPresses: 0,
  wasVisible: true,
  interactedEarlier: false,
  msObserved: 5000,
};

// Headers a real Chrome sends on a same-origin fetch, geolocated to Toronto.
const chromeHeaders = new Headers({
  "user-agent": humanDesktop.userAgent,
  "accept-language": "en-CA,en;q=0.9",
  "sec-ch-ua": '"Chromium";v="141", "Google Chrome";v="141"',
  "sec-fetch-site": "same-origin",
  "x-vercel-ip-timezone": "America/Toronto",
});

describe("scoreVisit", () => {
  it("rates an interacting desktop visitor as likely human", () => {
    const result = scoreVisit(humanDesktop, chromeHeaders);
    expect(result.score).toBe(90); // 50 + 25 mouse + 15 scroll
    expect(result.label).toBe("likely human");
    expect(result.reasons).toEqual(["+25 mouse moved", "+15 scrolled"]);
  });

  it("rates a headless, automated browser as likely bot", () => {
    const headless = {
      ...humanDesktop,
      userAgent: humanDesktop.userAgent.replace("Chrome/", "HeadlessChrome/"),
      webdriver: true,
      languagesCount: 0,
      pointerMoves: 0,
      scrolls: 0,
    };
    const result = scoreVisit(headless, new Headers({ "user-agent": headless.userAgent }));
    expect(result.score).toBe(0); // clamped: far below zero before clamping
    expect(result.label).toBe("likely bot");
    expect(result.reasons).toContain("-50 webdriver flag (automated browser)");
  });

  it("only mildly penalises a quiet reader, so they land on 'unsure'", () => {
    const quiet = { ...humanDesktop, pointerMoves: 0, scrolls: 0 };
    const result = scoreVisit(quiet, chromeHeaders);
    expect(result.score).toBe(40); // 50 - 10 no input
    expect(result.label).toBe("unsure");
  });

  it("doesn't call a quick visit quiet before 5s have passed", () => {
    const quick = { ...humanDesktop, pointerMoves: 0, scrolls: 0, msObserved: 1200 };
    expect(scoreVisit(quick, chromeHeaders).score).toBe(50);
  });

  it("flags a Chrome user-agent that is missing Chrome's own headers", () => {
    const bare = new Headers({ "user-agent": humanDesktop.userAgent });
    const reasons = scoreVisit(humanDesktop, bare).reasons;
    expect(reasons).toContain("-20 no Accept-Language header");
    expect(reasons).toContain("-15 claims Chrome but no sec-ch-ua");
    expect(reasons).toContain("-10 no Sec-Fetch headers");
  });

  it("treats same-offset timezones as a match but flags a different offset", () => {
    const newYorkIp = new Headers(chromeHeaders);
    newYorkIp.set("x-vercel-ip-timezone", "America/New_York"); // same clock as Toronto
    expect(scoreVisit(humanDesktop, newYorkIp).score).toBe(90);

    const utcBrowser = { ...humanDesktop, timeZone: "UTC" };
    expect(scoreVisit(utcBrowser, chromeHeaders).reasons).toContain(
      "-10 browser timezone UTC ≠ IP timezone America/Toronto",
    );
  });

  it("copes with a partial or junk signals object from a hand-crafted POST", () => {
    expect(() => scoreVisit({}, new Headers())).not.toThrow();
  });
});

describe("utcOffsetMinutes", () => {
  it("reads offsets, including UTC itself and half-hour zones", () => {
    const winter = new Date("2026-01-15T12:00:00Z");
    expect(utcOffsetMinutes("UTC", winter)).toBe(0);
    expect(utcOffsetMinutes("America/Toronto", winter)).toBe(-300);
    expect(utcOffsetMinutes("Asia/Kolkata", winter)).toBe(330);
  });

  it("returns null for a made-up timezone", () => {
    expect(utcOffsetMinutes("Mars/Olympus_Mons")).toBeNull();
  });
});
