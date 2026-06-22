import type { Favourites } from "@/lib/favourites";
import type { ScoredArticle } from "@/lib/matching";
import type { Preferences } from "@/lib/preferences";

export type NewsletterTemplateInput = {
  siteName: string;
  email: string;
  preferences: Preferences;
  favourites: Favourites;
  stories: ScoredArticle[];
};

export type NewsletterTemplate = {
  subject: string;
  text: string;
  html: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function list(values: string[]): string {
  return values.length ? values.join(", ") : "No selection";
}

function preferenceSummary(preferences: Preferences): string[] {
  return [
    `Brands: ${list(preferences.brands)}`,
    `Model Platforms: ${list(preferences.models)}`,
    `Creators: ${list(preferences.creators)}`,
    `Sources: ${list(preferences.sources)}`,
    `Topics: ${list(preferences.topics)}`,
    `Technology: ${list(preferences.technology)}`,
  ];
}

function favouritesSummary(favourites: Favourites): string[] {
  return [
    `Favourite Brands: ${list(favourites.brands)}`,
    `Favourite Platforms: ${list(favourites.modelPlatforms)}`,
    `Favourite Creators: ${list(favourites.creators)}`,
    `Favourite Sources: ${list(favourites.sources)}`,
  ];
}

export function buildNewsletterTemplate({
  siteName,
  email,
  preferences,
  favourites,
  stories,
}: NewsletterTemplateInput): NewsletterTemplate {
  const subject = `${siteName}: your personalised update`;
  const storyLines = stories.map(
    ({ article, matchedBecause }, index) =>
      `${index + 1}. ${article.title}\n${article.source} - ${article.link}\nMatched because: ${
        matchedBecause.length ? matchedBecause.join(", ") : "General match"
      }`,
  );
  const text = [
    `Your next ${siteName} update preview`,
    `Subscriber: ${email}`,
    `Story count: ${preferences.storiesPerUpdate}`,
    "",
    ...preferenceSummary(preferences),
    "",
    ...favouritesSummary(favourites),
    "",
    "Stories",
    stories.length ? storyLines.join("\n\n") : "No stories matched yet.",
  ].join("\n");
  const htmlStories = stories
    .map(
      ({ article, matchedBecause }) => `
        <article style="border-top:1px solid #dbeafe;padding:16px 0;">
          <p style="margin:0 0 6px;color:#2563eb;font-size:12px;font-weight:700;text-transform:uppercase;">${escapeHtml(
            article.source,
          )}</p>
          <h2 style="margin:0 0 8px;font-size:20px;line-height:1.35;">${escapeHtml(
            article.title,
          )}</h2>
          <p style="margin:0 0 10px;color:#475569;line-height:1.6;">${escapeHtml(
            article.summary,
          )}</p>
          <p style="margin:0 0 10px;color:#1e3a8a;font-weight:700;">Matched because: ${escapeHtml(
            matchedBecause.length ? matchedBecause.join(", ") : "General match",
          )}</p>
          <a href="${escapeHtml(
            article.link,
          )}" style="color:#1d4ed8;font-weight:700;">Read original</a>
        </article>`,
    )
    .join("");
  const html = `
    <main style="font-family:Arial,sans-serif;color:#0f172a;max-width:720px;margin:0 auto;padding:24px;">
      <p style="margin:0 0 8px;color:#2563eb;font-weight:700;">${escapeHtml(
        siteName,
      )}</p>
      <h1 style="margin:0 0 12px;font-size:28px;line-height:1.25;">Your personalised update preview</h1>
      <p style="margin:0 0 18px;color:#475569;">Prepared for ${escapeHtml(
        email,
      )}. Story count: ${escapeHtml(preferences.storiesPerUpdate)}.</p>
      <section style="border:1px solid #dbeafe;background:#eff6ff;padding:16px;margin-bottom:16px;">
        <h2 style="margin:0 0 8px;font-size:16px;">Your signal</h2>
        <p style="margin:0;color:#334155;line-height:1.6;">${escapeHtml(
          [...preferenceSummary(preferences), ...favouritesSummary(favourites)].join(
            " | ",
          ),
        )}</p>
      </section>
      ${htmlStories || "<p>No stories matched yet.</p>"}
    </main>`;

  return {
    subject,
    text,
    html,
  };
}
