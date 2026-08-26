"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

const DIRECT_HOME_KEY = "air-direct-home-v1";

type HomeHeroLinkProps = {
  className?: string;
  children?: ReactNode;
};

/**
 * A brand link is a deliberate way back to Air's complete product hero.
 * It is separate from a fresh visit, which should still be free to run the
 * cinematic introduction when the visitor's preferences allow it.
 */
export function HomeHeroLink({ className = "", children }: HomeHeroLinkProps) {
  const directToHero = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented) return;

    // Preserve standard browser behaviour for a modified click (new tab,
    // download, context menu). The direct-home presentation is only meant for
    // an in-place return to the Air homepage.
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    try {
      window.sessionStorage.setItem(DIRECT_HOME_KEY, "1");
    } catch {
      // The custom event below still handles same-page navigation when storage
      // is unavailable. A cross-route navigation fails open to the intro.
    }

    document.documentElement.dataset.airDirectHome = "true";

    if (window.location.pathname === "/") {
      // Let the hero own the same-page transition. Next's hash restoration
      // can otherwise run after the focus handoff and put the visitor back at
      // their previous scroll position.
      event.preventDefault();
      window.history.replaceState(null, "", "/#top");
      window.dispatchEvent(new CustomEvent("air:show-home-hero"));
    }
  };

  return (
    <Link
      className={className}
      href="/#top"
      aria-label="Air by WZRD.tech home"
      onClick={directToHero}
    >
      {children ?? (
        <>
          <span>air by</span>
          <Image
            src="/images/wzrd-wordmark.png"
            alt="WZRD.tech"
            width={1600}
            height={396}
            priority
          />
        </>
      )}
    </Link>
  );
}
