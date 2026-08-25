export type MiniAppSafeguard = "Approval required";

export type MiniAppDomeItem = Readonly<{
  id: string;
  name: string;
  iconKey: string;
  summary: string;
  availability: "Private beta";
  safeguard?: MiniAppSafeguard;
}>;

/** A curated first-party set. Connector brands intentionally live elsewhere. */
export const AIR_MINI_APPS: readonly MiniAppDomeItem[] = [
  { id: "computer", name: "Computer", iconKey: "computer", summary: "Open and oversee Air’s persistent computer workspace.", availability: "Private beta" },
  { id: "browser", name: "Browser", iconKey: "browser", summary: "Research, browse, and take over browser work when needed.", availability: "Private beta" },
  { id: "calendar", name: "Calendar", iconKey: "calendar", summary: "Plan the next seven days with the same persistent context.", availability: "Private beta" },
  { id: "inbox", name: "Inbox", iconKey: "inbox", summary: "Read threads and prepare drafts in one focused workspace.", availability: "Private beta" },
  { id: "people", name: "People", iconKey: "people", summary: "Keep a personal CRM that your Air can help maintain.", availability: "Private beta" },
  { id: "analytics", name: "Analytics", iconKey: "analytics", summary: "See activity, funnels, opens, and revenue in context.", availability: "Private beta" },
  { id: "image", name: "Image Editor", iconKey: "image", summary: "Generate and edit layered images inside a focused creative tool.", availability: "Private beta" },
  { id: "video", name: "Video Editor", iconKey: "video", summary: "Build timelines, captions, and renders with your agent.", availability: "Private beta" },
  { id: "secrets", name: "Secrets", iconKey: "secrets", summary: "Use credentials with your review at the point of access.", availability: "Private beta", safeguard: "Approval required" },
  { id: "connect", name: "Connect", iconKey: "connect", summary: "Manage supported external toolkits and scoped access.", availability: "Private beta" },
  { id: "pay", name: "Pay", iconKey: "pay", summary: "Review fiat or USDC payments before they are sent.", availability: "Private beta", safeguard: "Approval required" },
  { id: "storefront", name: "Storefront", iconKey: "storefront", summary: "Manage products, checkout, and promotion in one place.", availability: "Private beta" },
] as const;
