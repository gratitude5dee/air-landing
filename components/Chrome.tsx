import Image from "next/image";
import Link from "next/link";

import { PreorderButton } from "@/components/Preorder";

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Air by WZRD.tech home">
        <span>air by</span>
        <Image src="/images/wzrd-wordmark.png" alt="WZRD.tech" width={1600} height={396} priority />
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/how-it-works">how it works</Link>
        <Link className="nav-optional" href="/text-to-film">text to film</Link>
        <Link className="nav-optional" href="/capabilities">capabilities</Link>
        <PreorderButton compact />
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
          <p>Your personal creative assistant in your iMessages.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#top">Top</a>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/text-to-film">Text to film</Link>
          <Link href="/capabilities">Capabilities</Link>
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
