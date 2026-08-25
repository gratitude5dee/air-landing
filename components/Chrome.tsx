import Image from "next/image";
import Link from "next/link";

import { PreorderButton } from "@/components/Preorder";
import { AIR_TAGLINE } from "@/lib/air-copy";

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Air by WZRD.tech home">
        <span>air by</span>
        <Image src="/images/wzrd-wordmark.png" alt="WZRD.tech" width={1600} height={396} priority />
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/how-it-works">how it works</Link>
        <Link className="nav-optional" href="/composable-computer">composable computer</Link>
        <Link className="nav-optional" href="/#mini-apps">mini apps</Link>
        <Link className="nav-optional" href="/#pricing">pricing</Link>
        <PreorderButton compact label="join beta" />
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link className="brand footer-brand" href="/" aria-label="Air by WZRD.tech home">
            <span>air by</span>
            <Image src="/images/wzrd-wordmark.png" alt="WZRD.tech" width={1600} height={396} />
          </Link>
          <p>{AIR_TAGLINE}</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#top">Top</a>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/composable-computer">Composable computer</Link>
          <Link href="/capabilities">Capabilities</Link>
          <a href="/#mini-apps">Mini Apps</a>
          <a href="/#roadmap">Roadmap</a>
          <a href="/#pricing">Pricing</a>
          <a href="https://wzrd.tech" target="_blank" rel="noreferrer">WZRD.tech ↗</a>
        </nav>
        <div className="footer-meta">
          <span>air.wzrd.tech</span>
          <span>© {new Date().getFullYear()} 5DEE Studios</span>
        </div>
      </div>
    </footer>
  );
}
