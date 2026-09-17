import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type HomeHeroLinkProps = {
  className?: string;
  children?: ReactNode;
};

export function HomeHeroLink({ className = "", children }: HomeHeroLinkProps) {
  return (
    <Link className={className} href="/#top" aria-label="Air by WZRD.tech home">
      {children ?? (
        <>
          <span>air by</span>
          <Image src="/images/wzrd-wordmark.png" alt="WZRD.tech" width={1600} height={396} priority />
        </>
      )}
    </Link>
  );
}
