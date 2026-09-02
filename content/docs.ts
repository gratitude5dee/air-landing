/**
 * The public documentation map at air.wzrd.tech/docs. Every entry is a route
 * at `app/docs/<slug>/page.tsx` that renders `content/docs/<file>.mdx`; the
 * sidebar, prev/next links, and the sitemap all read from this single list so
 * a page cannot exist without a place in the navigation.
 */
export type DocSection = "start" | "channels" | "reference";

export type DocPage = {
  slug: string;
  /** MDX file under content/docs, without extension. */
  file: string;
  href: `/docs${string}`;
  title: string;
  summary: string;
  section: DocSection;
};

export const docSections: readonly { id: DocSection; label: string }[] = [
  { id: "start", label: "Start here" },
  { id: "channels", label: "Your agent" },
  { id: "reference", label: "Reference" },
] as const;

export const docPages: readonly DocPage[] = [
  {
    slug: "",
    file: "overview",
    href: "/docs",
    title: "Overview",
    summary: "What Air is, what it is not, and how the pieces fit.",
    section: "start",
  },
  {
    slug: "getting-started",
    file: "getting-started",
    href: "/docs/getting-started",
    title: "Getting started",
    summary: "From invitation to your first text in a few minutes.",
    section: "start",
  },
  {
    slug: "imessage",
    file: "imessage",
    href: "/docs/imessage",
    title: "iMessage",
    summary: "Texting your agent, slash commands, photos, and approvals.",
    section: "channels",
  },
  {
    slug: "email",
    file: "email",
    href: "/docs/email",
    title: "Email",
    summary: "Your agent's inbox, drafting, and the send approval gate.",
    section: "channels",
  },
  {
    slug: "computer",
    file: "computer",
    href: "/docs/computer",
    title: "Computer",
    summary: "The private machine behind the thread: screen, browser, files.",
    section: "channels",
  },
  {
    slug: "mini-apps",
    file: "mini-apps",
    href: "/docs/mini-apps",
    title: "Mini-apps",
    summary: "Cards that open into small, single-purpose apps from Messages.",
    section: "channels",
  },
  {
    slug: "faq",
    file: "faq",
    href: "/docs/faq",
    title: "FAQ",
    summary: "Privacy, trust tiers, approvals, and what happens to your data.",
    section: "reference",
  },
] as const;

export function findDocPage(href: string): DocPage | undefined {
  const normalized = href.replace(/\/+$/, "") || "/docs";
  return docPages.find((page) => page.href === normalized);
}

export function adjacentDocPages(href: string): { previous?: DocPage; next?: DocPage } {
  const index = docPages.findIndex((page) => page.href === href);
  if (index === -1) return {};
  return { previous: docPages[index - 1], next: docPages[index + 1] };
}
