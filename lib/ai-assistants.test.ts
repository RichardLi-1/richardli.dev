import { describe, expect, it } from "vitest";
import { aiAssistantFromHost, isBotUserAgent, matchAiFetcher } from "./ai-assistants";

describe("aiAssistantFromHost", () => {
  it("names ChatGPT from its utm_source value", () => {
    expect(aiAssistantFromHost("chatgpt.com")).toBe("ChatGPT");
  });

  it("ignores case and a leading www.", () => {
    expect(aiAssistantFromHost("WWW.Perplexity.ai")).toBe("Perplexity");
  });

  it("returns null for ordinary sites and missing values", () => {
    expect(aiAssistantFromHost("google.com")).toBeNull();
    expect(aiAssistantFromHost("")).toBeNull();
    expect(aiAssistantFromHost(null)).toBeNull();
  });
});

describe("matchAiFetcher", () => {
  it("classifies a live ChatGPT fetch as user-triggered", () => {
    const ua =
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot";
    expect(matchAiFetcher(ua)).toMatchObject({
      vendor: "OpenAI",
      kind: "user",
    });
  });

  it("tells OpenAI's training crawler apart from its user fetcher", () => {
    const ua =
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot";
    expect(matchAiFetcher(ua)?.kind).toBe("training");
  });

  it("returns null for a normal browser", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
    expect(matchAiFetcher(ua)).toBeNull();
  });
});

describe("isBotUserAgent", () => {
  it("flags search engine crawlers", () => {
    const ua =
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
    expect(isBotUserAgent(ua)).toBe(true);
  });

  it("flags user-triggered AI fetchers", () => {
    const ua =
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)";
    expect(isBotUserAgent(ua)).toBe(true);
  });

  it("flags Common Crawl", () => {
    expect(isBotUserAgent("CCBot/2.0 (https://commoncrawl.org/faq/)")).toBe(true);
  });

  it("flags command-line HTTP tools", () => {
    expect(isBotUserAgent("curl/8.4.0")).toBe(true);
  });

  it("treats a missing User-Agent as a bot", () => {
    expect(isBotUserAgent(null)).toBe(true);
    expect(isBotUserAgent("")).toBe(true);
  });

  it("lets a normal desktop browser through", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
    expect(isBotUserAgent(ua)).toBe(false);
  });

  it("lets iPhone Safari through", () => {
    const ua =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
    expect(isBotUserAgent(ua)).toBe(false);
  });
});
