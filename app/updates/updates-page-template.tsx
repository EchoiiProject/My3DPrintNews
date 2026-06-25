import Link from "next/link";
import { DiscoverMorePanel } from "../discover-more-components";
import { FeedbackPanel } from "../feedback-panel";
import { FooterLinks } from "../footer-links";
import { ActionLinks, GlobalNav } from "../global-nav";

type UpdatePost = {
  title: string;
  date: string;
  content: string;
};

type UpdatesPageTemplateProps = {
  badge: string;
  title: string;
  intro: string;
  posts: UpdatePost[];
  feedbackCta: {
    heading: string;
    text: string;
    buttonLabel: string;
    href: string;
  };
};

export function UpdatesPageTemplate({
  badge,
  title,
  intro,
  posts,
  feedbackCta,
}: UpdatesPageTemplateProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />

        <div className="flex-1 py-10 sm:py-14">
          <header>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              {badge}
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              {intro}
            </p>
            <div className="mt-5">
              <ActionLinks
                links={[
                  { href: "/feed", label: "Feed" },
                  { href: "/sources", label: "Sources" },
                  { href: "/catch-up", label: "Catch Up" },
                ]}
              />
            </div>
          </header>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {posts.map((post) => (
              <article
                className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur"
                key={post.title}
              >
                <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
                  {post.date}
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-950">
                  {post.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {post.content}
                </p>
              </article>
            ))}
          </div>

          <section className="mt-8 rounded-lg border border-blue-100 bg-blue-50/80 p-5">
            <h2 className="text-xl font-bold text-blue-950">
              {feedbackCta.heading}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-900">
              {feedbackCta.text}
            </p>
            <Link
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              href={feedbackCta.href}
            >
              {feedbackCta.buttonLabel}
            </Link>
          </section>
        </div>

        <FeedbackPanel />
        <DiscoverMorePanel />
        <FooterLinks />
      </section>
    </main>
  );
}
