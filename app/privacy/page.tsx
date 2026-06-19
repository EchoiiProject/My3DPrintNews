import Link from "next/link";
import { FooterLinks } from "../footer-links";

const privacySections = [
  {
    title: "Contact Form Data",
    copy: "When you use the contact form, My3DPrintNews collects the name, email address, reason, and message you provide so we can review and respond to your request.",
  },
  {
    title: "Newsletter Data",
    copy: "Newsletter email collection is planned for a later sprint. When enabled, email addresses will be used to send the updates a user has requested and to manage subscription preferences.",
  },
  {
    title: "Local Preferences",
    copy: "Feed preferences are stored in localStorage on your device so the feed builder and personalised feed can remember your selected brands, creators, models, topics, technologies, frequency, and story count.",
  },
  {
    title: "Analytics And Cookies",
    copy: "Analytics and cookie-based tracking are not active unless they are added later. If analytics are introduced, this policy should be updated to explain what is collected and why.",
  },
  {
    title: "Deletion Requests",
    copy: "Users can request deletion of contact or newsletter data by contacting My3DPrintNews. Local preferences can also be cleared from the user's own browser storage.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link
            className="text-lg font-bold tracking-tight text-slate-950"
            href="/"
          >
            My3DPrintNews
          </Link>
          <Link className="text-sm font-medium text-slate-600 hover:text-blue-700" href="/">
            Feed Builder
          </Link>
        </nav>

        <div className="flex-1 py-12 lg:py-16">
          <p className="mb-5 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
            Privacy
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            This page explains the basic data handling approach for
            My3DPrintNews before the real domain and production integrations are
            connected.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {privacySections.map((section) => (
              <section
                className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur"
                key={section.title}
              >
                <h2 className="text-xl font-bold text-slate-950">
                  {section.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {section.copy}
                </p>
              </section>
            ))}
          </div>
        </div>

        <FooterLinks />
      </section>
    </main>
  );
}
