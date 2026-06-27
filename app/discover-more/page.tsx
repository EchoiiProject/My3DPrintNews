"use client";

import { verticals, type Vertical } from "@/config/verticals";
import { VerticalPublicationCard } from "../discover-more-components";
import { FooterLinks } from "../footer-links";
import { GlobalNav } from "../global-nav";

const sectionLabels = {
  industry: "Industries",
  interest: "Interests",
  place: "Places",
} as const;

const sectionDescriptions = {
  industry: "Publications for sectors, markets, and professional communities.",
  interest: "Publications for hobbies, sports, and enthusiast communities.",
  place: "Publications for cities, regions, and local communities.",
} as const;

function publicationsByType(type: NonNullable<Vertical["publicationType"]>) {
  return verticals.filter(
    (vertical) =>
      vertical.showInDiscover !== false && vertical.publicationType === type,
  );
}

function PublicationSection({
  publications,
  type,
}: {
  publications: Vertical[];
  type: NonNullable<Vertical["publicationType"]>;
}) {
  if (!publications.length) return null;

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            {sectionLabels[type]}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {sectionDescriptions[type]}
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {publications.map((vertical) => (
          <VerticalPublicationCard
            key={vertical.id}
            showSubscriberCount={vertical.status === "active"}
            vertical={vertical}
          />
        ))}
      </div>
    </section>
  );
}

export default function DiscoverMorePage() {
  const industryPublications = publicationsByType("industry");
  const interestPublications = publicationsByType("interest");
  const placePublications = publicationsByType("place");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />

        <div className="flex-1 py-10 sm:py-14">
          <header>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              MyNews Network
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Discover More
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Explore other personalised specialist news platforms from the
              MyNews Network.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Every publication is independently curated for its own specialist
              community, and you can subscribe to as many or as few as you wish.
            </p>
          </header>

          <PublicationSection
            publications={industryPublications}
            type="industry"
          />
          <PublicationSection
            publications={interestPublications}
            type="interest"
          />
          <PublicationSection publications={placePublications} type="place" />

          <section className="mt-10 rounded-lg border border-blue-100 bg-blue-50/80 p-5">
            <h2 className="text-2xl font-bold text-blue-950">
              Why join more than one?
            </h2>
            <div className="mt-4 grid gap-3 text-sm font-semibold leading-6 text-blue-900 md:grid-cols-2">
              <p>Every publication is personalised to its own specialist area.</p>
              <p>Subscribe only to subjects that interest you.</p>
              <p>Manage subscriptions independently for each publication.</p>
              <p>Receive one newsletter per publication.</p>
              <p>Unsubscribe at any time.</p>
            </div>
          </section>
        </div>

        <FooterLinks />
      </section>
    </main>
  );
}
