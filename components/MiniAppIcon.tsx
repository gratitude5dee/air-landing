"use client";

import type { ComponentType } from "react";
import {
  LuChartBar,
  LuCalendarDays,
  LuCircleDollarSign,
  LuContactRound,
  LuGlobe,
  LuImage,
  LuInbox,
  LuLaptop,
  LuLink2,
  LuLockKeyhole,
  LuShoppingBag,
  LuVideo,
} from "react-icons/lu";

const icons: Record<string, ComponentType<{ "aria-hidden"?: boolean }>> = {
  computer: LuLaptop,
  browser: LuGlobe,
  calendar: LuCalendarDays,
  inbox: LuInbox,
  people: LuContactRound,
  analytics: LuChartBar,
  image: LuImage,
  video: LuVideo,
  secrets: LuLockKeyhole,
  connect: LuLink2,
  pay: LuCircleDollarSign,
  storefront: LuShoppingBag,
};

export function MiniAppIcon({ iconKey }: { iconKey: string }) {
  const Icon = icons[iconKey] ?? LuLaptop;
  return <Icon aria-hidden />;
}
